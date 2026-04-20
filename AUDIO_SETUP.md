# 音频文件配置指南

## 📁 音频文件目录结构

```
public/
└── audio/
    ├── nsdr/          # NSDR非睡眠放松模式音频
    ├── sleep/         # 进入睡眠模式音频（仅30分钟选项）
    └── music/         # 纯背景音乐助眠音频
```

## 🎵 所需的音频文件

### NSDR模式音频 (`public/audio/nsdr/`)

| 文件名 | 时长 | 用途 |
|--------|------|-----|
| `nsdr-power-recharge.mp3` | 10分钟 | 能量补给 - 快速缓解眼部疲劳 |
| `nsdr-stress-reset.mp3` | 20分钟 | 压力归零 - 降低焦虑水平 |
| `nsdr-deep-recovery.mp3` | 30分钟 | 深度修复 - 完整睡眠周期模拟 |

### 睡眠模式音频 (`public/audio/sleep/`) - 仅保留30分钟选项

| 文件名 | 时长 | 用途 |
|--------|------|-----|
| `sleep-clear-mind.mp3` | 30分钟 | 清脑 · 卸载繁杂 - 帮助大脑停止转动 |
| `sleep-relax-body.mp3` | 30分钟 | 舒体 · 融化酸累 - 缓解身体疲劳 |
| `sleep-calm-heart.mp3` | 30分钟 | 定心 · 安全避风港 - 提供心理安全感 |

### 纯背景音乐助眠 (`public/audio/music/`) - 新增

| 文件名 | 时长 | 用途 |
|--------|------|-----|
| `music-light.mp3` | 20分钟 | 轻盈 · 柔和伴眠 - 轻柔背景音乐，快速入眠 |
| `music-balanced.mp3` | 40分钟 | 平和 · 舒适陪伴 - 平衡背景音乐，深度放松 |
| `music-deep.mp3` | 60分钟 | 深度 · 完整睡眠 - 深沉背景音乐，整晚安眠 |

## 📤 如何上传音频

### 选项 1：本地开发（推荐）
1. 将MP3文件放入对应的文件夹
2. 运行 `npm run dev` 
3. 音频会通过本地服务器加载

示例：
```bash
# NSDR音频
cp /path/to/nsdr/power-recharge.mp3 public/audio/nsdr/nsdr-power-recharge.mp3
cp /path/to/nsdr/stress-reset.mp3 public/audio/nsdr/nsdr-stress-reset.mp3
cp /path/to/nsdr/deep-recovery.mp3 public/audio/nsdr/nsdr-deep-recovery.mp3

# 睡眠音频（仅30分钟）
cp /path/to/sleep/clear-mind.mp3 public/audio/sleep/sleep-clear-mind.mp3
cp /path/to/sleep/relax-body.mp3 public/audio/sleep/sleep-relax-body.mp3
cp /path/to/sleep/calm-heart.mp3 public/audio/sleep/sleep-calm-heart.mp3

# 背景音乐（新增）
cp /path/to/music/light.mp3 public/audio/music/music-light.mp3
cp /path/to/music/balanced.mp3 public/audio/music/music-balanced.mp3
cp /path/to/music/deep.mp3 public/audio/music/music-deep.mp3
```

### 选项 2：生产环境部署
1. 运行 `npm run build`
2. 音频文件会包含在 `dist/` 文件夹中
3. 部署到CDN或服务器时，确保 `dist/zensleep/audio/` 路径正确

## 🔗 音频文件加载原理

应用使用相对路径加载音频文件：
- **开发环境**：`/audio/nsdr/nsdr-power-recharge.mp3`、`/audio/sleep/sleep-clear-mind.mp3`、`/audio/music/music-light.mp3`
- **生产环境**：`/zensleep/audio/nsdr/nsdr-power-recharge.mp3`、`/zensleep/audio/sleep/sleep-clear-mind.mp3`、`/zensleep/audio/music/music-light.mp3`

> 注意：生产环境路径基于 `vite.config.ts` 中的 `base: '/zensleep/'` 配置

## ✅ 检查清单

### NSDR音频 (3个文件)
- [ ] `public/audio/nsdr/nsdr-power-recharge.mp3` (10分钟)
- [ ] `public/audio/nsdr/nsdr-stress-reset.mp3` (20分钟)
- [ ] `public/audio/nsdr/nsdr-deep-recovery.mp3` (30分钟)

### 睡眠音频 (3个文件，仅30分钟)
- [ ] `public/audio/sleep/sleep-clear-mind.mp3` (30分钟)
- [ ] `public/audio/sleep/sleep-relax-body.mp3` (30分钟)
- [ ] `public/audio/sleep/sleep-calm-heart.mp3` (30分钟)

### 背景音乐 (3个文件)
- [ ] `public/audio/music/music-light.mp3` (20分钟)
- [ ] `public/audio/music/music-balanced.mp3` (40分钟)
- [ ] `public/audio/music/music-deep.mp3` (60分钟)

**总计：9个MP3文件**

### 通用检查
- [ ] 所有文件命名完全匹配上面的文件名
- [ ] 音频文件格式为MP3
- [ ] 音频时长符合要求
- [ ] 文件不被.gitignore忽略

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
