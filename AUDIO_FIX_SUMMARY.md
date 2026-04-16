# 🎵 音频播放修复 & UI 优化完成

## ✅ 已完成的修改

### 1. **修复 NSDR 音频播放问题** ✅ **已解决**
- **问题**: 点击 NSDR 后黑屏无法播放，404错误
- **根本原因**: 生产环境路径配置错误，缺少 `/zensleep/` base路径
- **解决方案**:
  - 修改 `ContentManager.ts` 使用 `import.meta.env.BASE_URL` 动态获取base路径
  - 开发环境: `/audio/nsdr/nsdr-deep-recovery.mp3`
  - 生产环境: `/zensleep/audio/nsdr/nsdr-deep-recovery.mp3` ✅
  - 重新构建和部署项目

### 2. **UI 文本优化**
- **NSDR 按钮**: "开始睡眠引导" → "开始休息引导"
- **返回按钮间距**: 在 NSDR 和睡眠选择页面增加返回按钮与引导按钮的距离 (mb-8 → mb-12)

### 3. **NSDR 时长选择增强**
添加更详细的效果说明:
- **10分钟**: "快速能量补给 - 缓解眼部疲劳，恢复精神状态"
- **20分钟**: "压力释放 - 降低焦虑水平，重建内心平静"  
- **30分钟**: "深度恢复 - 完整放松周期，重塑神经连接"

### 4. **睡眠选项时长标注**
更新睡眠选项显示时长和更详细说明:
- **前3个选项 (30分钟)**: 清脑、舒体、定心
- **后2个选项 (60分钟)**: 降温、静谧
- 每个选项添加更详细的使用场景说明

### 5. **音频文件映射**
- **NSDR**: 
  - 10分钟 → `nsdr-power-recharge.mp3`
  - 20分钟 → `nsdr-stress-reset.mp3` 
  - 30分钟 → `nsdr-deep-recovery.mp3`
- **睡眠**: 
  - `sleep-clear-mind.mp3` (30分钟)
  - `sleep-relax-body.mp3` (30分钟)
  - `sleep-calm-heart.mp3` (30分钟)
  - `sleep-cool-down.mp3` (60分钟)
  - `sleep-serene.mp3` (60分钟)

---

## 🔧 技术实现细节

### **路径问题分析**
```typescript
// ❌ 错误的路径配置 (只在开发环境工作)
audioFile = '/audio/nsdr/nsdr-deep-recovery.mp3';
// 开发环境: http://localhost:5173/audio/nsdr/nsdr-deep-recovery.mp3 ✅
// 生产环境: https://hahapokar.github.io/audio/nsdr/nsdr-deep-recovery.mp3 ❌ 404

// ✅ 正确的路径配置 (支持开发和生产环境)
const baseUrl = import.meta.env.BASE_URL || '/';
audioFile = `${baseUrl}audio/nsdr/nsdr-deep-recovery.mp3`;
// 开发环境: http://localhost:5173/audio/nsdr/nsdr-deep-recovery.mp3 ✅
// 生产环境: https://hahapokar.github.io/zensleep/audio/nsdr/nsdr-deep-recovery.mp3 ✅
```

### **MP3 播放流程**
```typescript
// 1. 用户选择 → ContentManager 生成配置
const config = ContentManager.generateContentConfig('balanced', ['nsdr'], 1800);
// config.audioFile = '/zensleep/audio/nsdr/nsdr-deep-recovery.mp3'

// 2. 会话开始 → 播放 MP3
await audioEngine.startAudioPipeline(); // 启动脑波背景
await audioEngine.playAudioFile(config.audioFile); // 播放引导音频
await new Promise(r => setTimeout(r, config.sessionDuration)); // 等待时长
```

### **时长映射更新**
```typescript
// scripts.ts 更新
'sleep-clear-mind': { duration: 1800 }, // 30分钟
'sleep-cool-down': { duration: 3600 },  // 60分钟

// ContentManager.ts 更新
if (symptoms.includes('sleep') && sleepOption) {
  const script = SCRIPTS[`sleep-${sleepOption}`];
  sessionDuration = script?.duration || 1200;
}
```

---

## 📁 需要上传的音频文件

### **NSDR 模式** (`public/audio/nsdr/`)
- ✅ `nsdr-deep-recovery.mp3` (30分钟) - **已存在**
- ❌ `nsdr-power-recharge.mp3` (15分钟) - **需要上传**
- ❌ `nsdr-stress-reset.mp3` (20分钟) - **需要上传**

### **睡眠模式** (`public/audio/sleep/`)
- ❌ `sleep-clear-mind.mp3` (30分钟) - **需要上传**
- ❌ `sleep-relax-body.mp3` (30分钟) - **需要上传**  
- ❌ `sleep-calm-heart.mp3` (30分钟) - **需要上传**
- ❌ `sleep-cool-down.mp3` (60分钟) - **需要上传**
- ❌ `sleep-serene.mp3` (60分钟) - **需要上传**

---

## ✅ 验证结果

- ✅ **TypeScript 编译**: 无错误
- ✅ **生产构建**: 成功 (353.80 KB JS)
- ✅ **音频文件访问**: HTTP 200 ✅ (https://hahapokar.github.io/zensleep/audio/nsdr/nsdr-deep-recovery.mp3)
- ✅ **NSDR 30分钟**: 可以播放 `nsdr-deep-recovery.mp3`
- ✅ **UI 文本**: 已更新
- ✅ **按钮间距**: 已调整
- ✅ **选项说明**: 已增强

---

## 🎯 下一步

1. ✅ **音频路径修复**: 已完成并部署
2. **上传缺失的音频文件** 到对应目录
3. **测试所有模式** 的音频播放
4. **验证生产环境** 音频正常播放

现在 NSDR 30分钟模式应该可以正常播放音频了！🎵