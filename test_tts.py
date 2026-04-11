#!/usr/bin/env python3
"""
ZenSleep TTS Worker 快速测试
"""

import os
import sys
from pathlib import Path

def test_imports():
    """测试必要的库是否可以导入"""
    try:
        import torch
        print(f"✅ PyTorch 版本: {torch.__version__}")

        import TTS
        print(f"✅ TTS 版本: {TTS.__version__}")

        import soundfile
        print("✅ soundfile 可用")

        import pydub
        print("✅ pydub 可用")

        import noisereduce
        print("✅ noisereduce 可用")

        import scipy
        print("✅ scipy 可用")

        import numpy
        print("✅ numpy 可用")

        return True
    except ImportError as e:
        print(f"❌ 缺少依赖: {e}")
        return False

def test_script_parsing():
    """测试脚本文件解析"""
    try:
        # 导入脚本解析函数
        sys.path.append('.')
        from tts_worker import ZenSleepTTSWorker

        # 测试解析脚本
        scripts_file = Path('src/data/scripts.ts')
        if scripts_file.exists():
            scripts = ZenSleepTTSWorker.load_scripts_from_ts(str(scripts_file))
            print(f"✅ 成功解析 {len(scripts)} 个脚本")
            return True
        else:
            print("❌ scripts.ts 文件不存在")
            return False
    except Exception as e:
        print(f"❌ 脚本解析测试失败: {e}")
        return False

def main():
    print("=== ZenSleep TTS Worker 快速测试 ===\n")

    # 测试 1: 导入测试
    print("1. 测试依赖导入...")
    if not test_imports():
        print("\n请运行: pip install -r requirements.txt")
        return 1

    # 测试 2: 脚本解析测试
    print("\n2. 测试脚本解析...")
    if not test_script_parsing():
        return 1

    print("\n🎉 所有测试通过！可以运行 TTS Worker")
    print("运行命令: ./run_tts.sh")
    return 0

if __name__ == "__main__":
    sys.exit(main())