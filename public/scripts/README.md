# ZenSleep 脚本和音频资源目录结构

本目录包含ZenSleep应用的不同模式所需的脚本文字和音频文件。

## 目录结构

```
public/
├── scripts/           # 脚本文字文件
│   ├── nsdr/         # NSDR (非睡眠深度放松) 模式脚本
│   │   ├── nsdr-basic.txt          # 基础NSDR放松脚本
│   │   ├── nsdr-progressive.txt    # 渐进式肌肉松弛NSDR
│   │   ├── nsdr-meditation.txt     # 正念冥想NSDR
│   │   └── nsdr-body-scan.txt      # 身体扫描NSDR
│   └── sleep/        # 睡眠引导模式脚本
│       ├── sleep-basic.txt         # 基础睡眠引导
│       ├── sleep-deep.txt          # 深度睡眠引导
│       ├── sleep-countdown.txt     # 倒计时睡眠引导
│       ├── sleep-visualization.txt # 睡眠意象引导
│       └── sleep-body-focus.txt    # 身体专注睡眠引导
└── audio/            # 音频文件 (由TTS生成)
    ├── nsdr/         # NSDR模式音频文件
    └── sleep/        # 睡眠模式音频文件
```

## 脚本文件说明

### NSDR (非睡眠深度放松) 模式
- **目标**: 在清醒状态下达到深度放松
- **特点**: 保持意识清醒，同时深度放松身体和心灵
- **适用场景**: 白天放松、冥想练习、压力缓解

### 睡眠模式
- **目标**: 帮助用户快速进入深度睡眠
- **特点**: 引导意识逐渐下沉，最终进入睡眠状态
- **适用场景**: 晚上入睡、改善睡眠质量

## 使用说明

1. **脚本文件**: 纯文本格式，每行一句引导语
2. **音频文件**: 由TTS Worker根据脚本生成
3. **文件命名**: 使用英文横线分隔，格式为 `{mode}-{type}.txt`

## 开发说明

- 脚本内容应使用温和、舒缓的语言
- 句子长度适中，便于语音合成
- 可以根据用户反馈调整脚本内容
- 音频文件会根据脚本自动生成和更新