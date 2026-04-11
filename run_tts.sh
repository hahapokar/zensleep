#!/bin/bash
# ZenSleep TTS Worker 运行脚本

echo "=== ZenSleep TTS Worker ==="
echo "真人发音生成工具"
echo ""

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 未安装，请先安装 Python 3"
    exit 1
fi

echo "✅ Python 3 已安装"

# 检查是否安装了依赖
echo "📦 检查依赖..."
python3 -c "import TTS, soundfile, pydub, noisereduce, scipy, numpy" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ 缺少依赖，正在安装..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

echo ""
echo "🎯 开始生成真人发音..."

# 创建输出目录
mkdir -p public/audio

# 运行 TTS Worker
python3 tts_worker.py "$@"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 TTS 生成完成！"
    echo "📁 音频文件保存在: public/audio/"
    echo "📋 查看 TTS_WORKER_README.md 了解更多信息"
else
    echo ""
    echo "❌ TTS 生成失败"
    exit 1
fi