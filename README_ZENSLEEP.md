# ZenSleep - 个性化睡眠调理系统

> 结合中医体质理论和脑波音乐的智能睡眠辅助应用

## 🌟 功能特性

### ✨ 核心功能

- **通用模式** - 快速一键启动睡眠辅助
- **个性化配置** - 中医体质评估 + 症状选择 + 定制方案
- **智能语音导语** - Azure TTS + 自适应调音
- **脑波音乐系统** - Alpha/Theta/Delta 多阶段睡眠引导
- **资源管理系统** - 独立导语和音乐文件目录
- **GitHub Pages 部署** - 一键发布到网络

### 🎯 中医体质支持

包含 9 种中医体质分类，每种体质有对应的：
- 推荐中草药
- 推荐茶饮
- 个性化语音参数

### 🛌 睡眠症状支持

- 难以入睡 - 需要额外引导时间
- 焦虑烦躁 - 深化放松引导
- 身心疲劳 - 标准睡眠方案
- 避免梦魇 - 增强保护性暗示
- 易醒 - 加深睡眠深度
- 释放压力 - 专项压力释放

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置 Azure TTS（可选）：

```env
# Azure Speech Services 配置
AZURE_TTS_KEY=your_subscription_key_here
AZURE_TTS_REGION=your_region_here
```

### 3. 本地开发

```bash
npm run dev
```

访问 `http://localhost:3000`

### 4. 构建生产版本

```bash
npm run build
npm run preview
```

### 5. 部署到 GitHub Pages

```bash
# 一键部署
npm run deploy

# 或手动构建后上传 dist/ 文件夹
```

## 📁 项目结构

```
zensleep/
├── src/
│   ├── components/
│   │   ├── InitialChoice.tsx      # 模式选择界面
│   │   ├── UserProfile.tsx        # 中医体质问卷（9题）
│   │   └── SymptomSelector.tsx    # 症状/心情选择
│   ├── lib/
│   │   ├── AudioEngine.ts         # 脑波音频引擎
│   │   ├── AzureTTS.ts            # Azure 文字转语音
│   │   └── ContentManager.ts      # 内容和会话管理
│   ├── data/
│   │   ├── constitutions.ts       # 9种体质 + 6种症状
│   │   └── scripts.ts             # 导语脚本库（10+条）
│   ├── App.tsx                    # 主应用逻辑
│   └── index.css                  # 全局样式
├── public/
│   ├── scripts/                   # 导语文本目录（预留）
│   └── music/                     # 背景音乐目录（预留）
├── .env                           # 环境变量（不提交）
├── .env.example                   # 环境变量模板
├── vite.config.ts                 # Vite 配置（含 GitHub Pages 支持）
├── package.json                   # 依赖和脚本
└── index.html                     # 移动端优化 HTML
```

## 🔧 技术栈

| 技术 | 用途 |
|------|------|
| React 19 | UI 框架 |
| TypeScript | 类型检查 |
| Vite | 构建工具 |
| Tailwind CSS | 样式框架 |
| Motion | 动画库 |
| Web Audio API | 脑波生成 |
| Azure Speech Services | 文字转语音 |
| Lucide React | 图标库 |

## 📱 移动端设计

项目针对移动设备进行了深度优化：

- ✅ 100% 响应式设计（手机、平板、桌面）
- ✅ iOS 全屏模式支持（`viewport-fit=cover`）
- ✅ 禁用用户缩放和双击放大
- ✅ 安全区域适配（刘海屏、动态岛）
- ✅ 触摸友好的控件尺寸（最小 44×44px）
- ✅ 防止文本选择和长按菜单
- ✅ 优化字体大小以防止自动放大

### 在浏览器中测试移动端

1. 打开开发者工具（F12）
2. 点击设备工具栏按钮（或Ctrl+Shift+M）
3. 选择 iPhone / iPad 进行测试

## 🎵 自定义资源

### 添加导语脚本

1. 编辑 `src/data/scripts.ts`
2. 在 `SCRIPTS` 对象中添加新条目：

