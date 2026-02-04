# 部署指南

## 📋 部署架构

本项目采用 **双栈部署** 架构：

1. **前端应用**：GitHub Pages（静态托管）
2. **后端服务**：Cloudflare PartyKit（实时 WebSocket）

---

## 🚀 快速部署

### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

| Secret 名称 | 说明 | 必需 |
|------------|------|--------|
| `API_KEY` | Google Gemini API 密钥 | ✅ |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | ✅ |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | ✅ |

### 2. 推送代码到 GitHub

```bash
git add .
git commit -m "Update deployment config"
git push origin main
```

GitHub Actions 会自动触发部署流程。

---

## 📦 部署流程

### GitHub Actions 工作流

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 包含三个任务：

1. **Build**：构建前端应用
2. **Deploy GitHub Pages**：部署静态网站
3. **Deploy PartyKit**：部署实时后端

### 部署步骤

```
触发（push 或手动）
  ↓
构建前端（npm run build）
  ↓
上传构建产物（dist/）
  ↓
并行部署：
  ├─> GitHub Pages（静态网站）
  └─> Cloudflare PartyKit（实时服务）
```

---

## 🌐 域名配置

### 方案 A：使用 GitHub Pages 域名

1. 在 GitHub 仓库设置中：
   - Settings → Pages → Custom domain
   - 添加 `dadaxiaoren.com`

2. 配置 DNS：
   ```
   类型: CNAME
   主机记录: @
   记录值: your-username.github.io
   ```

### 方案 B：使用 Cloudflare Pages（推荐）

1. 在 Cloudflare Dashboard：
   - Workers & Pages → Create Application → Pages
   - 连接 GitHub 仓库
   - 添加自定义域 `dadaxiaoren.com`

2. Cloudflare 自动配置 DNS

### 方案 C：VPS + Cloudflare（当前配置）

**当前服务器**：192.227.177.133

1. 配置 DNS 解析：
   ```
   类型: A
   主机记录: @
   记录值: 192.227.177.133
   TTL: 600
   ```

2. 配置 CNAME（可选）：
   ```
   类型: CNAME
   主机记录: www
   记录值: @
   ```

---

## 🔧 Cloudflare 配置

### 获取 Cloudflare API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. My Profile → API Tokens
3. Create Token → 选择权限：
   - Account → Cloudflare Pages:Edit
   - Account → Workers Scripts:Edit
   - Zone → Zone:Read

### 获取 Account ID

1. 在 Cloudflare Dashboard 右上角
2. 点击 Workers & Pages
3. URL 中包含 Account ID：
   ```
   https://dash.cloudflare.com/<ACCOUNT_ID>/workers
   ```

---

## 📊 PartyKit 部署

### 自动部署（推荐）

GitHub Actions 会自动执行：

```bash
cd partykit
npx partykit deploy --prod
```

### 手动部署

如果需要手动部署：

```bash
npm install -g partykit
cd partykit
npx partykit deploy --prod
```

### PartyKit 配置

[partykit/partykit.json](partykit/partykit.json) 配置：

```json
{
  "name": "villain-smash-party",
  "main": "server.ts",
  "compatibilityDate": "2025-01-01",
  "minify": true,
  "vars": {
    "API_KEY": {
      "description": "Google Gemini API Key for AI generation"
    }
  }
}
```

---

## 🧪 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:5173

### PartyKit 本地开发

```bash
cd partykit
npx partykit dev
```

访问：http://localhost:1999

---

## 🔍 验证部署

### 1. 检查 GitHub Pages

访问：https://your-username.github.io/villainsmash/

### 2. 检查 PartyKit

访问：https://your-app.partykit.workers.dev

### 3. 检查自定义域

访问：https://dadaxiaoren.com

### 4. 测试 WebSocket 连接

打开浏览器开发者工具 → Network → WS

查看是否成功连接到 PartyKit 服务器。

---

## 📝 环境变量说明

### 前端环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `VITE_SUPABASE_URL` | Supabase URL（可选） | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Key（可选） | `eyJhbGc...` |

### PartyKit 环境变量

在 Cloudflare Dashboard 中配置：

| 变量 | 说明 | 必需 |
|------|------|--------|
| `API_KEY` | Google Gemini API Key | ✅ |

---

## 🚨 故障排查

### 构建失败

```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

### PartyKit 部署失败

1. 检查 API Token 权限
2. 检查 Account ID 是否正确
3. 查看 GitHub Actions 日志

### WebSocket 连接失败

1. 检查 PartyKit 服务器是否运行
2. 检查防火墙设置
3. 查看浏览器控制台错误

---

## 📚 参考文档

- [PartyKit 官方文档](https://docs.partykit.io/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [GitHub Pages 文档](https://docs.github.com/en/pages)

---

## 🎯 部署检查清单

- [ ] GitHub Secrets 已配置
- [ ] Cloudflare API Token 已创建
- [ ] Cloudflare Account ID 已获取
- [ ] DNS 解析已配置
- [ ] 代码已推送到 GitHub
- [ ] GitHub Actions 部署成功
- [ ] 前端可访问
- [ ] PartyKit 服务正常运行
- [ ] WebSocket 连接正常
- [ ] 排行榜功能正常

---

## 📞 技术支持

如遇到问题，请检查：

1. GitHub Actions 日志
2. Cloudflare Workers 日志
3. 浏览器控制台错误
4. PartyKit 服务器日志

---

**最后更新**：2026-02-04
