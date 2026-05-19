# 部署指南

## npm run deploy 故障排除

### 问题：SSH 连接被重置或 DNS 解析失败

#### 解决方案 1：使用 GitHub CLI (推荐)

1. 安装 GitHub CLI:
```bash
brew install gh
```

2. 登录 GitHub:
```bash
gh auth login
```

3. 运行部署脚本:
```bash
npm run build && gh-pages -d dist --nojekyll
```

#### 解决方案 2：使用 Personal Access Token (HTTPS)

1. 在 GitHub 创建 Personal Access Token:
   - 访问 https://github.com/settings/tokens
   - 创建新 token，选择 `public_repo` 权限
   - 复制 token

2. 配置 git 凭证:
```bash
# 方法 A: 使用 credential manager
git config --global credential.helper osxkeychain
# 然后运行部署，会提示输入用户名和 token

# 方法 B: 直接在 URL 中设置 (不推荐，不安全)
# git remote set-url origin https://<username>:<token>@github.com/hahapokar/zensleep.git
```

3. 运行部署:
```bash
npm run deploy
```

#### 解决方案 3：修复 SSH 密钥

1. 生成或检查 SSH 密钥:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. 添加到 GitHub:
   - https://github.com/settings/keys
   - 复制公钥内容 (`~/.ssh/id_ed25519.pub`)
   - 添加为新 SSH 密钥

3. 测试 SSH 连接:
```bash
ssh -T git@github.com
```

4. 确保使用 SSH 远程 URL:
```bash
git remote set-url origin git@github.com:hahapokar/zensleep.git
npm run deploy
```

### 网络问题排除

1. 测试网络连接:
```bash
ping github.com
```

2. 如果 DNS 解析失败，尝试使用其他 DNS:
```bash
# 临时使用 Google DNS
networksetup -setdnsservers Wi-Fi 8.8.8.8 8.8.4.4
```

3. 检查防火墙/代理设置

### 验证部署

部署成功后，访问: https://hahapokar.github.io/zensleep

## 本地部署测试

```bash
npm run build
npm run preview  # 在 http://localhost:4173 预览
```