```typescript
custom_sleep: {
  key: 'custom_sleep',
  title: '自定义睡眠导语',
  content: [
    '欢迎来到睡眠空间。',
    '现在请放松你的身体...',
    // 更多句子...
  ],
  duration: 120, // 预期时长（秒）
}
```

3. 在 `ContentManager.ts` 中的 `buildScriptSequence()` 中引用

### 添加背景音乐

1. 准备 MP3 音乐文件
2. 放在 `public/music/` 目录中
3. 在 `src/lib/ContentManager.ts` 中的 `musicMap` 中添加映射：

```typescript
const musicMap: Record<string, string> = {
  your_symptom: '/music/your_music_file.mp3',
};
```

## 🌐 部署到 GitHub Pages

### 方法 1：自动脚本（推荐）

```bash
npm run deploy
```

### 方法 2：手动部署

1. 构建项目：
   ```bash
   npm run build
   ```

2. 在 GitHub 创建 `gh-pages` 分支（如果不存在）

3. 将 `dist/` 文件夹内容推送到 `gh-pages` 分支

4. 在 GitHub 仓库设置中：
   - 进入 **Settings** > **Pages**
   - 选择 **Deploy from a branch**
   - 选择 `gh-pages` 分支
   - 保存

5. 访问 `https://patricknao.github.io/zensleep/`

## ⚙️ Azure TTS 配置

### 获取密钥

