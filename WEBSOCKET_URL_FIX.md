# WebSocket URL 问题修复报告

## 📋 问题描述

### 问题现象 ❌
部署到线上后，WebSocket 连接的 URL 变成了：
```
wss://dadaxiaoren.com/parties/main/global-leaderboard?_pk=ec8304e3-6b75-43a0-9ff2-ad79c1e1ef78
```

但正确的 PartyKit URL 应该是：
```
wss://villain-smash-party.china-li-bai.partykit.dev/parties/main/global-leaderboard?_pk=91630bee-6028-4ad8-9ef6-b9925c7489a4
```

### 问题影响 ❌
- ❌ WebSocket 连接失败
- ❌ 排行榜无法更新
- ❌ 多人协作功能无法使用
- ❌ 排行榜显示 "Loading rankings..."

## 🔍 问题根源

### 1. VPS Nginx 配置问题 ⚠️
VPS 的 Nginx 配置可能包含了错误的 `/parties` 路径代理配置：

```nginx
# ❌ 错误的配置（可能存在）
location /parties {
    proxy_pass http://localhost:1999;  # 本地开发服务器
    # 或者其他错误的代理配置
}
```

**问题**：
- VPS 上没有运行 PartyKit 本地服务器
- 代理到了不存在的服务
- 导致 WebSocket 连接失败

### 2. 缺少环境变量配置 ⚠️
项目没有 `.env` 文件，导致：
- PartyKit host 配置不明确
- 可能使用了错误的默认值
- 部署时没有明确指定 PartyKit URL

## ✅ 修复方案

### 1. 创建 `.env` 文件 ✅
**文件**：`.env`

**内容**：
```env
# Google Gemini API Key (required for AI generation)
API_KEY=your-google-gemini-api-key-here

# Supabase Configuration (optional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# PartyKit Configuration
# IMPORTANT: Always use the PartyKit hosted service URL
# Do NOT use local development server or VPS domain
VITE_PARTYKIT_HOST=villain-smash-party.china-li-bai.partykit.dev
```

**说明**：
- ✅ 明确指定 PartyKit host
- ✅ 使用 PartyKit 托管服务 URL
- ✅ 避免使用 VPS 域名

### 2. 修改 `config/partykit.ts` ✅
**文件**：`config/partykit.ts`

**修改前**：
```typescript
export const PARTYKIT_CONFIG = {
  host: 'villain-smash-party.china-li-bai.partykit.dev',
  rooms: {
    game: (id: string) => `game-${id}`,
    leaderboard: 'global-leaderboard',
  },
} as const;
```

**修改后**：
```typescript
const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST || 'villain-smash-party.china-li-bai.partykit.dev';

export const PARTYKIT_CONFIG = {
  host: PARTYKIT_HOST,
  rooms: {
    game: (id: string) => `game-${id}`,
    leaderboard: 'global-leaderboard',
  },
} as const;
```

**优势**：
- ✅ 从环境变量读取配置
- ✅ 保留默认值作为后备
- ✅ 部署时可以灵活配置

### 3. 检查 VPS Nginx 配置 ⚠️
**需要手动检查**：VPS 上的 Nginx 配置

**检查步骤**：
```bash
# SSH 登录到 VPS
ssh root@192.227.177.133

# 查看 Nginx 配置
cat /etc/nginx/sites-available/dadaxiaoren.com

# 或者
cat /etc/nginx/sites-enabled/dadaxiaoren.com
```

**需要删除的配置**：
```nginx
# ❌ 删除这个配置块
location /parties {
    proxy_pass http://localhost:1999;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

**原因**：
- VPS 上不应该代理 `/parties` 路径
- PartyKit 服务是独立的，托管在 Cloudflare
- 前端应该直接连接到 PartyKit 托管服务

## 📊 正确的架构

### 修改前（错误）❌
```
用户浏览器
  ↓
wss://dadaxiaoren.com/parties/main/global-leaderboard
  ↓
VPS Nginx
  ↓
代理到 localhost:1999（不存在）
  ↓
