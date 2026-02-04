# PartyKit 部署到 Cloudflare 指南

## 📋 概述

本文档说明如何将 PartyKit 服务器部署到你自己的 Cloudflare 账户。

**部署模式**：Cloud-Prem（部署到自己的 Cloudflare 账户）
**费用**：免费

---

## 🎯 部署前准备

### 1. 获取 Cloudflare Account ID

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择你的域名（如 `dadaxiaoren.com`）
3. 进入 **Workers & Pages**
4. 在右侧可以看到 **Account ID**
5. 复制 Account ID（格式类似：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

### 2. 创建 Cloudflare API Token

1. 进入 [API Tokens 页面](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **Create Token**
3. 使用 **Edit Cloudflare Workers** 模板
4. 配置权限：
   - Account - Workers Scripts - Edit
   - Account - Account Settings - Read
   - Zone - Zone - Read
5. 设置 TTL 和 IP 限制
6. 点击 **Continue to summary**
7. 复制生成的 API Token（只显示一次，请妥善保存）

---

## 🚀 部署步骤

### 方法 1：使用部署脚本（推荐）

#### 1. 设置环境变量

```bash
# Windows (PowerShell)
$env:CLOUDFLARE_ACCOUNT_ID="your-account-id"
$env:CLOUDFLARE_API_TOKEN="your-api-token"

# Windows (Git Bash)
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export CLOUDFLARE_API_TOKEN="your-api-token"

# Linux/Mac
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export CLOUDFLARE_API_TOKEN="your-api-token"
```

#### 2. 运行部署脚本

```bash
# 进入项目根目录
cd /path/to/DaXiaoRen

# 运行部署脚本
bash deploy-partykit.sh
```

### 方法 2：手动部署

#### 1. 安装 PartyKit CLI

```bash
npm install -g partykit
```

#### 2. 进入 PartyKit 目录

```bash
cd partykit
```

#### 3. 部署到 Cloudflare

```bash
# 基本部署
CLOUDFLARE_ACCOUNT_ID=your-account-id \
CLOUDFLARE_API_TOKEN=your-api-token \
npx partykit deploy

# 指定域名部署（可选）
CLOUDFLARE_ACCOUNT_ID=your-account-id \
CLOUDFLARE_API_TOKEN=your-api-token \
npx partykit deploy --domain party.dadaxiaoren.com
```

#### 4. 获取部署信息

```bash
npx partykit info
```

会显示类似：
```
🌐 PartyKit URL:
https://villain-smash-party.username.partykit.workers.dev

📊 Room URL:
https://villain-smash-party.username.partykit.workers.dev/party/global-leaderboard
```

---

## 📝 部署后配置

### 1. 更新前端连接地址

编辑 `components/LeaderboardWidget.tsx`：

```typescript
// 替换为实际的 PartyKit URL
const PARTYKIT_HOST = window.location.hostname === 'localhost' 
  ? '127.0.0.1:1999' 
  : 'https://villain-smash-party.username.partykit.workers.dev'; // 替换为实际 URL
```

### 2. 重新部署前端

```bash
# 构建并上传
npm run build
./deploy-update.sh
```

### 3. 清除 Cloudflare 缓存

在 Cloudflare Dashboard 中清除 `dadaxiaoren.com` 的缓存。

---

## 🔧 高级配置

### 使用自定义域名

如果你想使用 `party.dadaxiaoren.com` 作为 PartyKit URL：

```bash
# 1. 在 Cloudflare DNS 中添加 CNAME 记录
# 类型: CNAME
# 名称: party
# 内容: villain-smash-party.username.partykit.workers.dev

# 2. 部署时指定域名
CLOUDFLARE_ACCOUNT_ID=your-account-id \
CLOUDFLARE_API_TOKEN=your-api-token \
npx partykit deploy --domain party.dadaxiaoren.com
```

### 配置环境变量

在 `partykit/partykit.json` 中配置：

```json
{
  "name": "villain-smash-party",
  "main": "server.ts",
  "compatibilityDate": "2025-01-01",
  "minify": true,
  "vars": {
    "API_KEY": {
      "description": "Google Gemini API Key for AI generation",
      "dev": "your-dev-api-key",
      "prod": "your-prod-api-key"
    }
  }
}
```

部署时设置生产环境变量：

```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id \
CLOUDFLARE_API_TOKEN=your-api-token \
PARTYKIT_API_KEY=your-prod-api-key \
npx partykit deploy --prod
```

---

## 🚨 故障排查

### 问题 1：API Token 权限不足

**错误信息**：
```
Error: Authentication error
```

**解决方案**：
1. 检查 API Token 权限
2. 确保包含以下权限：
   - Account - Workers Scripts - Edit
   - Account - Account Settings - Read
   - Zone - Zone - Read

### 问题 2：Account ID 错误

**错误信息**：
```
Error: Invalid account ID
```

**解决方案**：
1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages
3. 复制正确的 Account ID

### 问题 3：部署失败

**错误信息**：
```
Error: Deployment failed
```

**解决方案**：
```bash
# 检查 PartyKit 配置
cat partykit/partykit.json

# 检查服务器代码
cat partykit/server.ts

# 查看详细错误
npx partykit deploy --verbose
```

### 问题 4：前端无法连接

**错误信息**：
```
WebSocket connection failed
```

**解决方案**：
1. 检查 `PARTYKIT_HOST` 是否正确
2. 检查 PartyKit URL 是否可访问
3. 检查浏览器控制台错误信息

---

## 📊 部署验证

### 1. 检查 PartyKit URL

```bash
# 测试 PartyKit 服务器
curl -I https://villain-smash-party.username.partykit.workers.dev
```

应该返回：`HTTP/1.1 200 OK`

### 2. 测试 WebSocket 连接

在浏览器中打开 `http://dadaxiaoren.com`：
1. 按 F12 打开开发者工具
2. 切换到 Network 标签
3. 筛选 WS (WebSocket)
4. 查看是否有连接到 PartyKit 的 WebSocket

### 3. 测试排行榜功能

1. 在网站上点击"打小人"
2. 打开排行榜
3. 查看分数是否实时更新

---

## 🎉 完成检查清单

### Cloudflare 配置

- [ ] 已获取 Account ID
- [ ] 已创建 API Token
- [ ] API Token 权限正确

### PartyKit 部署

- [ ] PartyKit CLI 已安装
- [ ] 环境变量已设置
- [ ] 部署成功
- [ ] 已获取 PartyKit URL

### 前端配置

- [ ] PARTYKIT_HOST 已更新
- [ ] 前端已重新部署
- [ ] Cloudflare 缓存已清除

### 功能验证

- [ ] PartyKit URL 可访问
- [ ] WebSocket 连接成功
- [ ] 排行榜实时更新

---

## 📚 相关文档

| 文档 | 用途 |
|------|------|
| [PartyKit 官方文档](https://docs.partykit.io/guides/deploy-to-cloudflare/) | 官方部署指南 |
| [deploy-partykit.sh](deploy-partykit.sh) | 自动化部署脚本 |
| [partykit/server.ts](partykit/server.ts) | PartyKit 服务器代码 |
| [partykit/partykit.json](partykit/partykit.json) | PartyKit 配置 |

---

## 🎯 快速参考

### 部署命令

```bash
# 设置环境变量
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export CLOUDFLARE_API_TOKEN="your-api-token"

# 部署
cd partykit
npx partykit deploy --prod

# 获取 URL
npx partykit info
```

### 更新前端

```typescript
// components/LeaderboardWidget.tsx
const PARTYKIT_HOST = window.location.hostname === 'localhost' 
  ? '127.0.0.1:1999' 
  : 'https://your-partykit-url.partykit.workers.dev';
```

---

**最后更新**：2026-02-04
