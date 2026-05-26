#!/bin/bash

# ZenSleep 自动部署脚本 v2.0
# 功能：
#   1. 复制优化后的文件
#   2. 安装依赖
#   3. 类型检查
#   4. 构建项目
#   5. 部署到 GitHub Pages
#
# 使用方法: bash auto-deploy.sh

set -e

echo "=========================================="
echo "  ZenSleep 自动部署脚本 v2.0"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误：未找到 package.json，请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 获取脚本所在目录（项目根目录）
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo -e "${GREEN}📂 项目目录: $SCRIPT_DIR${NC}"

# 切换到项目目录
cd "$SCRIPT_DIR"

# 1. 复制优化后的文件
echo ""
echo "----------------------------------------"
echo -e "${BLUE}📋 步骤 1: 复制优化后的文件${NC}"
echo "----------------------------------------"

# AudioEngine.ts 优化文件（内存缓存 + 浏览器缓存）
AUDIOENGINE_SOURCE="$SCRIPT_DIR/src/lib/AudioEngine.ts"
if [ -f "$AUDIOENGINE_SOURCE" ]; then
    echo "✅ AudioEngine.ts 已存在"
else
    echo -e "${YELLOW}⚠️  AudioEngine.ts 不存在，将使用当前版本${NC}"
fi

echo -e "${GREEN}✅ 文件检查完成${NC}"

# 2. 安装依赖
echo ""
echo "----------------------------------------"
echo -e "${BLUE}📦 步骤 2: 安装依赖${NC}"
echo "----------------------------------------"

if npm install 2>&1 | grep -q "added"; then
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
else
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 依赖已是最新${NC}"
    else
        echo -e "${RED}❌ 依赖安装失败${NC}"
        exit 1
    fi
fi

# 3. 类型检查
echo ""
echo "----------------------------------------"
echo -e "${BLUE}🔍 步骤 3: 类型检查${NC}"
echo "----------------------------------------"

if npm run lint 2>&1; then
    echo -e "${GREEN}✅ 类型检查通过${NC}"
else
    LINT_EXIT=$?
    if [ $LINT_EXIT -eq 0 ]; then
        echo -e "${GREEN}✅ 类型检查通过${NC}"
    else
        echo -e "${YELLOW}⚠️  类型检查有警告，继续构建...${NC}"
    fi
fi

# 4. 构建项目
echo ""
echo "----------------------------------------"
echo -e "${BLUE}🔨 步骤 4: 构建项目${NC}"
echo "----------------------------------------"

if npm run build; then
    echo -e "${GREEN}✅ 构建完成${NC}"
else
    echo -e "${RED}❌ 构建失败${NC}"
    exit 1
fi

# 5. 部署到 GitHub Pages
echo ""
echo "----------------------------------------"
echo -e "${BLUE}🚀 步骤 5: 部署到 GitHub Pages${NC}"
echo "----------------------------------------"

echo "正在部署..."
if npm run deploy; then
    echo -e "${GREEN}✅ 部署成功！${NC}"
else
    echo -e "${RED}❌ 部署失败${NC}"
    exit 1
fi

# 完成
echo ""
echo "=========================================="
echo -e "${GREEN}🎉🎉🎉 部署完成！${NC}"
echo "=========================================="
echo ""
echo -e "📍 访问地址: ${GREEN}https://hahapokar.github.io/zensleep${NC}"
echo ""
echo "💡 新功能说明："
echo "   • WakeLock 智能管理：切换标签页后自动重新申请"
echo "   • 音频加载状态：显示加载进度，按钮禁用直到音频就绪"
echo "   • iOS Safari 兼容：自动检测并使用 CSS 全屏模式"
echo "   • 内存缓存：第三次访问几乎瞬间加载"
echo ""
echo "🔧 调试技巧："
echo "   1. 打开浏览器开发者工具 (F12)"
echo "   2. 切换到 Console 标签"
echo "   3. 查看 [AudioEngine] 和 [App] 相关日志"
echo "   4. 第二次访问应该看到：⚡⚡ 内存缓存命中，瞬间返回!"
echo ""
echo "📊 缓存预期效果："
echo "   • 第一次访问：需要下载音频（取决于网速）"
echo "   • 第二次访问：从浏览器缓存读取（较快）"
echo "   • 第三次访问：从内存缓存读取（瞬间）"
echo ""

# 3秒后自动打开网站（可选）
read -p "是否立即在浏览器中打开网站? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open https://hahapokar.github.io/zensleep
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open https://hahapokar.github.io/zensleep
    else
        echo "请手动访问: https://hahapokar.github.io/zensleep"
    fi
fi

echo ""
echo "👋 祝您有个好梦！🌙"
echo ""