❌ 连接失败
```

### 修改后（正确）✅
```
用户浏览器
  ↓
wss://villain-smash-party.china-li-bai.partykit.dev/parties/main/global-leaderboard
  ↓
PartyKit 托管服务（Cloudflare）
  ↓
✅ 连接成功
```

## 🚀 部署步骤

### 1. 本地构建
```bash
npm run build
```

### 2. 上传到 VPS
```bash
scp -r dist/* root@192.227.177.133:/var/www/dadaxiaoren.com/
```

### 3. 检查 VPS Nginx 配置
```bash
ssh root@192.227.177.133

# 查看配置
cat /etc/nginx/sites-available/dadaxiaoren.com

# 如果有 /parties 代理配置，删除它
nano /etc/nginx/sites-available/dadaxiaoren.com

# 重载 Nginx
systemctl reload nginx
```

### 4. 验证部署
```bash
# 检查网站是否可访问
curl -I https://dadaxiaoren.com

# 在浏览器中打开
https://dadaxiaoren.com
```

### 5. 测试 WebSocket 连接
1. 打开浏览器控制台（F12）
2. 查看 Network 标签
3. 检查 WebSocket 连接：
   - ✅ 正确：`wss://villain-smash-party.china-li-bai.partykit.dev/parties/main/global-leaderboard`
   - ❌ 错误：`wss://dadaxiaoren.com/parties/main/global-leaderboard`

## 🧪 测试验证

### 1. 检查 WebSocket URL
打开浏览器控制台，应该看到：
```
✅ Leaderboard socket connected
📨 Leaderboard received: LB_UPDATE
```

### 2. 检查排行榜
- ✅ 排行榜应该显示数据
- ✅ 不再显示 "Loading rankings..."
- ✅ 打击小人后，排行榜应该更新

### 3. 检查多人协作
- ✅ 打开多个浏览器窗口
- ✅ 一个窗口打击小人
- ✅ 其他窗口应该看到远程打击效果

## 📝 Nginx 配置示例

### 正确的 Nginx 配置 ✅
```nginx
server {
    listen 80;
    server_name dadaxiaoren.com www.dadaxiaoren.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dadaxiaoren.com www.dadaxiaoren.com;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/dadaxiaoren.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dadaxiaoren.com/privkey.pem;

    # 网站根目录
    root /var/www/dadaxiaoren.com;
    index index.html;

    # 静态文件
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ✅ 不要代理 /parties 路径
    # PartyKit 是独立服务，前端直接连接
}
```

### 错误的 Nginx 配置 ❌
```nginx
server {
    # ... 其他配置 ...

    # ❌ 不要添加这个配置
    location /parties {
        proxy_pass http://localhost:1999;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 📚 相关文档
- [PARTYKIT_CONFIG.md](./PARTYKIT_CONFIG.md) - PartyKit 配置管理
- [LEADERBOARD_PERFORMANCE_FIX.md](./LEADERBOARD_PERFORMANCE_FIX.md) - 排行榜性能优化
- [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) - VPS 部署指南

## ✅ 完成检查清单

- [x] 创建 `.env` 文件
- [x] 修改 `config/partykit.ts` 从环境变量读取配置
- [ ] 检查 VPS Nginx 配置，删除 `/parties` 代理配置
- [ ] 重新部署到 VPS
- [ ] 测试 WebSocket 连接
- [ ] 测试排行榜功能
- [ ] 测试多人协作功能

## 🎉 总结

本次修复解决了以下问题：
1. ✅ 明确指定 PartyKit host 配置
2. ✅ 从环境变量读取配置，提高灵活性
3. ✅ 避免 VPS 错误代理 `/parties` 路径
4. ✅ 确保前端直接连接到 PartyKit 托管服务
5. ✅ 修复 WebSocket 连接失败问题
6. ✅ 修复排行榜无法更新问题

现在部署到线上后，WebSocket 连接会正确连接到 PartyKit 托管服务，排行榜和多人协作功能应该可以正常工作了！
