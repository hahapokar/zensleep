# ZenSleep 音频缓存机制说明

## 概述

ZenSleep 使用浏览器的 **Cache API** 自动缓存所有音频文件。用户第一次点击音频选项时下载，之后每次使用都从手机缓存读取。

## 工作原理

```
第一次使用：
用户点击选项 → 检查缓存（未找到）→ 从网络下载 MP3 → 自动保存到缓存 → 播放

第二次及以后：
用户点击选项 → 检查缓存（找到！）→ 直接从缓存读取 → 瞬间播放
```

## 技术实现

### Cache API 工作流程

**文件**：`src/lib/AudioEngine.ts`

```typescript
private async fetchAndCacheAudio(url: string): Promise<Blob> {
  const cacheName = 'zensleep-audio-cache';
  
  if ('caches' in window) {
    // 打开或创建名为 'zensleep-audio-cache' 的缓存仓库
    const cache = await caches.open(cacheName);
    
    // 第一步：尝试从缓存读取
    const cachedResponse = await cache.match(url);
    if (cachedResponse && cachedResponse.ok) {
      console.log('✅ 从缓存读取:', url);
      return await cachedResponse.blob();
    }
    
    // 第二步：缓存不存在，从网络下载
    console.log('📥 从网络下载:', url);
    const networkResponse = await fetch(url, { credentials: 'same-origin' });
    
    if (!networkResponse.ok) {
      throw new Error(`Failed to fetch audio file: ${url}`);
    }
    
    // 第三步：将下载的文件保存到缓存，供下次使用
    cache.put(url, networkResponse.clone())
      .catch(() => console.log('缓存保存失败，继续使用'));
    
    return await networkResponse.blob();
  }
  
  // 备选方案：浏览器不支持 Cache API（很少见）
  const response = await fetch(url);
  return await response.blob();
}
```

### 调用路径

```
App.tsx (用户选择选项)
  ↓
handleNSDRDurationSelect() / handleSleepOptionSelect() / handleMusicDurationSelect()
  ↓
audioEngine.prepareAudioFile(contentConfig.audioFile)
  ↓
fetchAndCacheAudio(url)  ← 缓存逻辑在这里
  ↓
创建 HTMLAudioElement 并绑定 Blob URL
```

## 缓存存储位置

| 操作系统 | 存储位置 | 容量 |
|--------|---------|------|
| 📱 iOS Safari | `/Library/Caches/...` | ~50MB |
| 📱 Android Chrome | `/data/data/.../cache/` | 根据设备 |
| 💻 Desktop | 浏览器缓存目录 | 根据浏览器设置 |

## 缓存生命周期

### 何时创建
- ✅ 用户首次选择音频选项
- ✅ 自动触发下载
- ✅ 下载完成后自动保存

### 何时使用
- ✅ 用户再次选择同一音频
- ✅ 应用重新打开
- ✅ 浏览器标签页刷新

### 何时清除
- ⚠️ 用户手动清除浏览器数据
- ⚠️ 浏览器缓存容量满（自动清理旧数据）
- ⚠️ 应用卸载/浏览器卸载

## 浏览器兼容性

| 浏览器 | 支持 | 备注 |
|--------|------|------|
| Chrome | ✅ | 完全支持，推荐 |
| Safari | ✅ | iOS 11.3+ 支持 |
| Firefox | ✅ | 完全支持 |
| Edge | ✅ | 完全支持 |
| IE 11 | ❌ | 使用备选方案（每次都下载） |

## 验证缓存是否工作

### 方法 1：Chrome DevTools

1. 打开 Chrome
2. 按 `F12` 打开开发者工具
3. 进入 **Application** 选项卡
4. 左侧找到 **Cache Storage** → 展开 **zensleep-audio-cache**
5. 会看到缓存的 MP3 文件列表

### 方法 2：查看网络请求

1. 打开 DevTools → **Network** 选项卡
2. 选择 MP3 类型文件
3. **第一次**：显示 "Status: 200" + 文件大小
4. **第二次**：显示 "Status: 200" 但来源是 "cache"（绿色标记）

### 方法 3：检查日志

打开浏览器控制台，会看到：
```
第一次：📥 从网络下载: /audio/sleep/sleep-clear-mind.mp3
第二次：✅ 从缓存读取: /audio/sleep/sleep-clear-mind.mp3
```

## 缓存优化建议

### 1. 预加载所有音频（可选）

```typescript
// 在应用启动时预加载所有常用音频
const preloadAudioCache = async () => {
  const audioFiles = [
    '/audio/nsdr/nsdr-power-recharge.mp3',
    '/audio/nsdr/nsdr-stress-reset.mp3',
    '/audio/nsdr/nsdr-deep-recovery.mp3',
    '/audio/sleep/sleep-clear-mind.mp3',
    '/audio/sleep/sleep-relax-body.mp3',
    '/audio/sleep/sleep-calm-heart.mp3',
    '/audio/music/music-light.mp3',
    '/audio/music/music-balanced.mp3',
    '/audio/music/music-deep.mp3',
  ];
  
  for (const url of audioFiles) {
    await audioEngine.prepareAudioFile(url).catch(console.warn);
  }
};

// 在应用启动时调用
useEffect(() => {
  preloadAudioCache();
}, []);
```

