# R2 音频加载诊断指南

## 问题描述

虽然在浏览器地址栏中可以直接打开音频文件链接，但应用中通过 fetch 请求加载音频时仍然返回 **404 或 CORS 错误**。

## 原因分析

这通常是以下问题导致的：

1. **CORS 跨域配置不正确**
   - R2 bucket 未配置 CORS headers
   - 或 CORS 配置中未包含你的应用域名

2. **Fetch 请求配置不兼容**
   - `credentials` 选项设置不当
   - `mode` 配置与 R2 不兼容

3. **音频文件权限问题**
   - 文件存在但权限设置为私密
   - 需要特殊认证头

4. **网络/代理问题**
   - ISP 或代理拦截了 fetch 请求
   - 需要特定的 User-Agent 或 Referrer 头

---

## 🔧 快速诊断步骤

### 步骤 1：打开开发者工具

按 `F12` 打开浏览器开发者工具，进入 **Console** 标签页。

### 步骤 2：运行诊断命令

在 Console 中输入并执行：

```javascript
zenSleepDiagnose()
```

**预期输出**（成功情况）：
```
[AudioEngine] 🔍 开始诊断 R2 连接...
[AudioEngine] 测试 URL: https://pub-301aea272da946d0a14d11fde1885996.r2.dev/sleep-buddha.mp3
[AudioEngine] 📡 尝试: 标准 CORS
[AudioEngine] ✅ 标准 CORS 成功 (1234ms)
[AudioEngine] 状态码: 200, 内容类型: audio/mpeg
[AudioEngine] 文件大小: 5678901 bytes
[AudioEngine] CORS 头: https://hahapokar.github.io
```

### 步骤 3：解读诊断结果

#### ✅ 诊断成功（状态码 200）

如果任何测试返回 **200**，说明网络连接没问题。此时：
- 清除浏览器缓存（Ctrl+Shift+Delete）
- 硬刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）
- 重新打开网站

#### ❌ 所有诊断都失败

检查以下问题：

**问题 A：都是 404 错误**
```
❌ 标准 CORS 失败: Response status 404
❌ 无 mode 失败: Response status 404
```

**原因**：文件在 R2 中不存在
- 访问 Cloudflare R2 控制面板检查文件
- 确保文件名完全匹配（包括扩展名）

**问题 B：CORS 错误或跨域错误**
```
❌ 标准 CORS 失败: CORS policy blocked
❌ 无 mode 失败: Failed to fetch
```