1. 访问 [Azure Portal](https://portal.azure.com/)
2. 创建 **Speech** 资源
3. 获取 **Subscription Key** 和 **Region**

### 支持的中文声音

- `zh-CN-XiaoxiuNeural` - 专业女性（默认，推荐）
- `zh-CN-XiaomoNeural` - 温暖女性
- `zh-CN-YunyangNeural` - 平静男性
- `zh-CN-XiaohanNeural` - 儿童

### 环境变量配置

在 `.env` 中设置：

```env
AZURE_TTS_KEY=your_subscription_key
AZURE_TTS_REGION=eastus  # 或其他地区
```

### 故障排查

- 如果 Azure TTS 失败，系统会自动回退到 Web Speech API
- 检查浏览器网络标签看 API 响应状态

## 📖 核心 API 文档

### AudioEngine - 脑波音频

```typescript
import { audioEngine } from './lib/AudioEngine';

// 启动音频管道
await audioEngine.startAudioPipeline();

// 演进脑波（逐渐改变频率和滤波）
audioEngine.evolveState(
  targetFreq,      // 目标频率（Hz）
  filterFreq,      // 滤波器频率（Hz）
  transitionSec    // 过渡时间（秒）
);

// 同步呼吸（吸气和呼气）
audioEngine.syncBreathing(
  'INHALE' | 'EXHALE',  // 呼吸阶段
  durationMs            // 持续时间（毫秒）
);

// 背景音淡入淡出
audioEngine.fadeBackgroundForVoice(isSpeaking);

// 优雅停止
audioEngine.terminate();
```

### AzureTTS - 文字转语音

```typescript
import { initializeAzureTTS } from './lib/AzureTTS';

// 初始化（自动使用 .env 配置）
const tts = initializeAzureTTS();

// 语音合成
await tts.speak(
  text,          // 要说的文本
  onStart,       // 开始回调（可选）
  onEnd          // 结束回调（可选）
);

// 停止播放
tts.stop();

// 检查播放状态
const isPlaying = tts.getIsPlaying();
```

### ContentManager - 内容管理

```typescript
import { ContentManager } from './lib/ContentManager';

// 生成定制化配置
const config = ContentManager.generateContentConfig(
  constitutionId,  // 体质 ID
  symptoms         // 症状 ID 数组
);

// 获取脚本文本
const texts = ContentManager.getScriptTexts(scriptKeys);

// 获取所有可用资源
const musicFiles = ContentManager.getAvailableMusicFiles();
const scriptFiles = ContentManager.getAvailableScriptFiles();

// 生成会话摘要
const summary = ContentManager.generateSessionSummary(config);
```

## 🎯 中医体质类型详解

### 1. 平和质
- 特征：体质均衡，阴阳气血调和
- 草药：黄芪、红枣、甘草
- 茶饮：红茶、乌龙茶、普洱茶

### 2. 气虚质
- 特征：容易疲劳、说话声小、消化不好
- 草药：黄芪、党参、红枣、甘草
- 茶饮：红参茶、洋参茶、黄芪茶

### 3. 阳虚质
- 特征：怕冷、手脚冰冷、尿频
- 草药：肉桂、干姜、附子、艾叶
- 茶饮：覆盆茶、肉桂茶、生姜茶

### 4. 阴虚质
- 特征：口干、便秘、皮肤干燥
- 草药：麦冬、石斛、百合、甘草
- 茶饮：银耳茶、蜂蜜水、花茶

### 5. 痰湿质
- 特征：身体沉重、腹部松软、疲劳
- 草药：薏米、茯苓、冬瓜、赤小豆
- 茶饮：薏米茶、茯苓茶、山楂茶

### 6. 湿热质
- 特征：皮肤油腻、口苦、易长痘
- 草药：薏米、绿豆、冬瓜
- 茶饮：绿茶、苦瓜茶、薏米茶

### 7. 血瘀质
- 特征：肤色暗沉、长斑、舌质暗
- 草药：红花、丹参、山楂、黑木耳
- 茶饮：黑木耳茶、玫瑰茶、红花茶

### 8. 特禀质
- 特征：易过敏、皮肤敏感、易腹泻
- 草药：薏米、红枣、黄芪、蜂蜜
- 茶饮：红枣茶、蜂蜜茶、姜茶

### 9. 气郁质
- 特征：情绪低沉、爱叹气、睡眠不好
- 草药：玫瑰花、黄芪、红枣、甘草
- 茶饮：玫瑰茶、花茶、茉莉花茶

## 💡 会话流程

1. **初始选择** → 用户选择通用或个性化

2. **个性化流程** (仅个性化模式)：
   - 中医体质问卷（5 题，快速评估）
   - 当日症状/心情选择（多选）
   - 自动生成定制方案

3. **会话准备**：
   - 显示预计时长
   - 准备音频资源

4. **睡眠会话** (4 阶段)：
   - **第 1 阶段 (5 分钟)**：感知与放松（Alpha 10Hz）
   - **第 2 阶段 (10 分钟)**：意识沉降（Theta 6Hz）
   - **第 3 阶段 (15 分钟)**：呼吸同步（Delta 3Hz）
   - **第 4 阶段 (动态)**：深度睡眠（Delta 1.5Hz）

5. **唤醒**：温和返回清醒

## 🐛 故障排查

| 症状 | 可能原因 | 解决方案 |
|------|--------|--------|
| Azure TTS 不工作 | 密钥/区域未配置或无效 | 检查 .env，回退到 Web Speech API |
| 没有声音 | 浏览器权限或音量 | 检查浏览器权限和系统音量 |
| 页面样式乱 | Tailwind CSS 未正确构建 | 运行 `npm run clean && npm run build` |
| 脑波音乐不播放 | Web Audio API 阻止 | 确保先有用户交互 |
| 移动端显示异常 | 缓存问题 | 清除浏览器缓存，硬刷新 |

## 🔒 安全注意事项

- ❌ 不要将 `.env` 提交到 Git
- ✅ 在 `.gitignore` 中加入 `.env`
- ✅ 使用 GitHub Secrets 保存生产环境密钥
- ✅ 定期轮换 Azure API 密钥
- ✅ 不在前端代码中硬编码敏感信息

## 📊 性能优化

- Vite 快速冷启动
- React 18+ 自动批处理
- Tailwind CSS 按需生成
- 代码分割和预加载
- WebP 图片格式支持

## 🌍 国际化

当前支持：
- 中文（简体）

可轻松扩展至其他语言。

## 📞 获得帮助

- 查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 获得详细部署说明
- 检查浏览器控制台了解错误信息
- 提交 Issue 报告问题

## 📄 许可证

MIT License

---

**版本**: 1.0.0  
**最后更新**: 2024-04-11  
**作者**: [Your Name]

🌙 **祝您享受深度睡眠和宁静的梦想！** ✨
