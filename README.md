# ZenSleep - 智能睡眠引导应用

<div align="center">
<img width="800" height="400" alt="ZenSleep Banner" src="https://via.placeholder.com/800x400/1a1a2e/ffffff?text=ZenSleep" />
</div>

## 🎵 音频播放测试

### 测试 NSDR 30分钟模式
1. 访问: https://hahapokar.github.io/zensleep/
2. 选择 "NSDR 非睡眠放松"
3. 选择 "30分钟" 选项
4. 点击 "开始休息引导"
5. 应该能听到音频播放

### 验证音频文件访问
- ✅ NSDR 30分钟: https://hahapokar.github.io/zensleep/audio/nsdr/nsdr-deep-recovery.mp3

## 🚀 本地开发

**环境要求:** Node.js

1. 安装依赖:
   ```bash
   npm install
   ```

2. 启动开发服务器:
   ```bash
   npm run dev
   ```

3. 构建生产版本:
   ```bash
   npm run build
   ```

4. 部署到 GitHub Pages:
   ```bash
   npm run deploy
   ```

## 📁 项目结构

```
zensleep/
├── src/
│   ├── components/          # React 组件
│   ├── lib/                 # 核心逻辑
│   └── data/                # 数据配置
├── public/
│   └── audio/               # 音频文件
│       ├── nsdr/            # NSDR 音频
│       └── sleep/           # 睡眠音频
└── dist/                    # 构建输出
```

## 🎯 功能特性

- **NSDR 模式**: 非睡眠深度放松 (10/20/30分钟)
- **睡眠引导**: 5种不同场景的睡眠引导
- **音频播放**: 直接播放 MP3 音频文件
- **响应式设计**: 支持移动端和桌面端

## 📝 最近更新

- ✅ 修复音频播放 404 错误
- ✅ 添加动态 base 路径支持
- ✅ 优化 UI 文本和按钮间距
- ✅ 增强选项说明和时长标注