**原因**：R2 CORS 配置不正确
- 见下方的 [CORS 配置步骤](#cors-配置)

**问题 C：网络超时**
```
❌ 标准 CORS 失败: Network timeout
❌ 无 mode 失败: Connection refused
```

**原因**：网络连接问题
- 检查网络连接
- 尝试用隐身模式打开网站
- 检查代理或防火墙设置

---

## 🔐 CORS 配置

### 检查当前 CORS 设置

1. 打开 Cloudflare 控制台：https://dash.cloudflare.com
2. 进入 **R2** 部分
3. 点击你的 bucket 名称
4. 进入 **Settings → CORS**

### 正确的 CORS 配置

确保 CORS 规则包含以下内容：

```json
[
  {
    "AllowedOrigins": [
      "https://hahapokar.github.io",
      "https://pub-301aea272da946d0a14d11fde1885996.r2.dev"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "Content-Length",
      "Content-Type"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### 设置 CORS 的步骤

1. 在 R2 bucket 的 Settings 中找到 CORS 部分
2. 删除现有规则（如有）
3. 添加新规则：
   - **AllowedOrigins**: `https://hahapokar.github.io`
   - **AllowedMethods**: `GET, HEAD`
   - **AllowedHeaders**: `*`
   - **MaxAgeSeconds**: `3600`
4. 点击 Save
5. 等待 1-2 分钟生效

---

## 🧪 进阶诊断

### 检查缓存状态

在 Console 中运行：

```javascript
// 查看内存缓存
audioEngine.getCacheInfo()

// 查看浏览器 Cache API
caches.keys().then(names => {
  console.log('缓存列表:', names);
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(requests => {
        console.log(`${name}:`, requests.map(r => r.url));
      });
    });
  });
});
```

### 检查 Network 标签

1. 打开 F12 → **Network** 标签
2. 刷新页面
3. 搜索 "sleep-buddha"
4. 查看请求的以下信息：
   - **Status**: 应该是 200（不是 404）
   - **Type**: 应该是 "media" 或 "other"
   - **Response Headers** → `access-control-allow-origin`: 应该包含你的域名
   - **Response Headers** → `content-type`: 应该是 "audio/mpeg"

### 手动测试 Fetch

在 Console 中测试各种 fetch 配置：

```javascript
// 测试 1: 标准 CORS
fetch('https://pub-301aea272da946d0a14d11fde1885996.r2.dev/sleep-buddha.mp3', {
  mode: 'cors',
  cache: 'force-cache'
}).then(r => console.log('状态:', r.status, '类型:', r.headers.get('content-type')))
  .catch(e => console.error('错误:', e.message));

// 测试 2: 无 mode（让浏览器自动处理）
fetch('https://pub-301aea272da946d0a14d11fde1885996.r2.dev/sleep-buddha.mp3', {
  cache: 'force-cache'
}).then(r => console.log('状态:', r.status))
  .catch(e => console.error('错误:', e.message));

// 测试 3: no-cors（最宽松）
fetch('https://pub-301aea272da946d0a14d11fde1885996.r2.dev/sleep-buddha.mp3', {
  mode: 'no-cors'
}).then(r => console.log('状态:', r.status, '类型:', r.type))
  .catch(e => console.error('错误:', e.message));
```

---

## 📋 问题排查清单

| 检查项 | 结果 | 说明 |
|--------|------|------|
| 在浏览器中直接打开链接 | ✅ 可以 | 文件存在 |
| 运行 `zenSleepDiagnose()` | ✅ 返回 200 | CORS 配置正确 |
| Cache API 中有文件 | ✅ 有 | 缓存生效 |
| Network 标签中状态码 | ✅ 200 | 网络请求成功 |
| Console 中无 CORS 错误 | ✅ 无错误 | 跨域配置正确 |

---

## 💡 快速解决方案

### 方案 1：清除所有缓存（最快）

1. 按 **Ctrl+Shift+Delete**（Windows）或 **Cmd+Shift+Delete**（Mac）
2. 选择 **All time**
3. 仅勾选 "Cookies and cached images/files"
4. 点击 Clear browsing data
5. 硬刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）

### 方案 2：在隐身模式测试

1. 打开隐身/无痕窗口
2. 访问网站
3. 如果隐身模式下正常工作，说明是浏览器缓存问题

### 方案 3：检查扩展干扰

某些浏览器扩展（如广告拦截器、代理工具）可能干扰 fetch 请求：
1. 禁用所有扩展
2. 重新测试

### 方案 4：更新 R2 配置后等待

如果刚修改了 CORS 设置：
1. 等待 1-2 分钟
2. 清除浏览器缓存
3. 硬刷新页面

---

## 🚨 如果问题仍未解决

请收集以下信息并联系支持：

1. **诊断输出**（运行 `zenSleepDiagnose()` 的完整日志）
2. **浏览器和操作系统版本**
3. **Network 标签中音频请求的详细信息**：
   - Request Headers
   - Response Status
   - Response Headers
4. **R2 bucket 的 CORS 配置**
5. **错误消息的完整截图**

---

## 参考资源

- [Cloudflare R2 CORS 文档](https://developers.cloudflare.com/r2/buckets/cross-origin-resource-sharing/)
- [MDN CORS 指南](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Chrome DevTools Network 标签](https://developer.chrome.com/docs/devtools/network/)
- [Fetch API 文档](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
