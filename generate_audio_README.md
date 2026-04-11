# ZenSleep 音频文件生成脚本

此脚本用于为不同的模式生成对应的音频文件。

## 使用方法

```bash
# 生成NSDR模式的所有音频文件
python tts_worker.py --mode nsdr

# 生成睡眠模式的所有音频文件
python tts_worker.py --mode sleep

# 生成特定脚本的音频文件
python tts_worker.py --script nsdr-basic
```

## 输出目录

音频文件将生成到以下目录：
- `public/audio/nsdr/` - NSDR模式音频文件
- `public/audio/sleep/` - 睡眠模式音频文件

## 文件命名约定

音频文件命名格式：`{script-key}_{emotion}_{index}.wav`

例如：
- `nsdr-basic_calm_001.wav`
- `sleep-deep_soothing_001.wav`

## 注意事项

1. 确保TTS环境已正确配置
2. 音频文件较大，生成时间较长
3. 可以根据需要调整语音参数