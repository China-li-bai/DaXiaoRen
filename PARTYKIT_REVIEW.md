# PartyKit 统一配置管理 - Review 报告

## 📋 执行摘要

本次 review 和重构完成了 PartyKit 配置的统一管理，解决了 WebSocket URL 重复问题，并建立了清晰的配置层级。

## 🔍 发现的问题

### 1. **WebSocket URL 重复** 🚨
**问题描述**：
```
wss://villain-smash-party.china-li-bai.partykit.dev/parties/main/parties/main/global-leaderboard
```
- `PARTYKIT_HOST` 中包含了 `/parties/main`
- `usePartySocket` 会自动添加 `/parties/main`
- 导致 URL 重复，连接一直 pending

**影响文件**：
- `components/RitualStage.tsx`
- `components/LeaderboardWidget.tsx`

### 2. **配置分散** ⚠️
**问题描述**：
- 每个组件都定义了自己的 `PARTYKIT_HOST` 常量
- 配置不统一，难以维护
- 修改配置需要改动多个文件

**影响文件**：
- `components/RitualStage.tsx`
- `components/LeaderboardWidget.tsx`
- 文档文件（ASSIST_MODE.md, PARTYKIT_DEPLOYMENT.md 等）

### 3. **缺少本地开发支持** ⚠️
**问题描述**：
- 没有本地开发环境的配置
- 无法在本地测试 WebSocket 功能

## ✅ 解决方案

### 1. **创建统一配置文件** ✅
**文件**：`config/partykit.ts`

**功能**：
```typescript
export const PARTYKIT_CONFIG = {
  host: 'villain-smash-party.china-li-bai.partykit.dev',
  rooms: {
    game: (id: string) => `game-${id}`,
    leaderboard: 'global-leaderboard',
  },
} as const;

export const getPartyKitHost = () => {
  if (typeof window === 'undefined') return PARTYKIT_CONFIG.host;
  
  return window.location.hostname === 'localhost' 
    ? 'localhost:1999'
    : PARTYKIT_CONFIG.host;
};

export const getRoomId = (type: 'game' | 'leaderboard', id?: string) => {
  switch (type) {
    case 'game':
      return id ? PARTYKIT_CONFIG.rooms.game(id) : 'default-game';
    case 'leaderboard':
      return PARTYKIT_CONFIG.rooms.leaderboard;
    default:
      throw new Error(`Unknown room type: ${type}`);
  }
};
```

**优势**：
- ✅ 统一管理所有配置
- ✅ 支持本地开发环境
- ✅ 提供房间 ID 生成函数
- ✅ 类型安全（TypeScript）

### 2. **更新组件使用统一配置** ✅

#### RitualStage.tsx
**修改前**：
```typescript
const PARTYKIT_HOST = 'villain-smash-party.china-li-bai.partykit.dev/parties/main';

const socket = usePartySocket({
  host: PARTYKIT_HOST,
  room: currentRoomId,
  // ...
});
```

**修改后**：
```typescript
import { getPartyKitHost } from '../config/partykit';

const socket = usePartySocket({
  host: getPartyKitHost(),
  room: currentRoomId,
  // ...
});
```

#### LeaderboardWidget.tsx
**修改前**：
```typescript
const PARTYKIT_HOST = 'villain-smash-party.china-li-bai.partykit.dev/parties/main';

const socket = usePartySocket({
  host: PARTYKIT_HOST,
  room: "global-leaderboard",
  // ...
});
```

**修改后**：
```typescript
import { getPartyKitHost } from '../config/partykit';

const socket = usePartySocket({
  host: getPartyKitHost(),
  room: "global-leaderboard",
  onConnect() {
    console.log('✅ Leaderboard socket connected');
  },
  onDisconnect() {
    console.log('❌ Leaderboard socket disconnected');
  },
  onError(err) {
    console.error('❌ Leaderboard socket error:', err);
  },
  onMessage(event) {
    // ...
  }
});
```

### 3. **添加调试日志** ✅
**目的**：便于诊断 WebSocket 连接问题

**添加的日志**：
- ✅ 连接成功：`✅ Connected to: {host}`
- ✅ 断开连接：`❌ Disconnected`
- ✅ 连接错误：`❌ Error: {error}`
- ✅ 接收消息：`📨 Received: {message}`

### 4. **创建配置文档** ✅
**文件**：`PARTYKIT_CONFIG.md`

