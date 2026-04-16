/**
 * 内容管理器 - 处理脚本和资源文件的映射
 */

import { ScriptManager, SCRIPTS } from '../data/scripts';

export interface ContentConfig {
  constitution: string;
  symptoms: string[];
  sessionDuration: number;
  voiceSettings: {
    rate: number;
    pitch: number;
  };
  scriptSequence: string[]; // 脚本在播放顺序中的 key
  musicTracks: string[]; // 音乐文件路径
  audioFile?: string; // MP3音频文件路径
}

export class ContentManager {
  /**
   * 根据用户偏好生成内容配置
   */
  static generateContentConfig(
    constitution: string,
    symptoms: string[],
    nsdrDuration?: number,
    sleepOption?: string
  ): ContentConfig {
    // 基础语音设置
    const voiceSettings = { rate: 0.5, pitch: 0.6 };
    
    // 确定会话时长
    let sessionDuration = 1200; // 默认 20 分钟
    if (symptoms.includes('nsdr')) {
      // NSDR模式使用指定的时长
      sessionDuration = nsdrDuration || 1800; // 默认30分钟
    } else if (symptoms.includes('sleep')) {
      // 夜晚助眠模式，根据选项确定时长
      if (sleepOption) {
        const script = SCRIPTS[`sleep-${sleepOption}`];
        sessionDuration = script?.duration || 1200;
      } else {
        sessionDuration = 1200; // 默认20分钟
      }
    }

    // 构建脚本序列
    const scriptSequence = this.buildScriptSequence(constitution, symptoms, nsdrDuration, sleepOption);
    
    // 构建音乐列表
    const musicTracks = this.buildMusicList(symptoms);
    
    // 添加MP3音频文件路径
    let audioFile: string | undefined;
    const baseUrl = import.meta.env.BASE_URL || '/';
    if (symptoms.includes('nsdr')) {
      if (nsdrDuration === 600) {
        audioFile = `${baseUrl}audio/nsdr/nsdr-power-recharge.mp3`;
      } else if (nsdrDuration === 1200) {
        audioFile = `${baseUrl}audio/nsdr/nsdr-stress-reset.mp3`;
      } else {
        audioFile = `${baseUrl}audio/nsdr/nsdr-deep-recovery.mp3`;
      }
    } else if (symptoms.includes('sleep') && sleepOption) {
      audioFile = `${baseUrl}audio/sleep/sleep-${sleepOption}.mp3`;
    }

    return {
      constitution,
      symptoms,
      sessionDuration,
      voiceSettings,
      scriptSequence,
      musicTracks,
      audioFile,
    };
  }

  /**
   * 构建脚本播放序列
   */
  private static buildScriptSequence(
    constitution: string,
    symptoms: string[],
    nsdrDuration?: number,
    sleepOption?: string
  ): string[] {
    // 如果有症状，使用第一个症状对应的推荐序列
    if (symptoms.length > 0) {
      const primarySymptom = symptoms[0];
      // 检查是否是有效的 SymptomType
      const validSymptoms = ['nsdr', 'sleep'];
        if (validSymptoms.includes(primarySymptom)) {
        if (primarySymptom === 'nsdr') {
          // NSDR返回时长对应的脚本
          if (nsdrDuration === 600) {
            return ['nsdr-power-recharge'];
          } else if (nsdrDuration === 1200) {
            return ['nsdr-stress-reset'];
          } else {
            return ['nsdr-deep-recovery']; // 默认30分钟
          }
        } else if (primarySymptom === 'sleep' && sleepOption) {
          // 根据睡眠选项返回特定序列
          const sleepSequences: Record<string, string[]> = {
            'clear-mind': ['sleep-clear-mind'],
            'relax-body': ['sleep-relax-body'],
            'calm-heart': ['sleep-calm-heart'],
            'cool-down': ['sleep-cool-down'],
            'serene': ['sleep-serene'],
          };
          return sleepSequences[sleepOption] || ScriptManager.getRecommendedScriptSequence('sleep');
        }
        return ScriptManager.getRecommendedScriptSequence(primarySymptom);
      } else {
        console.warn(`Unknown symptom: ${primarySymptom}, falling back to general`);
      }
    }

    // 默认使用通用序列
    return ScriptManager.getRecommendedScriptSequence('general');
  }

  /**
   * 构建音乐列表
   */
  private static buildMusicList(symptoms: string[]): string[] {
    const musicMap: Record<string, string> = {
      insomnia: '/music/relaxation_slow.mp3',
      anxious: '/music/calming_theta.mp3',
      tired: '/music/deep_rest.mp3',
      nightmare: '/music/peaceful_delta.mp3',
      wakeability: '/music/deep_protection.mp3',
      'stress-relief': '/music/meditation_flow.mp3',
      nsdr: '/music/meditation_flow.mp3',
      sleep: '/music/brainwave_delta.mp3',
    };

    // 默认背景音乐
    const tracks = [
      '/music/brainwave_alpha.mp3', // Alpha 脑波
      '/music/pink_noise_base.mp3', // 粉红噪音
    ];

    // 添加症状相关音乐
    symptoms.forEach((symptomId) => {
      if (musicMap[symptomId]) {
        tracks.push(musicMap[symptomId]);
      }
    });

    return tracks;
  }

  /**
   * 获取脚本文本数组
   */
  static getScriptTexts(scriptKeys: string[]): string[] {
    const texts: string[] = [];
    scriptKeys.forEach((key) => {
      const script = SCRIPTS[key];
      if (script) {
        texts.push(...script.content);
      }
    });
    return texts;
  }

  /**
   * 获取可用的背景音乐文件
   */
  static getAvailableMusicFiles(): string[] {
    return [
      '/music/brainwave_alpha.mp3',
      '/music/brainwave_theta.mp3',
      '/music/brainwave_delta.mp3',
      '/music/pink_noise_base.mp3',
      '/music/relaxation_slow.mp3',
      '/music/calming_theta.mp3',
      '/music/deep_rest.mp3',
      '/music/peaceful_delta.mp3',
      '/music/deep_protection.mp3',
      '/music/meditation_flow.mp3',
    ];
  }

  /**
   * 获取可用的脚本文件
   */
  static getAvailableScriptFiles(): string[] {
    return Object.keys(SCRIPTS);
  }
}
