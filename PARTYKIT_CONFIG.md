# PartyKit 配置管理文档

## 📋 概述

本文档说明了项目中 PartyKit 的统一配置管理方式，确保所有 WebSocket 连接使用统一的配置。

## 🗂️ 配置文件

### config/partykit.ts
**路径**：`e:\gitlab\idea\DaXiaoRen\config\partykit.ts`

**功能**：
- 统一管理 PartyKit 主机配置
- 提供房间 ID 生成函数
- 支持本地开发和生产环境切换

**代码**：
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

## 🎯 使用方式

### 1. 导入配置函数
```typescript
import { getPartyKitHost } from '../config/partykit';
```

### 2. 创建 WebSocket 连接
```typescript
const socket = usePartySocket({
  host: getPartyKitHost(),
  room: 'room-name',
  onMessage(event) {
    // 处理消息
  }
});
```

### 3. 生成房间 ID
```typescript
import { getRoomId } from '../config/partykit';

const gameId = getRoomId('game', 'room-张三-BOSS');
const leaderboardId = getRoomId('leaderboard');
```

## 📊 当前项目中的使用情况

### RitualStage.tsx
**路径**：`e:\gitlab\idea\DaXiaoRen\components\RitualStage.tsx`

**连接**：
- **游戏房间**：`room-{villain.name}-{villain.type}`
- **用途**：实时同步点击、在线人数、完成状态

**代码**：
```typescript
import { getPartyKitHost } from '../config/partykit';

const currentRoomId = roomId || `room-${villain.name}-${villain.type}`;

const socket = usePartySocket({
  host: getPartyKitHost(),
  room: currentRoomId,
  onMessage(event) {
    // 处理消息
  }
});
```

### LeaderboardWidget.tsx
**路径**：`e:\gitlab\idea\DaXiaoRen\components\LeaderboardWidget.tsx`

**连接**：
- **排行榜房间**：`global-leaderboard`
- **用途**：接收排行榜更新、发送点击数据

**代码**：
```typescript
import { getPartyKitHost } from '../config/partykit';

const socket = usePartySocket({
  host: getPartyKitHost(),
  room: "global-leaderboard",
  onMessage(event) {
    // 处理消息
  }
});
```

## 🔧 配置说明

### 主机配置
- **生产环境**：`villain-smash-party.china-li-bai.partykit.dev`
- **本地开发**：`localhost:1999`
- **自动切换**：根据 `window.location.hostname` 自动判断

### 房间类型
| 类型 | 房间 ID 格式 | 用途 |
|------|--------------|------|
| **game** | `game-{id}` | 游戏房间，用于实时同步 |
| **leaderboard** | `global-leaderboard` | 全局排行榜，用于地区排名 |

## 🚨 注意事项

### 1. URL 格式
- ❌ **错误**：`villain-smash-party.china-li-bai.partykit.dev/parties/main`
- ✅ **正确**：`villain-smash-party.china-li-bai.partykit.dev`
- **原因**：`usePartySocket` 会自动添加 `/parties/main` 路径

### 2. 房间 ID 命名
- 游戏房间使用 `room-{name}-{type}` 格式
- 排行榜房间固定为 `global-leaderboard`
- 避免使用特殊字符和空格

### 3. 本地开发
- 本地开发时自动使用 `localhost:1999`
- 需要先启动 PartyKit 开发服务器：`npx partykit dev`

## 📝 更新日志

### 2026-02-06
- ✅ 创建统一的配置文件 `config/partykit.ts`
- ✅ 更新 `RitualStage.tsx` 使用统一配置
- ✅ 更新 `LeaderboardWidget.tsx` 使用统一配置
- ✅ 修复 WebSocket URL 重复问题（`/parties/main/parties/main`）
- ✅ 添加本地开发环境支持

## 🔍 调试技巧

### 检查 WebSocket 连接
```typescript
const socket = usePartySocket({
  host: getPartyKitHost(),
  room: 'room-name',
  onConnect() {
    console.log('✅ Connected to:', getPartyKitHost());
  },
  onDisconnect() {
    console.log('❌ Disconnected');
  },
  onError(err) {
    console.error('❌ Error:', err);
  }
});
```

### 查看连接 URL
```typescript
console.log('WebSocket URL:', `wss://${getPartyKitHost()}/parties/main/${roomName}`);
```

## 📚 相关文档
- [PartyKit 官方文档](https://docs.partykit.io/)
- [partysocket/react 文档](https://github.com/partykit/partysocket)
- [ASSIST_MODE.md](./ASSIST_MODE.md) - 协助模式文档
- [PARTYKIT_DEPLOYMENT.md](./PARTYKIT_DEPLOYMENT.md) - 部署文档
