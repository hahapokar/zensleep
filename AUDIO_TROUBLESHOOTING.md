# ZenSleep 音频加载问题排查指南

## 问题现象

```
Failed to load resource: the server responded with a status of 404 (Not Found)
https://pub-301aea272da946d0a14d11fde1885996.r2.dev/sleep-buddha.mp3
```

**原因**：Cloudflare R2 bucket 中不存在对应的音频文件

---

## ✅ 解决方案

### 方案一：检查并上传音频文件到 Cloudflare R2（推荐）

#### 1️⃣ 检查 R2 bucket 中存在的文件

访问 Cloudflare 控制面板：
- https://dash.cloudflare.com → R2 → 你的 bucket

确保以下文件存在（或上传缺失的文件）：

**NSDR 音频**：
- `nsdr-power-recharge.mp3`
- `nsdr-stress-reset.mp3`
- `nsdr-deep-recovery.mp3`

**睡眠引导音频**：
- `sleep-clear-mind.mp3`
- `sleep-relax-body.mp3`
- `sleep-calm-heart.mp3`
- `sleep-buddha.mp3`

**音乐伴眠**：
- `music-light.mp3`
- `music-balanced.mp3`
- `music-deep.mp3`

**白噪音**：
- `whitenoise-campfire.mp3`
- `whitenoise-thunder.mp3`
- `whitenoise-nature.mp3`
- `whitenoise-wave.mp3`
- `whitenoise-waterdrop.mp3`

#### 2️⃣ 上传音频文件

如果文件不存在，通过以下方式上传：

**方式 A：使用 Cloudflare 控制台**
```
1. 进入 Cloudflare R2 dashboard
2. 点击 bucket 名称
3. 点击 "Upload" 上传文件
4. 确保文件名完全匹配（包括扩展名）
```

**方式 B：使用 AWS S3 CLI**
```bash
# 配置 R2 凭证（从 Cloudflare 控制台获取）
aws configure --profile r2

# 上传单个文件
aws s3 cp sleep-buddha.mp3 s3://your-bucket-name/ --profile r2

# 批量上传文件夹
aws s3 cp ./audio-files s3://your-bucket-name/ --recursive --profile r2
```

**方式 C：使用 rclone**
```bash
# 配置 rclone
rclone config create r2 s3 \
  provider Cloudflare \
  access_key_id $YOUR_ACCESS_KEY \
  secret_access_key $YOUR_SECRET_KEY \
  endpoint https://bucket-name.r2.dev

# 上传
rclone copy ./audio-files r2:bucket-name/
```

#### 3️⃣ 验证 CORS 设置（重要！）

确保 R2 bucket 允许跨域请求：

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://hahapokar.github.io"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

设置路径：R2 dashboard → Settings → CORS

---

### 方案二：使用本地测试音频（开发阶段）

如果你在开发时没有真实音频文件，可以临时使用生成的音频或样本文件：

#### 1️⃣ 使用开源音乐库

```bash
# 下载免费的 ambient/sleep 音乐
# 推荐源：Freesound.org, Pixabay Music, Free Music Archive

# 示例：使用 curl 下载
curl -o sleep-buddha.mp3 "https://example-music-source.com/ambient.mp3"
```

#### 2️⃣ 生成测试音频

```bash
# 使用 ffmpeg 生成静音 MP3（用于测试）
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1800 \
  -q:a 9 -acodec libmp3lame test.mp3

# 生成简单的 tone 音频
ffmpeg -f lavfi -i "sine=f=440:d=1800" -q:a 9 -acodec libmp3lame test.mp3
```

---

### 方案三：添加 fallback 音频 URL

如果临时无法上传文件到 R2，可以在 `src/lib/ContentManager.ts` 中添加 fallback URL：

