# 音频文件配置指南

## 📁 音频文件目录结构

```
public/
└── audio/
    ├── nsdr/          # NSDR非睡眠放松模式音频
    └── sleep/         # 进入睡眠模式音频
```

## 🎵 所需的音频文件

### NSDR模式音频 (`public/audio/nsdr/`)

| 文件名 | 时长 | 用途 |
|--------|------|-----|
| `nsdr-power-recharge.mp3` | 15分钟 | 能量补给 - 快速缓解眼部疲劳 |
| `nsdr-stress-reset.mp3` | 20分钟 | 压力归零 - 降低焦虑水平 |
| `nsdr-deep-recovery.mp3` | 30分钟 | 深度修复 - 完整睡眠周期模拟 |

### 睡眠模式音频 (`public/audio/sleep/`)

| 文件名 | 时长 | 用途 |
|--------|------|-----|
| `sleep-clear-mind.mp3` | 20分钟 | 清脑 - 帮助大脑停止转动 |
| `sleep-relax-body.mp3` | 20分钟 | 舒体 - 缓解身体疲劳 |
| `sleep-calm-heart.mp3` | 20分钟 | 定心 - 提供心理安全感 |
| `sleep-cool-down.mp3` | 20分钟 | 降温 - 降低情绪亢奋 |
| `sleep-serene.mp3` | 20分钟 | 静谧 - 宁静背景音 |

## 📤 如何上传音频

### 选项 1：本地开发（推荐）
1. 将MP3文件放入对应的文件夹
2. 运行 `npm run dev` 
3. 音频会通过本地服务器加载

示例：
```bash
# NSDR音频
cp /path/to/nsdr/power-recharge.mp3 public/audio/nsdr/nsdr-power-recharge.mp3

# 睡眠音频
cp /path/to/sleep/clear-mind.mp3 public/audio/sleep/sleep-clear-mind.mp3
```

### 选项 2：生产环境部署
1. 运行 `npm run build`
2. 音频文件会包含在 `dist/` 文件夹中
3. 部署到CDN或服务器时，确保 `dist/zensleep/audio/` 路径正确

## 🔗 音频文件加载原理

应用使用相对路径加载音频文件：
- **开发环境**：`/audio/nsdr/nsdr-power-recharge.mp3`
- **生产环境**：`/zensleep/audio/nsdr/nsdr-power-recharge.mp3`

> 注意：生产环境路径基于 `vite.config.ts` 中的 `base: '/zensleep/'` 配置

## ✅ 检查清单

- [ ] `public/audio/nsdr/` 文件夹包含3个MP3文件
- [ ] `public/audio/sleep/` 文件夹包含5个MP3文件
- [ ] 所有文件命名完全匹配上面的文件名
- [ ] 音频文件格式为MP3
- [ ] 音频时长符合要求

## 🐛 常见问题

### 音频无法播放？
1. 检查文件路径是否正确
2. 确认文件名是否精确匹配（区分大小写）
3. 检查浏览器控制台是否有404错误
4. 确保文件不被.gitignore忽略

### 如何测试？
运行开发服务器后，打开浏览器开发者工具，查看Network标签，确认音频文件成功加载。

## 📝 技术细节

- **音频格式**：MP3（支持所有现代浏览器）
- **加载方式**：Web Audio API（`AudioEngine.ts` 管理）
- **路由处理**：Vite 自动处理公共文件夹映射