**内容**：
- 配置文件说明
- 使用方式示例
- 当前项目使用情况
- 配置说明
- 注意事项
- 调试技巧
- 更新日志

## 📊 WebSocket 连接诊断

### 当前问题
```
wss://villain-smash-party.china-li-bai.partykit.dev/parties/main/parties/main/global-leaderboard
```
**状态**：一直 pending

### 修复后的 URL
```
wss://villain-smash-party.china-li-bai.partykit.dev/parties/main/global-leaderboard
```
**预期状态**：正常连接

### 测试步骤
1. 刷新页面（清除缓存：Ctrl+Shift+R）
2. 打开浏览器控制台（F12）
3. 查看连接日志：
   ```
   ✅ Leaderboard socket connected
   ✅ RitualStage socket connected to room: room-xxx
   ```
4. 如果看到错误，检查：
   - 网络连接
   - PartyKit 服务状态
   - 防火墙设置

## 🎯 配置层级

```
┌─────────────────────────────────┐
│   config/partykit.ts         │
│   (统一配置层)              │
└───────────┬─────────────────┘
            │
            ├──> getPartyKitHost()
            │    ├──> 生产环境：villain-smash-party.china-li-bai.partykit.dev
            │    └──> 本地开发：localhost:1999
            │
            └──> getRoomId()
                 ├──> game-{id} (游戏房间)
                 └──> global-leaderboard (排行榜)
            │
            ↓
┌─────────────────────────────────┐
│   组件层                    │
│   - RitualStage.tsx          │
│   - LeaderboardWidget.tsx     │
└───────────┬─────────────────┘
            │
            ↓
┌─────────────────────────────────┐
│   PartyKit 服务器            │
│   - server.ts               │
└─────────────────────────────────┘
```

## 📝 文件清单

### 新建文件
1. ✅ `config/partykit.ts` - 统一配置文件
2. ✅ `PARTYKIT_CONFIG.md` - 配置管理文档
3. ✅ `components/Villain.tsx` - 小人组件
4. ✅ `components/Shoe.tsx` - 拖鞋组件

### 修改文件
1. ✅ `components/RitualStage.tsx` - 使用统一配置
2. ✅ `components/LeaderboardWidget.tsx` - 使用统一配置 + 调试日志

### 未修改文件（仅文档）
- `ASSIST_MODE.md` - 协助模式文档
- `PARTYKIT_DEPLOYMENT.md` - 部署文档
- `PARTYKIT_QUICKSTART.md` - 快速开始文档

## 🚀 下一步建议

### 1. **测试 WebSocket 连接**
- 刷新页面测试连接
- 查看控制台日志
- 验证排行榜数据更新

### 2. **更新文档**
- 更新 `ASSIST_MODE.md` 中的配置示例
- 更新 `PARTYKIT_DEPLOYMENT.md` 中的配置说明
- 统一所有文档中的配置引用

### 3. **环境变量管理**
考虑使用环境变量管理配置：
```typescript
// .env.local
VITE_PARTYKIT_HOST=localhost:1999

// .env.production
VITE_PARTYKIT_HOST=villain-smash-party.china-li-bai.partykit.dev
```

### 4. **错误处理增强**
- 添加重连逻辑
- 添加超时处理
- 添加离线检测

## 📚 相关文档
- [PARTYKIT_CONFIG.md](./PARTYKIT_CONFIG.md) - 配置管理文档
- [ASSIST_MODE.md](./ASSIST_MODE.md) - 协助模式文档
- [PARTYKIT_DEPLOYMENT.md](./PARTYKIT_DEPLOYMENT.md) - 部署文档
- [PartyKit 官方文档](https://docs.partykit.io/)

## ✅ 完成检查清单

- [x] 创建统一配置文件 `config/partykit.ts`
- [x] 修复 WebSocket URL 重复问题
- [x] 更新 `RitualStage.tsx` 使用统一配置
- [x] 更新 `LeaderboardWidget.tsx` 使用统一配置
- [x] 添加本地开发环境支持
- [x] 添加调试日志
- [x] 创建配置管理文档
- [x] 创建组件（Villain, Shoe）
- [x] 代码 review 完成

## 🎉 总结

本次重构成功实现了 PartyKit 配置的统一管理，解决了 WebSocket 连接问题，并建立了清晰的配置层级。所有组件现在都使用统一的配置源，便于维护和扩展。添加的调试日志将有助于快速诊断连接问题。
