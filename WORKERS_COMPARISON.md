# Cloudflare Workers 对比说明

## 📋 概述

本项目有两个 Cloudflare Workers：

| Worker | 用途 | 配置文件 | 技术栈 |
|--------|------|----------|---------|
| daxiaoren-api | AI API 服务 | `daxiaoren-worker/wrangler.toml` | Wrangler + Zhipu AI |
| villain-smash-party | 实时排行榜 | `partykit/wrangler.toml` | PartyKit + WebSocket |

---

## 🔧 daxiaoren-api (AI 服务）

### 配置文件

**位置**：`daxiaoren-worker/wrangler.toml`

```toml
name = "daxiaoren-api"
main = "src/worker.js"
compatibility_date = "2026-02-01"

[vars]
API_KEY = "d946d990667549baba87595dadb30b42.5r3iUUtIbhPQ5kwA"
```

### 功能

提供 AI API 服务，支持以下端点：

| 端点 | 功能 | 说明 |
|------|------|------|
| `/api/identify` | 识别人物 | 搜索并返回人物信息 |
| `/api/ritual` | 生成口诀 | 生成押韵口诀和击打指导 |
| `/api/resolution` | 生成祝福 | 仪式结束后给出祝福和建议 |

### 技术栈

- **Cloudflare Workers**：边缘计算平台
- **Wrangler**：Cloudflare Workers CLI
- **Zhipu AI**：智谱 AI GLM-4-Flash 模型

### 部署方式

```bash
# 进入目录
cd daxiaoren-worker

# 使用 Wrangler 部署
wrangler deploy

# 或使用 npx
npx wrangler deploy
```

### 前端调用

```typescript
// 调用 AI API
const response = await fetch('https://daxiaoren-api.username.workers.dev/api/identify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, lang })
});
```

---

## 🎮 villain-smash-party (实时排行榜）

### 配置文件

**位置**：`partykit/wrangler.toml`

```toml
name = "villain-smash-party"
main = "server.ts"
compatibility_date = "2025-01-01"

[vars]
# API Key 将在 Cloudflare Dashboard 中设置
# API_KEY = "your-gemini-api-key"
```

### 功能

提供实时排行榜服务，支持：

| 功能 | 说明 |
|------|------|
| 实时同步 | WebSocket 实时数据同步 |
| 全球排行 | 按国家/地区统计分数 |
| 地理定位 | 自动识别用户位置 |
| 房间管理 | 支持多个游戏房间 |

### 技术栈

- **PartyKit**：实时协作平台
- **Cloudflare Workers**：底层运行时
- **WebSocket**：实时通信协议
- **Durable Objects**：持久化存储

### 部署方式

```bash
# 设置环境变量
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export CLOUDFLARE_API_TOKEN="your-api-token"

# 进入目录
cd partykit

# 运行部署脚本
bash deploy-partykit.sh
```

### 前端连接

```typescript
// 使用 PartySocket 连接
import usePartySocket from 'partysocket/react';

const socket = usePartySocket({
  host: 'https://villain-smash-party.username.partykit.workers.dev',
  room: "global-leaderboard",
  onMessage(event) {
    const msg = JSON.parse(event.data);
    if (msg.type === 'LB_UPDATE') {
      // 更新排行榜
    }
  }
});
```

---

## 📊 对比总结

### 功能对比

| 特性 | daxiaoren-api | villain-smash-party |
|------|-------------|-------------------|
| 主要功能 | AI API 服务 | 实时排行榜 |
| 通信协议 | HTTP | WebSocket |
| 响应类型 | 请求-响应 | 实时推送 |
| 数据存储 | 无 | Durable Objects |
| 地理定位 | 不支持 | 支持 |
| 实时性 | 无 | 支持 |
| 并发处理 | 请求级别 | 连接级别 |

### 部署对比

| 项目 | CLI 工具 | 部署命令 | 环境变量 |
|------|---------|---------|---------|
| daxiaoren-api | Wrangler | `wrangler deploy` | wrangler.toml |
| villain-smash-party | PartyKit | `npx partykit deploy` | 环境变量 |

### 开发对比

