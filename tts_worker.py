#!/usr/bin/env python3
"""
ZenSleep TTS Worker - 真人发音生成器
使用 Coqui TTS 生成最接近真人的发音，包括呼吸声效果
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import Dict, List, Optional
import numpy as np
import torch
from TTS.api import TTS
import soundfile as sf
from scipy.io import wavfile
import noisereduce as nr
from pydub import AudioSegment
from pydub.effects import normalize
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ZenSleepTTSWorker:
    """ZenSleep TTS Worker - 生成真人发音的工具"""

    def __init__(self, model_name: str = "tts_models/en/ljspeech/tacotron2-DDC_ph"):
        """
        初始化 TTS Worker

        Args:
            model_name: TTS 模型名称，选择最接近真人的模型
        """
        self.model_name = model_name
        self.tts = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # 支持的中文模型（按真人程度排序）
        self.chinese_models = [
            "tts_models/zh-cn/baker/tacotron2-DDC_ph",  # 最接近真人，有呼吸声
            "tts_models/zh-cn/baker/tacotron2-DCA",
            "tts_models/zh-cn/baker/tacotron2-DCA_ph",
            "tts_models/zh-cn/baker/speedy-speech",
        ]

        # 音频处理参数
        self.sample_rate = 22050
        self.breathing_intensity = 0.3  # 呼吸声强度

    def initialize_tts(self):
        """初始化 TTS 引擎"""
        try:
            logger.info(f"初始化 TTS 模型: {self.model_name}")
            logger.info(f"使用设备: {self.device}")

            # 尝试中文模型
            for model in self.chinese_models:
                try:
                    self.tts = TTS(model).to(self.device)
                    self.model_name = model
                    logger.info(f"成功加载中文模型: {model}")
                    break
                except Exception as e:
                    logger.warning(f"加载模型 {model} 失败: {e}")
                    continue

            if self.tts is None:
                raise Exception("无法加载任何中文 TTS 模型")

        except Exception as e:
            logger.error(f"TTS 初始化失败: {e}")
            raise

    def add_breathing_sound(self, audio: np.ndarray, sample_rate: int) -> np.ndarray:
        """
        为音频添加自然的呼吸声效果

        Args:
            audio: 原始音频数据
            sample_rate: 采样率

        Returns:
            添加呼吸声后的音频
        """
        # 创建呼吸声模式（低频噪声）
        duration = len(audio) / sample_rate
        breathing_freq = 0.2  # 呼吸频率 (Hz)

        # 生成呼吸波形
        t = np.linspace(0, duration, len(audio), False)
        breathing_wave = np.sin(2 * np.pi * breathing_freq * t) * self.breathing_intensity

        # 应用低通滤波模拟呼吸声
        from scipy.signal import butter, filtfilt
        b, a = butter(4, 200/(sample_rate/2), btype='low')
        breathing_filtered = filtfilt(b, a, breathing_wave)

        # 只在句子间隙添加呼吸声
        # 检测静音段
        threshold = np.max(np.abs(audio)) * 0.1
        silent_mask = np.abs(audio) < threshold

        # 在静音段添加呼吸声
        enhanced_audio = audio.copy()
        breathing_indices = np.where(silent_mask)[0]

        if len(breathing_indices) > 0:
            # 随机选择一些静音段添加呼吸声
            breathing_positions = np.random.choice(
                breathing_indices,
                size=min(len(breathing_indices)//10, len(breathing_indices)),
                replace=False
            )

            for pos in breathing_positions:
                if pos + len(breathing_filtered) < len(enhanced_audio):
                    # 渐入渐出效果
                    fade_length = min(1000, len(breathing_filtered)//4)
                    fade_in = np.linspace(0, 1, fade_length)
                    fade_out = np.linspace(1, 0, fade_length)

                    breathing_segment = breathing_filtered[:fade_length*4]
                    breathing_segment[:fade_length] *= fade_in
                    breathing_segment[-fade_length:] *= fade_out

                    enhanced_audio[pos:pos+len(breathing_segment)] += breathing_segment

        return enhanced_audio

    def generate_speech(self, text: str, output_path: str,
                       emotion: str = "calm", speed: float = 1.0) -> bool:
        """
        生成真人发音的语音

        Args:
            text: 要转换的文本
            output_path: 输出文件路径
            emotion: 情感类型 (calm, warm, soothing)
            speed: 语速 (0.5-2.0)

        Returns:
            是否成功
        """
        try:
            logger.info(f"生成语音: {text[:50]}...")

            # TTS 参数配置
            tts_config = {
                "text": text,
                "file_path": output_path,
                "speed": speed,
            }

            # 根据情感调整参数
            if emotion == "calm":
                tts_config.update({
                    "emotion": "calm",
                    "pitch_shift": -0.1,  # 稍微降低音调
                })
            elif emotion == "warm":
                tts_config.update({
                    "emotion": "warm",
                    "pitch_shift": 0.05,  # 稍微提高音调
                })
            elif emotion == "soothing":
                tts_config.update({
                    "emotion": "soothing",
                    "speed": speed * 0.9,  # 放慢语速
                    "pitch_shift": -0.05,
                })

            # 生成语音
            self.tts.tts_to_file(**{k: v for k, v in tts_config.items()
                                  if k in ['text', 'file_path', 'speed']})

            # 后处理：添加呼吸声
            if os.path.exists(output_path):
                self.post_process_audio(output_path, emotion)

            logger.info(f"语音生成成功: {output_path}")
            return True

        except Exception as e:
            logger.error(f"语音生成失败: {e}")
            return False

    def post_process_audio(self, file_path: str, emotion: str):
        """音频后处理：添加呼吸声、降噪、归一化"""
        try:
            # 读取音频
            audio = AudioSegment.from_wav(file_path)

            # 转换为 numpy 数组进行处理
            samples = np.array(audio.get_array_of_samples())
            if audio.channels == 2:
                samples = samples.reshape((-1, 2)).mean(axis=1)

            # 添加呼吸声
            enhanced_samples = self.add_breathing_sound(samples.astype(np.float32), audio.frame_rate)

            # 降噪
            enhanced_samples = nr.reduce_noise(
                y=enhanced_samples,
                sr=audio.frame_rate,
                stationary=True,
                prop_decrease=0.8
            )

            # 归一化音量
            enhanced_samples = enhanced_samples / np.max(np.abs(enhanced_samples)) * 0.8

            # 保存处理后的音频
            sf.write(file_path, enhanced_samples, audio.frame_rate)

            logger.info(f"音频后处理完成: {file_path}")

        except Exception as e:
            logger.warning(f"音频后处理失败: {e}")

    def generate_script_audio(self, script_key: str, script_data: Dict,
                            output_dir: str, emotion: str = "calm") -> List[str]:
        """
        为整个脚本生成音频文件

        Args:
            script_key: 脚本键名
            script_data: 脚本数据
            output_dir: 输出目录
            emotion: 情感类型

        Returns:
            生成的音频文件路径列表
        """
        audio_files = []
        content = script_data.get('content', [])

        for i, text in enumerate(content):
            if not text.strip():
                continue

            # 生成文件名
            filename = f"{script_key}_{i+1:02d}.wav"
            output_path = os.path.join(output_dir, filename)

            # 根据脚本类型调整情感
            script_emotion = emotion
            if "insomnia" in script_key:
                script_emotion = "soothing"
            elif "anxious" in script_key:
                script_emotion = "calm"
            elif "tired" in script_key:
                script_emotion = "warm"

            # 生成语音
            if self.generate_speech(text, output_path, script_emotion):
                audio_files.append(filename)

        return audio_files

    def process_symptom_scripts(self, scripts_data: Dict, output_base_dir: str):
        """
        处理所有症状相关的脚本，生成对应的音频文件

        Args:
            scripts_data: 脚本数据字典
            output_base_dir: 输出基础目录
        """
        # 按症状分组的脚本
        symptom_scripts = {
            'insomnia': ['insomnia_intro'],
            'anxious': ['anxious_intro'],
            'tired': ['tired_intro'],
            'nightmare': ['nightmare_intro'],
            'wakeability': ['wakeability_intro'],
            'stress-relief': ['stress_relief_intro'],
            'general': ['welcome_standard', 'deepening_standard', 'breathing_sync', 'awakening']
        }

        for symptom, script_keys in symptom_scripts.items():
            symptom_dir = os.path.join(output_base_dir, symptom)
            os.makedirs(symptom_dir, exist_ok=True)

            logger.info(f"处理症状: {symptom}")

            for script_key in script_keys:
                if script_key in scripts_data:
                    script_data = scripts_data[script_key]
                    audio_files = self.generate_script_audio(
                        script_key, script_data, symptom_dir
                    )

                    logger.info(f"  {script_key}: 生成 {len(audio_files)} 个音频文件")

                    # 生成索引文件
                    index_file = os.path.join(symptom_dir, f"{script_key}_index.json")
                    with open(index_file, 'w', encoding='utf-8') as f:
                        json.dump({
                            'script_key': script_key,
                            'title': script_data.get('title', ''),
                            'audio_files': audio_files,
                            'duration': script_data.get('duration', 0),
                            'symptom': symptom
                        }, f, ensure_ascii=False, indent=2)

def load_scripts_from_ts(ts_file_path: str) -> Dict:
    """
    从 TypeScript 文件中提取脚本数据
    注意：这是一个简化的解析器，实际使用时可能需要更复杂的解析
    """
    scripts = {}

    try:
        with open(ts_file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 简单的正则提取（实际项目中建议使用 AST 解析）
        import re

        # 提取脚本对象
        script_pattern = r'(\w+):\s*\{([^}]+)\}'
        matches = re.findall(script_pattern, content, re.DOTALL)

        for script_key, script_content in matches:
            if script_key in ['key', 'title', 'content', 'duration']:
                continue

            # 提取各个字段
            key_match = re.search(r"key:\s*'([^']+)'", script_content)
            title_match = re.search(r"title:\s*'([^']+)'", script_content)
            duration_match = re.search(r'duration:\s*(\d+)', script_content)

            # 提取 content 数组
            content_match = re.search(r'content:\s*\[([^\]]+)\]', script_content, re.DOTALL)
            content_list = []
            if content_match:
                content_str = content_match.group(1)
                # 提取引号内的字符串
                strings = re.findall(r"'([^']*)'", content_str)
                content_list = [s.strip() for s in strings if s.strip()]

            if key_match and title_match and duration_match:
                scripts[script_key] = {
                    'key': key_match.group(1),
                    'title': title_match.group(1),
                    'content': content_list,
                    'duration': int(duration_match.group(1))
                }

    except Exception as e:
        logger.error(f"解析 TypeScript 文件失败: {e}")
        # 返回硬编码的脚本数据作为后备
        scripts = {
            'welcome_standard': {
                'key': 'welcome_standard',
                'title': '标准欢迎',
                'content': [
                    '欢迎进入 ZenSleep 深层睡眠空间。',
                    '现在，请调整到最舒服的姿势。',
                    '用枕头支撑好你的脖子，让整个身体都能放松下来。',
                    '如果有需要，可以盖好被子，确保温度舒适。',
                ],
                'duration': 45,
            },
            'insomnia_intro': {
                'key': 'insomnia_intro',
                'title': '难以入睡导语',
                'content': [
                    '欢迎来到 ZenSleep。我知道有些夜晚，入睡对你来说并不容易。',
                    '无论你最近经历了什么，让我来引导你。',
                    '感受你的呼吸，它将成为你进入梦想的指南针。',
                    '现在，请闭上眼睛，让这温暖的空间包围你。',
                ],
                'duration': 60,
            },
            'anxious_intro': {
                'key': 'anxious_intro',
                'title': '焦虑烦躁导语',
                'content': [
                    '欢迎来到 ZenSleep 平静之地。',
                    '我感受到你内心的躁动。现在，让我们一起把这份烦躁转化为深深的放松。',
                    '想象一片无边的深蓝色夜空，星星点缀其中，柔和而遥远。',
                ],
                'duration': 65,
            },
        }

    return scripts

def main():
    parser = argparse.ArgumentParser(description='ZenSleep TTS Worker - 真人发音生成器')
    parser.add_argument('--scripts-file', type=str, default='src/data/scripts.ts',
                       help='脚本 TypeScript 文件路径')
    parser.add_argument('--output-dir', type=str, default='public/audio',
                       help='输出音频目录')
    parser.add_argument('--model', type=str,
                       default='tts_models/zh-cn/baker/tacotron2-DDC_ph',
                       help='TTS 模型名称')
    parser.add_argument('--symptom', type=str, nargs='*',
                       help='指定要处理的症状 (默认处理所有)')

    args = parser.parse_args()

    # 创建输出目录
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # 初始化 TTS Worker
    worker = ZenSleepTTSWorker(args.model)
    worker.initialize_tts()

    # 加载脚本数据
    scripts_file = Path(args.scripts_file)
    if scripts_file.exists():
        scripts_data = load_scripts_from_ts(str(scripts_file))
        logger.info(f"加载了 {len(scripts_data)} 个脚本")
    else:
        logger.error(f"脚本文件不存在: {scripts_file}")
        return 1

    # 处理脚本
    worker.process_symptom_scripts(scripts_data, args.output_dir)

    logger.info("TTS 处理完成！")
    return 0

if __name__ == "__main__":
    sys.exit(main())