### 2. 监控缓存大小

```typescript
const getCacheSize = async () => {
  if (!('storage' in navigator)) return 0;
  
  const storage = await navigator.storage.estimate();
  console.log(`缓存使用: ${(storage.usage / 1024 / 1024).toFixed(2)} MB`);
  console.log(`缓存容量: ${(storage.quota / 1024 / 1024).toFixed(2)} MB`);
};
```

### 3. 清除缓存（需要用户操作）

```typescript
const clearAudioCache = async () => {
  if ('caches' in window) {
    await caches.delete('zensleep-audio-cache');
    console.log('✅ 缓存已清除');
  }
};
```

## 故障排查

### 问题 1：缓存不起作用

**检查清单**：
- ✅ 浏览器是否支持 Cache API（大多数现代浏览器都支持）
- ✅ 是否在 HTTPS 环境下（Cache API 在 HTTP 上有限制）
- ✅ 缓存容量是否已满
- ✅ 清除浏览器数据后重新测试

### 问题 2：缓存文件损坏

**解决方案**：
```typescript
// 删除特定文件的缓存
const clearSpecificCache = async (url: string) => {
  const cache = await caches.open('zensleep-audio-cache');
  await cache.delete(url);
};

// 在启动时验证缓存完整性
const verifyCache = async (url: string) => {
  const cache = await caches.open('zensleep-audio-cache');
  const response = await cache.match(url);
  
  if (response && response.ok && response.status === 200) {
    console.log('✅ 缓存文件有效');
    return true;
  }
  
  console.log('❌ 缓存文件损坏，重新下载');
  await cache.delete(url);
  return false;
};
```

### 问题 3：用户反馈缓存不生效

**可能原因**：
1. **首次打开应用**：第一次下载需要网络，后续使用才从缓存读取
2. **不同 URL**：不同格式的 URL 被视为不同资源（例如带 `v=3` 版本号）
3. **浏览器隐私模式**：隐私/无痕模式可能禁用 Cache API

## 数据流示意图

```
┌─────────────────────────────────────────────────────────────┐
│                    ZenSleep 缓存流程                         │
└─────────────────────────────────────────────────────────────┘

用户交互层
    ↓
selectOption() → setAppStage('SESSION_PREP')
    ↓
prepareAudioFile(url)  ← 异步调用，不阻塞 UI
    ↓
fetchAndCacheAudio(url)
    ├─ 缓存存在？ → YES → 返回 Blob ✅ 瞬间完成
    └─ 缓存不存在？ → NO ↓
        ├─ 网络下载 MP3
        ├─ 保存到缓存
        └─ 返回 Blob ⏳ 需要等待
    ↓
创建 URL.createObjectURL(blob)
    ↓
绑定到 HTMLAudioElement.src
    ↓
播放 🎵

下次使用时 ⚡:
selectOption() → ... → fetchAndCacheAudio() 
                                 ↓
                            直接返回缓存 ✅
```

## 性能指标

| 场景 | 响应时间 | 说明 |
|-----|---------|------|
| 首次下载（3G）| 1-3秒 | 取决于网络速度 |
| 缓存读取 | <100ms | 从本地存储读取 |
| 相对提升 | **90% ↓** | 缓存比首次下载快 90% |

## 测试场景

### 场景 1：正常使用

```
1. 用户打开应用
2. 选择"清脑·卸载繁杂"
3. 观察：下载进度条 📥 → SESSION_PREP 界面
4. 用户点击"开始睡眠引导" → 音频播放
5. 关闭应用

下次使用：
1. 用户打开应用
2. 再次选择"清脑·卸载繁杂"
3. 观察：✅ 瞬间进入 SESSION_PREP（无下载等待）
4. 用户点击"开始睡眠引导" → 音频播放
```

### 场景 2：离线测试

```
1. 用户在有网络时使用应用并缓存音频
2. 断网（飞行模式）
3. 用户再次选择已缓存的音频
4. 观察：✅ 仍可正常使用（从缓存读取）
```

### 场景 3：清除缓存后

```
1. 用户清除浏览器数据
2. 重新打开应用
3. 选择音频
4. 观察：📥 重新下载（缓存已清除）
```

## 总结

✅ **ZenSleep 缓存机制**：
- 完全自动，无需用户配置
- 使用业界标准的 Cache API
- 支持所有现代浏览器
- 每次使用后智能缓存
- 下次使用时瞬间加载

💡 **用户体验**：
- **首次**：需要等待网络下载
- **之后**：瞬间响应，无等待
- **离线**：已缓存的音频可离线使用
