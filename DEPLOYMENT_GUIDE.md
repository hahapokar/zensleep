# ZenSleep - 个性化睡眠调理系统

## 项目概述

ZenSleep 是一个结合中医体质理论的智能睡眠调理系统，提供以下功能：

### ✨ 主要特性

1. **通用模式** - 快速开始睡眠辅助
2. **个性化模式** - 包含三个步骤：
   - 中医体质问卷评估（9种体质类型）
   - 当日症状/心情选择（6种症状选项）
   - 定制化睡眠方案

3. **智能语音导语** - 支持：
   - Microsoft Azure TTS（推荐）
   - Web Speech API（备用）
   - 根据体质和症状自动调整语速和音调

4. **脑波音乐系统** - 多阶段睡眠引导：
   - Alpha 波段（清醒态放松）
   - Theta 波段（浅睡眠）
   - Delta 波段（深睡眠）

5. **资源管理** - 预留独立目录：
   - `/public/scripts/` - 导语文本文件
   - `/public/music/` - 背景音乐文件

## 项目结构

```
zensleep/
├── src/
│   ├── components/
│   │   ├── InitialChoice.tsx      # 模式选择界面
│   │   ├── UserProfile.tsx        # 中医体质问卷
│   │   └── SymptomSelector.tsx    # 症状选择界面
│   ├── lib/
│   │   ├── AudioEngine.ts         # 脑波音频引擎（已有）
│   │   ├── AzureTTS.ts            # Azure 文字转语音服务
│   │   └── ContentManager.ts      # 内容和配置管理
│   ├── data/
│   │   ├── constitutions.ts       # 中医体质数据和症状定义
│   │   └── scripts.ts             # 导语脚本库
│   ├── App.tsx                    # 主应用逻辑
│   ├── main.tsx                   # 入口文件
│   └── index.css                  # 样式
├── public/
│   ├── scripts/                   # 导语文本文件目录
│   └── music/                     # 背景音乐文件目录
├── .env                           # 环境变量（本地）
├── .env.example                   # 环境变量模板
├── vite.config.ts                 # Vite 配置
├── tsconfig.json                  # TypeScript 配置
├── package.json                   # 项目依赖
└── index.html                     # HTML 模板（移动端优化）
```

## 🚀 快速开始

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 配置 Azure TTS（可选但推荐）

#### 获取 Azure Speech Services 密钥：

