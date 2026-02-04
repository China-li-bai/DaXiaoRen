# PartyKit 快速开始指南

## 🚀 5 分钟快速部署 PartyKit

### 步骤 1：获取 Cloudflare 凭证（2 分钟）

#### 1.1 获取 Account ID

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择 `dadaxiaoren.com`
3. 进入 **Workers & Pages**
4. 复制右侧的 **Account ID**

#### 1.2 创建 API Token

1. 进入 [API Tokens 页面](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **Create Token**
3. 使用 **Edit Cloudflare Workers** 模板
4. 点击 **Continue to summary** → **Create Token**
5. 复制生成的 Token（只显示一次！）

---

### 步骤 2：设置环境变量（1 分钟）

#### Windows (Git Bash)

```bash
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export CLOUDFLARE_API_TOKEN="your-api-token"
```

#### Windows (PowerShell)

```powershell
$env:CLOUDFLARE_ACCOUNT_ID="your-account-id"
$env:CLOUDFLARE_API_TOKEN="your-api-token"
```

#### Linux / Mac

```bash
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export CLOUDFLARE_API_TOKEN="your-api-token"
```

---

### 步骤 3：运行部署脚本（2 分钟）

```bash
# 进入项目根目录
cd /path/to/DaXiaoRen

# 运行部署脚本
bash deploy-partykit.sh
```

脚本会自动：
- ✅ 安装 PartyKit CLI
- ✅ 部署到 Cloudflare
- ✅ 显示 PartyKit URL

---

### 步骤 4：更新前端连接（1 分钟）

部署成功后，会显示类似：
```
🌐 PartyKit URL:
https://villain-smash-party.username.partykit.workers.dev
```

编辑 `components/LeaderboardWidget.tsx`：

```typescript
// 替换为实际的 PartyKit URL
const PARTYKIT_HOST = window.location.hostname === 'localhost' 
  ? '127.0.0.1:1999' 
  : 'https://villain-smash-party.username.partykit.workers.dev';
```

---

### 步骤 5：重新部署前端（1 分钟）

```bash
# 构建并上传
npm run build
./deploy-update.sh
```

---

### 步骤 6：清除 Cloudflare 缓存（30 秒）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择 `dadaxiaoren.com`
3. 进入 **Caching** → **Configuration**
4. 点击 **Purge Everything**

---

## ✅ 完成！

现在访问 `http://dadaxiaoren.com`，排行榜功能应该可以正常工作了！

---

## 🎯 验证部署

### 1. 检查 PartyKit URL

在浏览器中访问部署时显示的 PartyKit URL，应该看到：
```
PartyKit server is running
```

### 2. 检查 WebSocket 连接

1. 访问 `http://dadaxiaoren.com`
2. 按 F12 打开开发者工具
3. 切换到 **Network** 标签
4. 筛选 **WS** (WebSocket)
5. 查看是否有连接到 PartyKit 的连接

### 3. 测试排行榜功能

1. 在网站上点击"打小人"
2. 打开排行榜（点击左下角 🏆 按钮）
3. 查看分数是否实时更新

---

## 🚨 常见问题

### 问题：环境变量未设置

**错误**：
```
❌ 错误: CLOUDFLARE_ACCOUNT_ID 环境变量未设置
```

**解决**：先设置环境变量，再运行脚本

### 问题：API Token 权限不足

**错误**：
```
Error: Authentication error
```

**解决**：
1. 检查 API Token 权限
2. 确保包含：Workers Scripts - Edit

### 问题：部署失败

**错误**：
```
Error: Deployment failed
```

**解决**：
1. 检查 `partykit/partykit.json` 是否存在
2. 检查 `partykit/server.ts` 是否有语法错误
3. 运行 `npx partykit deploy --verbose` 查看详细错误

---

## 📚 详细文档

| 文档 | 用途 |
|------|------|
| [PARTYKIT_DEPLOYMENT.md](PARTYKIT_DEPLOYMENT.md) | 完整部署指南 |
| [deploy-partykit.sh](deploy-partykit.sh) | 自动化部署脚本 |
| [PartyKit 官方文档](https://docs.partykit.io/guides/deploy-to-cloudflare/) | 官方指南 |

---

## 🎉 总结

**部署流程**：
1. 获取 Cloudflare Account ID 和 API Token
2. 设置环境变量
3. 运行 `./deploy-partykit.sh`
4. 更新前端 `PARTYKIT_HOST`
5. 重新部署前端
6. 清除 Cloudflare 缓存

**预计时间**：5-10 分钟

**费用**：免费

---

**最后更新**：2026-02-04