```typescript
// 示例：使用备选服务器
const PRIMARY_R2_URL = 'https://pub-301aea272da946d0a14d11fde1885996.r2.dev/';
const FALLBACK_AUDIO_URL = 'https://backup-server.com/audio/';

// 在 generateContentConfig 中
if (symptoms.includes('sleep') && sleepOption) {
  audioFile = `${PRIMARY_R2_URL}sleep-${sleepOption}.mp3`;
  // 如果加载失败，AudioEngine 会自动重试
}
```

---

## 🔧 改进的错误处理

最新版本已包含以下改进：

### ✅ 自动重试机制
- **失败时的重试次数**：2 次
- **重试延迟**：1秒、2秒递增
- **日志输出**：清晰的重试状态提示

```
[AudioEngine] 📥 正在从网络下载音频 (尝试 1/3): https://...
[AudioEngine] ⚠️  文件未找到 (404)，1秒后重试...
[AudioEngine] 📥 正在从网络下载音频 (尝试 2/3): https://...
```

### ✅ 多层缓存
1. **内存缓存**：超快速，毫秒级返回
2. **浏览器缓存 API**：30MB~50MB，应用级缓存
3. **HTTP 缓存**：服务器强缓存 1 年

### ✅ 性能优化
- **DNS 预解析**：加快域名解析
- **预连接**：建立 TCP 连接
- **后台预加载**：应用启动时异步加载常用音频
- **requestIdleCallback**：非阻塞初始化

---

## 📋 调试检查清单

使用浏览器开发者工具（F12）进行调试：

### 1️⃣ 检查网络请求

**Console 标签页**：
```javascript
// 查看最近的音频加载日志
console.log(audioEngine.getCacheInfo());
```

**Network 标签页**：
```
过滤 "sleep-buddha"
- 检查状态码（应该是 200，而不是 404）
- 检查响应头 Content-Type: audio/mpeg
- 检查响应大小（不应该为 0）
```

### 2️⃣ 检查浏览器缓存

**Application → Cache Storage**：
```
zensleep-audio-v2 → 应该包含已加载的音频文件
```

### 3️⃣ 检查跨域问题

**Console 标签页**（红色错误）：
```
如果看到 CORS 错误，则需要配置 R2 CORS 设置
```

### 4️⃣ 检查 R2 配置

```bash
# 使用 curl 测试 R2 可访问性
curl -I "https://pub-301aea272da946d0a14d11fde1885996.r2.dev/sleep-buddha.mp3"

# 输出应该显示：
# HTTP/1.1 200 OK  ✅
# 而不是：
# HTTP/1.1 404 Not Found  ❌
```

---

## 🚀 快速修复步骤

1. **确认文件存在**
   ```bash
   curl -I "https://pub-301aea272da946d0a14d11fde1885996.r2.dev/sleep-buddha.mp3"
   # 应该返回 200，不是 404
   ```

2. **检查 CORS**
   ```bash
   curl -H "Origin: https://hahapokar.github.io" \
        -H "Access-Control-Request-Method: GET" \
        -I "https://pub-301aea272da946d0a14d11fde1885996.r2.dev/sleep-buddha.mp3"
   ```

3. **清除浏览器缓存**
   - Ctrl+Shift+Delete（Windows）或 Cmd+Shift+Delete（Mac）
   - 选择 "All time"，仅勾选 Cookies and Cached images/files

4. **在隐身模式测试**
   - 确保不是旧的浏览器缓存问题

5. **部署新版本**
   ```bash
   git push origin main  # 触发 GitHub Actions 部署
   ```

---

## 📞 需要帮助？

如果问题仍未解决，请提供以下信息：

1. **错误消息**（从 Console 复制）
2. **R2 bucket 名称和 URL**
3. **Network 标签中的完整请求信息**
4. **浏览器版本和操作系统**

---

## 参考资源

- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [S3 API 兼容性](https://developers.cloudflare.com/r2/api/s3/compatibility/)
- [CORS 配置指南](https://developers.cloudflare.com/r2/buckets/cross-origin-resource-sharing/)