1. 访问 [Azure 门户](https://portal.azure.com/)
2. 创建或进入现有的资源组
3. 创建新的 "Speech" 服务
4. 记下：
   - **Subscription Key**（API 密钥）
   - **Region**（地区，如 `eastus`, `westus` 等）

#### 在 `.env` 文件中配置：

\`\`\`env
AZURE_TTS_KEY=your_subscription_key_here
AZURE_TTS_REGION=your_region_here
\`\`\`

#### Azure TTS 支持的中文声音：

- `zh-CN-XiaoxiuNeural` - 专业女性（推荐）
- `zh-CN-XiaomoNeural` - 温暖女性
- `zh-CN-YunyangNeural` - 平静男性
- `zh-CN-XiaohanNeural` - 儿童声音

### 3. 开发服务

\`\`\`bash
npm run dev
```

访问 `http://localhost:3000` 进行测试

### 4. 构建生产版

\`\`\`bash
npm run build
\`\`\`

## 📱 移动端适配

项目已针对移动端进行了优化：

- ✅ 响应式设计（手机、平板）
- ✅ 禁用放大/缩放
- ✅ iOS 全屏支持（`viewport-fit=cover`）
- ✅ 状态栏适配（黑色透明）
- ✅ 触摸友好的控件大小
- ✅ 防止文本选择和长按菜单

## 🌐 GitHub Pages 部署

### 1. 在仓库根目录创建 `gh-pages` 分支

\`\`\`bash
git checkout --orphan gh-pages
git commit --allow-empty -m "Initial gh-pages commit"
git push origin gh-pages
git checkout main  # 或您的主分支
\`\`\`

### 2. 调整部署配置（可选）

在 GitHub Actions 或本地部署前，可以设置环境变量：

\`\`\`bash
DEPLOY_ENV=github-pages npm run build
\`\`\`

### 3. 自动部署脚本

使用 package.json 中的部署命令：

\`\`\`bash
npm run deploy
\`\`\`

or 手动部署：

\`\`\`bash
npm run build
cd dist
git init
git add .
git commit -m "Deploy"
git push -f git@github.com:patricknao/zensleep.git main:gh-pages
cd ..
\`\`\`

### 4. 配置 GitHub Pages 设置

在 GitHub 仓库设置中：
1. 进入 **Settings** > **Pages**
2. 选择 **Deploy from a branch**
3. 选择 `gh-pages` 分支和 `/ (root)` 目录
4. 保存

部署完成后，您的应用将在 `https://patricknao.github.io/zensleep/` 上运行

## 🎵 资源文件管理

### 添加自定义导语脚本

编辑 `src/data/scripts.ts`，添加新的脚本配置：

\`\`\`typescript
export const SCRIPTS: Record<string, ScriptConfig> = {
  custom_script: {
    key: 'custom_script',
    title: '自定义导语',
    content: [
      '第一句话...',
      '第二句话...',
    ],
    duration: 60, // 秒
  },
};
\`\`\`

### 添加背景音乐

在 `public/music/` 目录中放置 MP3 文件，然后在 `src/lib/ContentManager.ts` 中引用：

\`\`\`typescript
'/music/your_music_file.mp3'
\`\`\`

## 🧠 中医体质类型

系统包含 9 种中医体质：

1. **平和质** - 体质均衡
2. **气虚质** - 体内气虚，四肢乏力
3. **阳虚质** - 阳气不足，身体怕冷
4. **阴虚质** - 阴液不足，容易上火
5. **痰湿质** - 体内湿气重，容易发胖
6. **湿热质** - 湿热并存，容易长痘
7. **血瘀质** - 血液循环不畅
8. **特禀质** - 易过敏体质
9. **气郁质** - 情绪郁闷，心情不好

## 🎯 症状和推荐

支持 6 种常见睡眠症状/心情选择：

1. **难以入睡** - 入睡困难，需要长时间才能入睡
2. **焦虑烦躁** - 心烦意乱，容易紧张不安
3. **身心疲劳** - 整天疲劳，无精打采
4. **避免梦魇** - 容易做噩梦，睡眠质量低
5. **易醒** - 睡眠浅，容易被惊醒
6. **释放压力** - 工作压力大，需要放松

每个症状都对应特定的：
- 导语脚本（针对性的心理引导）
- 背景音乐（特定脑波频率）
- 额外时长（根据需要延长会话）

## 📝 环境变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| `AZURE_TTS_KEY` | Azure Speech Services 订阅密钥 | `abc123...` |
| `AZURE_TTS_REGION` | Azure Speech Services 服务地区 | `eastus` |
| `GEMINI_API_KEY` | Google Gemini API 密钥（可选） | `api_key...` |
| `DEPLOY_ENV` | 部署环境（可选） | `github-pages` |

## 🔒 安全建议

- 不要将 `.env` 文件提交到 Git
- 在生产环境中使用 GitHub Secrets 存储敏感信息
- 定期轮换 API 密钥

## 🛠️ 技术栈

- **框架**: React 19
- **构建工具**: Vite
- **语言**: TypeScript
- **动画**: Motion (Framer Motion)
- **样式**: Tailwind CSS
- **UI 组件**: Lucide React
- **音频**: Web Audio API
- **语音**: Azure Cognitive Services + Web Speech API
- **包管理**: npm

## 📋 API 文档

### AudioEngine 类

\`\`\`typescript
// 启动音频管道
await audioEngine.startAudioPipeline();

// 演进脑波状态
audioEngine.evolveState(targetFreq, filterFreq, transitionSec);

// 同步呼吸
audioEngine.syncBreathing('INHALE' | 'EXHALE', durationMs);

// 背景音淡入淡出
audioEngine.fadeBackgroundForVoice(isSpeaking);

// 优雅终止
audioEngine.terminate();
\`\`\`

### AzureTTS 类

\`\`\`typescript
// 初始化
const azureTTS = initializeAzureTTS();

// 语音合成
await azureTTS.speak(text, onStart?, onEnd?);

// 停止播放
azureTTS.stop();

// 检查状态
azureTTS.getIsPlaying();
\`\`\`

### ContentManager 类

\`\`\`typescript
// 生成内容配置
const config = ContentManager.generateContentConfig(constitution, symptoms);

// 获取脚本文本
const texts = ContentManager.getScriptTexts(scriptKeys);

// 获取可用资源
const musicFiles = ContentManager.getAvailableMusicFiles();
const scriptFiles = ContentManager.getAvailableScriptFiles();

// 生成会话摘要
const summary = ContentManager.generateSessionSummary(config);
\`\`\`

## 🐛 故障排除

### Azure TTS 不工作

1. 检查 `.env` 文件中的密钥和地区是否正确
2. 确保 Azure Speech Services 服务正在运行
3. 检查浏览器控制台的错误信息
4. 系统会自动回退到 Web Speech API（如果可用）

### 语音不播放

- 检查浏览器的音频权限
- 确保音量不为零
- 在移动设备上，某些浏览器可能需要用户交互才能播放音频

### 样式问题

- 清除浏览器缓存
- 运行 `npm run clean && npm run build`
- 检查 Tailwind CSS 是否正确构建

## 📚 进阶配置

### 自定义脑波频率

在 `src/data/constitutions.ts` 中的 `SESSION_PRESETS` 中修改各阶段的 `targetFreq` 值

### 自定义体质算法

在 `src/components/UserProfile.tsx` 中的 `constitutionMappings` 对象中调整映射关系

### 添加新的症状

1. 在 `src/data/constitutions.ts` 中的 `SYMPTOMS` 对象中添加新症状
2. 在 `src/data/scripts.ts` 中添加对应的导语脚本
3. 在 `src/lib/ContentManager.ts` 中更新 `musicMap`

## 📞 支持

有任何问题或建议，欢迎提交 Issue 或 Pull Request。

## 📄 许可证

MIT License

---

**祝您睡眠愉快！** 🌙
