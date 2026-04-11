# ZenSleep 快速启动指南

## 🚀 5 分钟快速开始

### 步骤 1：初始化项目

```bash
cd /Users/patricknao/Desktop/zensleep
npm install
```

### 步骤 2：配置 Azure TTS（可选）

复制并编辑 `.env` 文件：

```bash
cp .env.example .env
```

如果您有 Azure Speech Services 密钥，在 `.env` 中配置：

```env
AZURE_TTS_KEY=your_subscription_key
AZURE_TTS_REGION=your_region
```

如果不配置，应用会自动使用浏览器的 Web Speech API。

### 步骤 3：启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 在浏览器中打开应用。

### 步骤 4：测试功能

1. **初始选择界面** - 选择"通用模式"或"个性化配置"
2. **个性化模式**（可选）：
   - 完成 5 道中医体质问卷
   - 选择当日症状（可多选）
   - 系统生成定制方案
3. **睡眠会话** - 会话会进行 4 个阶段的睡眠引导

### 步骤 5：构建生产版本

```bash
npm run build
npm run preview
```

## 🌐 部署到 GitHub Pages

### 一键部署

```bash
npm run deploy
```

您的应用将发布到：`https://patricknao.github.io/zensleep/`

### 手动部署

1. 构建项目：
   ```bash
   npm run build
   ```

2. 访问您的 GitHub 仓库设置，启用 GitHub Pages

3. 将 `dist/` 文件夹推送到 `gh-pages` 分支

## 📁 关键文件位置

为了更新和自定义应用，您可能需要编辑这些文件：

### 修改导语内容
📄 **文件**: `src/data/scripts.ts`
- 编辑 `SCRIPTS` 对象中的各个脚本
- 每个脚本包括 `content`（话语数组）和 `duration`（时长）

### 修改中医体质信息
📄 **文件**: `src/data/constitutions.ts`
- 编辑 `CONSTITUTIONS` 对象中的体质信息
- 修改 `recommendedHerbs` 和 `recommendedTeas`
- 调整 `voiceSettings`（语速和音调）

### 修改症状类型
📄 **文件**: `src/data/constitutions.ts`
- 在 `SYMPTOMS` 对象中添加或修改症状
- 更新脚本和音乐映射

### 调整会话时长和阶段
📄 **文件**: `src/lib/ContentManager.ts`
- `buildScriptSequence()` - 改变脚本顺序
- `buildMusicList()` - 改变音乐选择
- `generateContentConfig()` - 调整会话总时长

### 自定义样式
📄 **文件**: `src/components/*.tsx`
- 修改 Tailwind CSS 类名
- 所有组件都在 `src/components/` 目录中

##  🔧 主要文件说明

```
src/
├── App.tsx                          # 主应用逻辑和状态管理
├── components/
│   ├── InitialChoice.tsx            # 通用/个性化选择界面
│   ├── UserProfile.tsx              # 中医体质问卷
│   └── SymptomSelector.tsx          # 症状选择界面
├── lib/
│   ├── AudioEngine.ts               # 脑波和音乐引擎
│   ├── AzureTTS.ts                  # Azure 语音服务客户端
│   └── ContentManager.ts            # 内容和会话配置管理
└── data/
    ├── constitutions.ts             # 体质、症状、会话预设
    └── scripts.ts                   # 导语脚本库和管理器
```

## 🎯 常见自定义需求

### 1. 修改欢迎语
**文件**: `src/data/scripts.ts`

找到 `welcome_standard` 脚本，修改 `content` 数组。

### 2. 增加新的体质类型
**文件**: `src/data/constitutions.ts`

1. 在 `CONSTITUTIONS` 对象中添加新体质
2. 在 `UserProfile.tsx` 的 `constitutionMappings` 中添加映射
3. 为该体质创建新的导语脚本

### 3. 调整脑波频率
**文件**: `src/data/constitutions.ts`

修改 `SESSION_PRESETS` 中各阶段的 `targetFreq` 和 `filterFreq` 值。

### 4. 添加新症状
**文件**: `src/data/constitutions.ts` + `src/lib/ContentManager.ts`

1. 在 `SYMPTOMS` 对象中添加新症状
2. 在 `SymptomSelector.tsx` 中会自动显示（如果在 SYMPTOMS 中定义）
3. 在 `ContentManager.ts` 的 `symptomScriptMap` 中添加脚本映射

## 🎵 添加音乐文件

1. 准备 MP3 文件
2. 将其放在 `public/music/` 目录中
3. 在 `src/lib/ContentManager.ts` 中引用它

示例：
```typescript
const musicMap: Record<string, string> = {
  'insomnia': '/music/relaxation_slow.mp3',  // 添加这一行
};
```

## 📝 导语导语管理

所有导语存储在 `src/data/scripts.ts` 中的 `SCRIPTS` 对象中。

添加新导语：
```typescript
export const SCRIPTS: Record<string, ScriptConfig> = {
  your_new_script: {
    key: 'your_new_script',
    title: '你的新导语标题',
    content: [
      '第一句话...',
      '第二句话...',
    ],
    duration: 60,  // 预计时长（秒）
  },
};
```

## 🔍 调试技巧

### 启用控制台日志
打开浏览器开发者工具（F12），查看控制台输出。

### 检查 Azure TTS 配置
在 `App.tsx` 中，如果 Azure TTS 初始化失败，会自动回退到 Web Speech API。

### 测试不同设备
使用 Chrome DevTools 的设备模拟器（Ctrl+Shift+M）测试不同屏幕大小。

## 🚨 故障排除

### 问题：应用无法启动
**解决方案**：
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 问题：样式显示异常
**解决方案**：
```bash
npm run clean
npm run build
npm run preview
```

### 问题：Azure TTS 无法工作
**解决方案**：
1. 检查 `.env` 中的密钥是否正确
2. 确保 Azure 订阅仍然有效
3. 检查浏览器控制台的错误信息
4. 应用会自动回退到 Web Speech API

### 问题：移动端显示异常
**解决方案**：
1. 硬刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）
2. 清除浏览器缓存
3. 在 Chrome DevTools 中检查响应式设计

## 📊 项目状态清单

完成功能：
- ✅ 初始选择界面（通用 / 个性化）
- ✅ 中医体质问卷（9 种体质）
- ✅ 症状选择界面（6 种症状）
- ✅ Azure TTS 集成
- ✅ 脑波音频引擎
- ✅ 内容管理系统
- ✅ 导语脚本库
- ✅ GitHub Pages 配置
- ✅ 移动端优化
- ✅ 响应式设计

待添加（可选）：
- ⏳ 实际音乐文件（public/music/ 中）
- ⏳ 实际导语音频文件（public/scripts/ 中）
- ⏳ 用户数据持久化
- ⏳ 会话历史记录
- ⏳ 用户偏好设置

## 📞 获得帮助

- 详细部署说明：见 `DEPLOYMENT_GUIDE.md`
- 完整项目说明：见 `README_ZENSLEEP.md`
- API 文档：见相应的 `.ts` 文件中的注释

---

**祝您使用愉快！** 🌙✨

如有任何问题或需要进一步的帮助，欢迎提出！
