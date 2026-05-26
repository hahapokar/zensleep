# ZenSleep 自动部署指南

## 🚀 快速开始

### 方法一：使用自动部署脚本（推荐）

```bash
cd /Users/patrick/Desktop/软件/zensleep
bash auto-deploy.sh
```

脚本会自动完成以下步骤：
1. ✅ 检查优化文件
2. ✅ 安装依赖
3. ✅ 类型检查
4. ✅ 构建项目
5. ✅ 部署到 GitHub Pages
6. ✅ 显示访问地址

### 方法二：手动部署

```bash
# 1. 安装依赖
npm install

# 2. 类型检查
npm run lint

# 3. 构建
npm run build

# 4. 部署
npm run deploy
```

## 📋 文件结构

```
zensleep/
├── src/
│   ├── lib/
│   │   └── AudioEngine.ts    ← 优化缓存机制
│   ├── components/            ← UI 组件
│   ├── App.tsx                ← 主应用（含 iOS 兼容）
│   └── ...
├── auto-deploy.sh            ← 一键部署脚本
└── package.json
```

## 🎯 优化功能

### 1. WakeLock 智能管理
- **问题**：用户切换标签页时，WakeLock 会自动释放
- **解决**：监听 `visibilitychange` 事件，页面重新可见时自动重新申请
- **效果**：屏幕常亮，不会意外熄灭

```javascript
// App.tsx 中的实现
useEffect(() => {
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && isPlaying) {
      await requestWakeLock();
      startScreenAutoOff();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
}, [isPlaying, requestWakeLock]);
```

### 2. 音频加载状态反馈
- **问题**：用户不知道音频是否加载完成
- **解决**：显示加载动画，禁用按钮直到音频就绪
- **效果**：更好的用户体验

```javascript
// 新增状态
const [isAudioReady, setIsAudioReady] = useState(false);

// 按钮状态
<button disabled={!isAudioReady}>
  {!isAudioReady ? '正在加载音频...' : '开始睡眠引导'}
</button>
```

### 3. iOS Safari 兼容
- **问题**：iOS Safari 不支持 `requestFullscreen()` API
- **解决**：自动检测 iOS 设备，使用 CSS 伪全屏模式
- **效果**：在 iPhone/iPad 上也能全屏播放

```javascript
// iOS 检测
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// CSS 伪全屏
body.force-fullscreen {
  height: 100dvh;
  overflow: hidden;
  position: fixed;
}
```

### 4. 三层缓存机制
- **内存缓存**：同一页面会话，最快
- **浏览器缓存**：Cache API，持久化
- **HTTP 缓存**：利用 CDN 缓存

## 🔧 调试技巧

### 查看控制台日志

1. 打开浏览器开发者工具 (F12)
2. 切换到 Console 标签
3. 查看以下日志：

```
[App] WakeLock 已申请
[App] 音频已准备就绪
[AudioEngine] ⚡⚡ 内存缓存命中，瞬间返回!   ← 第三次访问
[AudioEngine] ✅ 浏览器缓存命中             ← 第二次访问
[AudioEngine] 📥 正在从网络下载音频: ...    ← 第一次访问
[App] 页面重新可见，重新申请 WakeLock        ← 切换标签后
```

### 清除缓存

如果遇到缓存问题，可以：

1. **清除浏览器缓存**
   - Mac: `Cmd + Shift + Delete`
   - Windows: `Ctrl + Shift + Delete`

2. **清除特定网站缓存**
   - 打开开发者工具
   - 右键点击刷新按钮
   - 选择 "清空缓存并硬性重新加载"

## 📊 性能预期

| 访问次数 | 加载方式 | 预计时间 |
|---------|---------|---------|
| 第一次 | 下载音频（~30MB） | 10-30 秒 |
| 第二次 | 浏览器缓存 | 1-3 秒 |
| 第三次 | 内存缓存 | < 0.1 秒 |

## 🐛 常见问题

### Q: 部署后还是慢？
A: 
1. 确认音频文件已上传到 Cloudflare R2
2. 检查浏览器控制台是否有缓存日志
3. 尝试清除浏览器缓存后重新访问

### Q: iOS 上无法全屏？
A: 这是正常的，iOS Safari 不支持全屏 API。脚本会自动使用 CSS 伪全屏模式。

### Q: WakeLock 不工作？
A: 
1. 确认在 HTTPS 环境下访问
2. 确认浏览器支持 WakeLock API
3. 检查控制台是否有相关日志

### Q: 音频加载失败？
A: 
1. 确认 Cloudflare R2 bucket 设置为 Public
2. 检查音频文件 URL 是否正确
3. 查看控制台错误信息

## 📞 技术支持

如果遇到其他问题，请查看：
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [浏览器控制台日志](#调试技巧)

---

**版本**: v2.0  
**更新日期**: 2026-05-25  
**作者**: AI Assistant  
**许可证**: MIT
