# Cloudflare Worker 自定义域名设置指南

## 🌐 为什么需要自定义域名？

Cloudflare Workers 的默认域名 `*.workers.dev` 在中国大陆可能被屏蔽或访问缓慢。使用自定义域名可以：
- ✅ 提高中国大陆访问速度
- ✅ 避免被屏蔽
- ✅ 与前端域名统一

---

## 📋 设置步骤

### 1. 登录 Cloudflare Dashboard

访问：https://dash.cloudflare.com/

### 2. 选择你的 Worker

1. 点击左侧菜单 **Workers & Pages**
2. 找到 **daxiaoren-api**
3. 点击进入 Worker 详情页

### 3. 添加自定义域名

1. 点击 **Settings** 标签
2. 找到 **Domains & Routes** 部分
3. 点击 **Add Custom Domain**
4. 输入域名：`api.66666618.xyz` 或 `daxiaoren-api.66666618.xyz`
5. 点击 **Add Domain**

### 4. 等待 DNS 生效

DNS 记录会自动添加到你的域名中，通常需要 1-5 分钟生效。

---

## 🌐 域名选择

### 选项 1：api.66666618.xyz
```
Worker URL: https://api.66666618.xyz
```

### 选项 2：daxiaoren-api.66666618.xyz
```
Worker URL: https://daxiaoren-api.66666618.xyz
```

**推荐使用 `api.66666618.xyz`**，更简洁。

---

## 🔧 更新前端代码

设置好自定义域名后，更新前端代码中的 Worker URL：

### workerService.ts

```typescript
// 修改前
const WORKER_URL = 'https://daxiaoren-api.1272679088.workers.dev';

// 修改后
const WORKER_URL = 'https://api.66666618.xyz';
```

---

## 🧪 测试自定义域名

设置完成后，测试 API：

```bash
# 测试 identify API
curl -X POST https://api.66666618.xyz/api/identify \
  -H "Content-Type: application/json" \
  -d '{"query":"特朗普","lang":"zh"}'
```

---

## 📋 完整配置

### 前端域名
🌐 **https://daxiaoren.66666618.xyz**

### Worker API 域名
🌐 **https://api.66666618.xyz**

### DNS 记录
```
api.66666618.xyz  →  Cloudflare Worker
```

---

## 🚀 部署流程

### 1. 设置 Worker 自定义域名
- 登录 Cloudflare Dashboard
- 进入 Workers & Pages
- 选择 daxiaoren-api
- Settings → Domains & Routes → Add Custom Domain
- 输入 `api.66666618.xyz`

### 2. 等待 DNS 生效
- 通常需要 1-5 分钟

### 3. 测试 Worker API
```bash
curl https://api.66666618.xyz/api/identify \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"特朗普","lang":"zh"}'
```

### 4. 更新前端代码
修改 `services/workerService.ts`：
```typescript
const WORKER_URL = 'https://api.66666618.xyz';
```

### 5. 重新部署前端
```bash
npm run build
git add .
git commit -m "Update Worker URL to custom domain"
git push
```

---

## 📈 优势对比

| 域名 | 中国大陆访问 | 速度 | 推荐 |
|--------|-------------|------|------|
| `*.workers.dev` | ❌ 可能被屏蔽 | ⚠️ 慢 | ❌ 不推荐 |
| `api.66666618.xyz` | ✅ 正常访问 | ✅ 快 | ✅ 推荐 |

---

## 🎯 总结

### 当前问题
- ❌ `daxiaoren-api.1272679088.workers.dev` 在中国大陆无法访问
- ❌ 连接超时

### 解决方案
- ✅ 设置 Worker 自定义域名 `api.66666618.xyz`
- ✅ 更新前端代码使用新域名
- ✅ 提高中国大陆访问速度和稳定性

### 下一步
1. 登录 Cloudflare Dashboard 设置自定义域名
2. 等待 DNS 生效
3. 测试 API 是否可以访问
4. 更新前端代码
5. 重新部署

---

**请先在 Cloudflare Dashboard 中设置自定义域名，然后告诉我，我会帮你更新前端代码！** 🚀
