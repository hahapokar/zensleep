# ZenSleep TTS Worker

真人发音生成工具，用于将 ZenSleep 的脚本转换为最接近真人的语音文件。

## 功能特点

- 🎯 **最接近真人发音**：使用 Coqui TTS 的中文模型，包含自然呼吸声
- 🎭 **情感化语音**：根据脚本类型自动调整情感（calm、soothing、warm）
- 📁 **按症状分类**：脚本按症状组织，支持个性化语音生成
- 🔊 **音频后处理**：自动添加呼吸声、降噪、音量标准化
- 🚀 **批量处理**：一次性生成所有症状对应的语音文件

## 安装依赖

```bash
pip install -r requirements.txt
```

## 使用方法

### 1. 生成所有症状的语音

```bash
python tts_worker.py
```

### 2. 生成特定症状的语音

```bash
python tts_worker.py --symptom insomnia anxious
```

### 3. 自定义输出目录

```bash
python tts_worker.py --output-dir ./custom_audio
```

### 4. 使用不同 TTS 模型

```bash
python tts_worker.py --model tts_models/zh-cn/baker/tacotron2-DDC_ph
```

## 脚本组织结构

脚本按症状分类存储在 `src/data/symptoms/` 目录：

- `insomnia.ts` - 难以入睡
- `anxious.ts` - 焦虑烦躁
- `tired.ts` - 身心疲劳
- `nightmare.ts` - 梦魇困扰
- `wakeability.ts` - 易醒
- `stress-relief.ts` - 压力释放
- `general.ts` - 通用脚本

## 输出结构

生成的音频文件按以下结构组织：

```
public/audio/
├── insomnia/
│   ├── insomnia_intro_01.wav
│   ├── insomnia_intro_02.wav
│   ├── insomnia_deepening_01.wav
│   └── insomnia_intro_index.json
├── anxious/
│   ├── anxious_intro_01.wav
│   └── anxious_intro_index.json
└── ...
```

每个脚本目录包含：
- 语音文件（`_01.wav`, `_02.wav` 等）
- 索引文件（`_index.json`）包含元数据

## 情感映射

不同脚本类型使用不同的情感：

- **soothing**: 难以入睡、易醒 - 舒缓语速，降低音调
- **calm**: 焦虑、梦魇、压力 - 平稳语调
- **warm**: 疲劳、一般欢迎 - 温暖语调，稍高音调

## 技术细节

### TTS 模型选择

按真人程度排序的中文模型：
1. `tts_models/zh-cn/baker/tacotron2-DDC_ph` ⭐⭐⭐⭐⭐
2. `tts_models/zh-cn/baker/tacotron2-DCA`
3. `tts_models/zh-cn/baker/tacotron2-DCA_ph`
4. `tts_models/zh-cn/baker/speedy-speech`

### 呼吸声生成

- 使用低频正弦波模拟自然呼吸
- 随机分布在句子间隙
- 渐入渐出效果避免突兀

### 音频后处理

1. **降噪**：使用 noisereduce 库去除背景噪声
2. **标准化**：音量标准化到 80% 最大值
3. **呼吸声叠加**：在静音段添加自然呼吸效果

## 在应用中使用

在 ZenSleep 应用中，根据用户选择的症状加载对应的语音文件：

```typescript
import { ScriptManager } from './data/scripts';

// 获取症状对应的脚本序列
const scriptSequence = ScriptManager.getRecommendedScriptSequence('insomnia');

// 获取特定脚本的情感
const emotion = ScriptManager.getScriptEmotion('insomnia', 'insomnia_intro');
```

## 注意事项

- 首次运行需要下载 TTS 模型，可能需要一些时间
- 生成高质量音频需要较长时间，建议提前批量生成
- 输出音频为 16-bit WAV 格式，适合 Web 播放
- 确保有足够的磁盘空间存储音频文件

## 故障排除

### 模型下载失败
```bash
# 手动指定模型路径或使用代理
export HTTP_PROXY=http://proxy.example.com:8080
python tts_worker.py
```

### 内存不足
```bash
# 使用较小的模型
python tts_worker.py --model tts_models/zh-cn/baker/speedy-speech
```

### 音频质量问题
- 检查输入文本编码（应为 UTF-8）
- 调整语速参数（speed: 0.8-1.2）
- 尝试不同的情感设置