| 方面 | daxiaoren-api | villain-smash-party |
|------|-------------|-------------------|
| 开发语言 | JavaScript | TypeScript |
| 配置文件 | wrangler.toml | partykit.json |
| 本地测试 | wrangler dev | partykit dev |
| 调试方式 | Worker 日志 | PartyKit Dashboard |

---

## 🎯 使用场景

### 场景 1：用户打小人流程

```
1. 用户输入小人名字
   ↓
2. 前端调用 daxiaoren-api (/api/identify)
   ↓
3. AI 返回人物信息
   ↓
4. 用户点击"打小人"
   ↓
5. 前端调用 daxiaoren-api (/api/ritual)
   ↓
6. AI 返回口诀和指导
   ↓
7. 用户完成仪式
   ↓
8. 前端调用 daxiaoren-api (/api/resolution)
   ↓
9. AI 返回祝福和建议
   ↓
10. 同时连接 villain-smash-party (WebSocket)
   ↓
11. 实时更新全球排行榜
```

### 场景 2：排行榜实时更新

```
1. 用户完成"打小人"
   ↓
2. 前端发送分数到 villain-smash-party
   ↓
3. PartyKit 更新 Durable Objects
   ↓
4. PartyKit 广播更新到所有连接
   ↓
5. 所有用户的排行榜实时更新
```

---

## 🚨 故障排查

### daxiaoren-api 问题

#### 问题：API 无响应

**检查**：
```bash
# 查看 Worker 日志
wrangler tail daxiaoren-api

# 测试端点
curl -X POST https://daxiaoren-api.username.workers.dev/api/identify \
  -H "Content-Type: application/json" \
  -d '{"query":"test","lang":"zh"}'
```

#### 问题：AI 响应错误

**检查**：
- API Key 是否正确
- Zhipu AI 服务是否正常
- 请求格式是否正确

### villain-smash-party 问题

#### 问题：WebSocket 连接失败

**检查**：
```bash
# 查看 PartyKit 日志
npx partykit logs

# 测试连接
wscat -n https://villain-smash-party.username.partykit.workers.dev/party/global-leaderboard
```

#### 问题：排行榜不更新

**检查**：
- WebSocket 是否连接成功
- 房间名称是否正确
- 消息格式是否正确

---

## 📝 部署流程

### 完整部署流程

```
1. 部署 daxiaoren-api (AI 服务）
   ↓
2. 部署 villain-smash-party (排行榜）
   ↓
3. 更新前端 API 配置
   ↓
4. 更新前端 WebSocket 配置
   ↓
5. 部署前端到 VPS
   ↓
6. 清除 Cloudflare 缓存
```

### 快速部署命令

```bash
# 1. 部署 AI API
cd daxiaoren-worker
wrangler deploy

# 2. 部署排行榜
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export CLOUDFLARE_API_TOKEN="your-api-token"
cd partykit
bash deploy-partykit.sh

# 3. 部署前端
npm run build
./deploy-update.sh
```

---

## 🎉 总结

### 两个 Worker 的关系

| Worker | 角色 | 依赖关系 |
|--------|------|----------|
| daxiaoren-api | AI 服务提供者 | 独立运行 |
| villain-smash-party | 排行榜服务 | 独立运行 |
| 前端 | 调用者 | 同时调用两个 Worker |

### 架构图

```
用户浏览器
    ↓
前端 (dadaxiaoren.com)
    ↓                    ↓
daxiaoren-api      villain-smash-party
(AI 服务)         (实时排行榜)
```

---

## 📚 相关文档

| 文档 | 用途 |
|------|------|
| [daxiaoren-worker/wrangler.toml](daxiaoren-worker/wrangler.toml) | AI API 配置 |
| [partykit/wrangler.toml](partykit/wrangler.toml) | 排行榜配置 |
| [deploy-partykit.sh](deploy-partykit.sh) | 排行榜部署脚本 |
| [PARTYKIT_DEPLOYMENT.md](PARTYKIT_DEPLOYMENT.md) | 排行榜部署指南 |
| [PARTYKIT_QUICKSTART.md](PARTYKIT_QUICKSTART.md) | 排行榜快速开始 |

---

**最后更新**：2026-02-04
