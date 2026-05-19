#!/bin/bash

# ZenSleep 快速部署脚本
# 使用方法: bash deploy.sh

set -e

echo "🚀 ZenSleep 部署开始..."

# 1. 构建
echo "📦 构建项目..."
npm run build

# 2. 检查 gh-pages 是否安装
if ! command -v gh-pages &> /dev/null; then
    echo "❌ gh-pages 未安装，正在安装..."
    npm install gh-pages --save-dev
fi

# 3. 部署
echo "🌐 部署到 GitHub Pages..."
npx gh-pages -d dist --nojekyll

echo "✅ 部署成功！"
echo "📍 访问: https://hahapokar.github.io/zensleep"
