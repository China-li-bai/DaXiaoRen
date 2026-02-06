# 协助模式文档

## 📋 概述

协助模式允许多个用户同时协助"打小人"，实现多人实时协作的互动体验。用户可以通过分享链接邀请好友一起参与，所有用户的点击都会实时同步。

## 🗂️ 涉及的文件

### 1. App.tsx - 主应用组件
**路径**：`e:\gitlab\idea\DaXiaoRen\App.tsx`

**关键功能**：
- 管理应用状态（step, villain, chant, resolution等）
- 处理协助模式的URL参数
- 生成房间ID
- 处理封印完成逻辑

**关键代码段**：

```typescript
// 房间ID状态
const [roomId, setRoomId] = useState<string | null>(null);

// 协助模式URL参数检查（第85-113行）
const params = new URLSearchParams(window.location.search);
const isAssist = params.get('assist');
const sharedName = params.get('villain');

if (isAssist && sharedName) {
  setIsAssistMode(true);
  setVillain({
    name: sharedName,
    type: sharedType,
    reason: sharedReason
  });
  
  // 设置协助模式房间ID（使用相同的房间）
  const assistRoomId = `room-${sharedName}-${sharedType}`;
  setRoomId(assistRoomId);
  
  // 跳过API调用，使用默认chant
  setChant({
    chantLines: lang === 'zh' 
      ? ["助阵好友打小人", "一打小人头，霉运不再留", "二打小人手，贵人身边走", "三打小人身，转运要翻身"]
      : ["Helping a friend smash evil", "Banish bad luck now", "Clear the path for good", "Strike with all your might"],
    ritualInstruction: lang === 'zh' ? "点击屏幕，帮朋友狠打！" : "Tap to help your friend smash!"
  });
  
  setHasAgreed(true);
  setStep(AppStep.RITUAL);
}

// 创建新小人时生成房间ID（第149-151行）
const newRoomId = `room-${data.name}-${data.type}-${Date.now()}`;
setRoomId(newRoomId);

// 封印完成处理（第223-239行）
if (isAssistMode) {
  // 协助模式使用默认resolution，不调用API
  res = {
    blessing: lang === 'zh' ? '合力封印，功德圆满' : 'Together we purified',
    advice: lang === 'zh' ? '感谢好友助阵，小人已被成功封印！' : 'Thanks for helping! The villain has been sealed!'
  };
} else {
  // 普通模式调用API
  res = await generateResolution(villain, lang);
}

// 传递roomId到RitualStage（第366行）
<RitualStage 
  lang={lang} 
  villain={villain} 
  chantData={chant} 
  onComplete={handleRitualComplete}
  isAssistMode={isAssistMode}
  roomId={roomId}
/>
```

### 2. RitualStage.tsx - 游戏仪式组件
**路径**：`e:\gitlab\idea\DaXiaoRen\components\RitualStage.tsx`

**关键功能**：
- PartySocket连接管理
- 实时点击同步
- 在线人数显示
- 远程击打效果
- 封印完成触发

**关键代码段**：

```typescript
// PartyKit配置（第4行）
const PARTYKIT_HOST = 'villain-smash-party.china-li-bai.partykit.dev/parties/main';

// Props接口（第13-19行）
interface Props {
  lang: Language;
  villain: VillainData;
  chantData: ChantResponse;
  onComplete: () => void;
  isAssistMode?: boolean;
  roomId?: string;
}

// 状态管理（第40-41行）
const [onlineCount, setOnlineCount] = useState(1);
const [remoteHits, setRemoteHits] = useState<RemoteHit[]>([]);

// 房间ID生成（第43行）
const currentRoomId = roomId || `room-${villain.name}-${villain.type}`;

// PartySocket连接（第45-92行）
const socket = usePartySocket({
  host: PARTYKIT_HOST,
  room: currentRoomId,
  onMessage(event) {
    const msg = JSON.parse(event.data);
    
    // 处理HIT_UPDATE消息
    if (msg.type === 'HIT_UPDATE') {
      setHits(msg.totalHits);
      if (msg.damage) {
        // 显示远程击打效果
        const remoteHit: RemoteHit = {
          id: Date.now(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          timestamp: Date.now()
        };
        setRemoteHits(prev => [...prev, remoteHit]);
        setTimeout(() => {
          setRemoteHits(prev => prev.filter(h => h.id !== remoteHit.id));
        }, 1000);
      }
    }
    
    // 处理USER_JOINED消息
    else if (msg.type === 'USER_JOINED') {
      setOnlineCount(msg.count);
    }
    
    // 处理USER_LEFT消息
    else if (msg.type === 'USER_LEFT') {
      setOnlineCount(msg.count);
    }
    
    // 处理SYNC消息
    else if (msg.type === 'SYNC') {
      setHits(msg.state.totalHits);
      setOnlineCount(msg.onlineCount);
      
      // 如果房间已完成，触发完成
      if (msg.state.status === 'COMPLETED' && !isComplete) {
        setIsComplete(true);
        setTimeout(onComplete, 800);
      }
    }
    
    // 处理EMOJI_BROADCAST消息
    else if (msg.type === 'EMOJI_BROADCAST') {
      const emojiHit: RemoteHit = {
        id: Date.now(),
        x: msg.x * window.innerWidth,
        y: msg.y * window.innerHeight,
        timestamp: Date.now()
      };
      setRemoteHits(prev => [...prev, emojiHit]);
      setTimeout(() => {
        setRemoteHits(prev => prev.filter(h => h.id !== emojiHit.id));
      }, 2000);
    }
    
    // 处理COMPLETION消息
    else if (msg.type === 'COMPLETION') {
      if (!isComplete) {
        setIsComplete(true);
        setTimeout(onComplete, 800);
      }
    }
  }
});

// 发送HIT消息（第248-253行）
socket.send(JSON.stringify({
  type: 'HIT',
  damage: 1
}));

// 封印完成处理（第255-268行）
if (newHits >= TOTAL_HITS_REQUIRED && !isComplete) {
  setIsComplete(true);
  
  // 发送COMPLETION消息到PartyKit
  socket.send(JSON.stringify({
    type: 'COMPLETION',
    isAssistMode: isAssistMode
  }));
  
  // 只有非协助模式才调用onComplete
  if (!isAssistMode) {
    setTimeout(onComplete, 800);
  }
}

// 初始化房间（第311-317行）
useEffect(() => {
  socket.send(JSON.stringify({
    type: 'INIT',
    villainName: villain.name,
    villainType: villain.type
  }));
}, [socket, villain.name, villain.type]);

// 显示在线人数（第327-335行）
<div className="absolute top-2 right-2 z-50 bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-full px-3 py-1 flex items-center gap-2">
  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
  <span className="text-xs font-bold text-slate-300">
    {onlineCount} {onlineCount === 1 ? 'Online' : 'Online'}
  </span>
</div>

// 显示远程击打效果（第357-369行）
{remoteHits.map(hit => (
  <div
    key={hit.id}
    className="fixed pointer-events-none z-40 animate-ping"
    style={{
      left: hit.x,
      top: hit.y,
      transform: 'translate(-50%, -50%)'
    }}
  >
    <div className="w-8 h-8 rounded-full bg-amber-500/30 border-2 border-amber-500" />
  </div>
))}
```

### 3. server.ts - PartyKit服务器
**路径**：`e:\gitlab\idea\DaXiaoRen\partykit\server.ts`

**关键功能**：
- 处理WebSocket连接
- 管理房间状态
- 广播消息
- 处理COMPLETION消息

**关键代码段**：

```typescript
// 连接处理（第125-145行）
async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
  // 全局排行榜房间逻辑
  if (this.party.id === 'global-leaderboard') {
    await this.resetLeaderboardIfNeeded();
    
    const country = (ctx.request.cf?.country as string) || 'CN'; 
    const region = (ctx.request.cf?.region as string) || 'Unknown';
    const city = (ctx.request.cf?.city as string) || 'Unknown';

    conn.setState({ country, region, city });

    const lbState = await this.party.storage.get<GlobalLeaderboardState>("lb_state") || {};
    const metadata = this.leaderboardMetadata;
    
    conn.send(JSON.stringify({ 
      type: 'LB_UPDATE', 
      state: lbState,
      metadata: metadata
    }));
    return;
  }

  // 普通游戏房间逻辑
  let state = await this.party.storage.get<RoomState>("state");
  const onlineCount = [...this.party.getConnections()].length;

  if (state) {
    const syncMsg: ServerMessage = { type: "SYNC", state, onlineCount };
    conn.send(JSON.stringify(syncMsg));
  }
  
  this.broadcast({ type: "USER_JOINED", count: onlineCount }, [conn.id]);
}

// 断开连接处理（第148-152行）
async onClose(conn: Party.Connection) {
  if (this.party.id === 'global-leaderboard') return;

  const onlineCount = [...this.party.getConnections()].length;
  this.broadcast({ type: "USER_LEFT", count: onlineCount });
}

// 消息处理（第155-257行）
async onMessage(message: string, sender: Party.Connection) {
  const data = JSON.parse(message) as ClientMessage;

  // 全局排行榜逻辑
  if (this.party.id === 'global-leaderboard') {
    if (data.type === 'LB_CLICK') {
      const count = data.count || 1;
      const geo = sender.state as GeoLocation | null;
      
      if (geo && geo.country) {
        let lbState = await this.party.storage.get<GlobalLeaderboardState>("lb_state") || {};
        
        if (!lbState[geo.country]) {
          lbState[geo.country] = {
            name: getCountryName(geo.country),
            score: 0,
            regions: {},
            lastUpdated: Date.now(),
            totalClicks: 0
          };
        }

        const countryData = lbState[geo.country];
        countryData.score += count;
        countryData.totalClicks += count;
        countryData.lastUpdated = Date.now();

        const regionKey = geo.region || 'Unknown';
        if (!countryData.regions[regionKey]) {
          countryData.regions[regionKey] = 0;
        }
        countryData.regions[regionKey] += count;

        await this.party.storage.put("lb_state", lbState);
        await this.updateLeaderboardMetadata({
          totalGlobalClicks: (this.leaderboardMetadata?.totalGlobalClicks || 0) + count
        });

        this.pendingBroadcast = { type: 'LB_UPDATE', state: lbState, metadata: this.leaderboardMetadata };
        
        if (!this.broadcastTimer) {
          this.broadcastTimer = setTimeout(() => {
            if (this.pendingBroadcast) {
              this.party.broadcast(JSON.stringify(this.pendingBroadcast));
              this.pendingBroadcast = null;
            }
            this.broadcastTimer = null;
          }, 1000);
        }
      }
    }
    return;
  }

  // 普通游戏房间逻辑
  if (data.type === 'INIT') {
    const newState: RoomState = {
      villainName: data.villainName,
      villainType: data.villainType,
      totalHits: 0,
      status: 'ACTIVE',
      createdAt: Date.now()
    };
    await this.party.storage.put("state", newState);
    this.broadcast({ type: 'SYNC', state: newState, onlineCount: [...this.party.getConnections()].length });
  }

  if (data.type === 'HIT') {
    let state = await this.party.storage.get<RoomState>("state");
    if (state && state.status === 'ACTIVE') {
      state.totalHits += 1;
      if (state.totalHits >= 10000) state.status = 'COMPLETED';
      await this.party.storage.put("state", state);
      this.broadcast({ type: 'HIT_UPDATE', damage: data.damage, totalHits: state.totalHits }, [sender.id]);
    }
  }

  if (data.type === 'EMOJI') {
    this.broadcast({
      type: 'EMOJI_BROADCAST',
      emoji: data.emoji,
      x: Math.random(),
      y: Math.random()
    }, [sender.id]);
  }

  // 处理COMPLETION消息（第244-254行）
  if (data.type === 'COMPLETION') {
    let state = await this.party.storage.get<RoomState>("state");
    if (state && state.status === 'ACTIVE') {
      state.status = 'COMPLETED';
      state.completedAt = Date.now();
      await this.party.storage.put("state", state);
      
      // 广播完成消息给房间内所有用户
      this.broadcast({ type: 'COMPLETION', totalHits: state.totalHits });
    }
  }
}
```

### 4. types.ts - 类型定义
**路径**：`e:\gitlab\idea\DaXiaoRen\partykit\types.ts`

**关键类型**：

```typescript
// 房间状态（第6-12行）
export type RoomState = {
  villainName: string;
  villainType: string;
  totalHits: number;
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: number;
  completedAt?: number;
};

// 客户端到服务器的消息（第51-55行）
export type ClientMessage = 
  | { type: 'INIT'; villainName: string; villainType: string }
  | { type: 'HIT'; damage: number }
  | { type: 'EMOJI'; emoji: string }
  | { type: 'LB_CLICK'; count: number }
  | { type: 'COMPLETION'; isAssistMode: boolean };

// 服务器到客户端的消息（第58-65行）
export type ServerMessage = 
  | { type: 'SYNC'; state: RoomState; onlineCount: number }
  | { type: 'HIT_UPDATE'; damage: number; totalHits: number }
  | { type: 'USER_JOINED'; count: number }
  | { type: 'USER_LEFT'; count: number }
  | { type: 'EMOJI_BROADCAST'; emoji: string; x: number; y: number }
  | { type: 'LB_UPDATE'; state: GlobalLeaderboardState }
  | { type: 'COMPLETION'; totalHits: number };
```

### 5. Conclusion.tsx - 封印结果组件
**路径**：`e:\gitlab\idea\DaXiaoRen\components\Conclusion.tsx`

**关键功能**：
- 显示封印结果
- 支持协助模式显示

**关键代码段**：

```typescript
// Props接口（第9-14行）
interface Props {
  lang: Language;
  resolution: ResolutionResponse;
  villain: VillainData;
  onReset: () => void;
  isAssistMode?: boolean;
}

// 协助模式徽章（第45-50行）
{isAssistMode && (
  <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded transform rotate-3 z-20 shadow-md border border-red-400">
    {lang === 'zh' ? '好友助阵封印' : 'CO-OP SEAL'}
  </div>
)}

// 标题（第57行）
<h2 className="text-red-700 font-serif font-bold text-3xl mb-1 tracking-widest">
  {lang === 'zh' ? (isAssistMode ? '合力封印' : '功德圆满') : 'PURIFIED'}
</h2>

// 重置按钮（第111-117行）
<button
  onClick={onReset}
  className={`mt-6 px-10 py-3 font-bold rounded-full transition-all shadow-lg text-sm uppercase tracking-wider ${
    isAssistMode 
      ? 'bg-amber-600 hover:bg-amber-500 text-white animate-bounce' 
      : 'bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'
  }`}
>
  {isAssistMode ? t.createYourOwn : t.playAgain}
</button>
```

### 6. constants.ts - 常量定义
**路径**：`e:\gitlab\idea\DaXiaoRen\constants.ts`

**关键常量**：

```typescript
// 第147行
export const TOTAL_HITS_REQUIRED = 20;
```

## 🎯 触发条件

### 1. 进入协助模式

**触发条件**：
- URL参数包含 `?assist=true&villain={name}&type={type}&reason={reason}`

**触发位置**：`App.tsx` 第85-113行

**触发流程**：
```
用户访问带参数的URL
  ↓
检测到 assist=true 和 villain 参数
  ↓
设置 isAssistMode = true
  ↓
设置 villain 数据
  ↓
生成房间ID: `room-{name}-{type}`
  ↓
设置默认 chant（不调用API）
  ↓
跳转到 RITUAL 步骤
```

### 2. 创建新小人

**触发条件**：
- 用户填写表单并提交
- credits > 0

**触发位置**：`App.tsx` 第139-168行

**触发流程**：
```
用户提交表单
  ↓
检查 credits
  ↓
生成房间ID: `room-{name}-{type}-{timestamp}`
  ↓
调用 generateResolution API
  ↓
保存到历史记录
  ↓
显示分享弹窗
  ↓
进入 RITUAL 步骤
```

### 3. 实时点击同步

**触发条件**：
- 用户点击屏幕
- 房间状态为 ACTIVE

**触发位置**：`RitualStage.tsx` 第248-253行

**触发流程**：
```
用户点击屏幕
  ↓
更新本地 hits 计数
  ↓
发送 HIT 消息到 PartyKit
  ↓
PartyKit 服务器更新房间状态
  ↓
广播 HIT_UPDATE 消息给其他用户
  ↓
其他用户收到消息并更新显示
```

### 4. 封印完成

**触发条件**：
- hits >= TOTAL_HITS_REQUIRED (20)
- isComplete = false

**触发位置**：`RitualStage.tsx` 第255-268行

**触发流程**：
```
用户点击达到20次
  ↓
设置 isComplete = true
  ↓
发送 COMPLETION 消息到 PartyKit
  ↓
如果是非协助模式，调用 onComplete
  ↓
PartyKit 服务器更新房间状态为 COMPLETED
  ↓
广播 COMPLETION 消息给所有用户
  ↓
所有用户收到消息并触发 onComplete
  ↓
显示 Conclusion 弹窗
```

### 5. 用户加入房间

**触发条件**：
- 新用户连接到房间

**触发位置**：`server.ts` 第125-145行

**触发流程**：
```
新用户连接
  ↓
获取房间状态
  ↓
发送 SYNC 消息给新用户
  ↓
广播 USER_JOINED 消息给其他用户
  ↓
更新在线人数
```

### 6. 用户离开房间

**触发条件**：
- 用户断开连接

**触发位置**：`server.ts` 第148-152行

**触发流程**：
```
用户断开连接
  ↓
计算剩余在线人数
  ↓
广播 USER_LEFT 消息给其他用户
  ↓
更新在线人数
```

## 📊 数据流图

```
┌─────────────────┐
│   App.tsx      │
│  (主应用)      │
└────────┬────────┘
         │
         │ 1. 生成房间ID
         │ 2. 传递 roomId, isAssistMode
         ↓
┌─────────────────┐
│ RitualStage.tsx │
│  (游戏仪式)     │
└────────┬────────┘
         │
         │ 1. 建立 PartySocket 连接
         │ 2. 发送 INIT 消息
         │ 3. 发送 HIT 消息
         │ 4. 发送 COMPLETION 消息
         │ 5. 接收服务器消息
         ↓
┌─────────────────┐
│  PartyKit       │
│  server.ts      │
│  (服务器)       │
└────────┬────────┘
         │
         │ 1. 处理消息
         │ 2. 更新房间状态
         │ 3. 广播消息
         ↓
┌─────────────────┐
│  所有客户端     │
│  (实时同步)     │
└─────────────────┘
```

## 🔄 消息类型汇总

| 消息类型 | 方向 | 触发条件 | 数据 |
|---------|------|---------|------|
| **INIT** | 客户端→服务器 | 用户进入房间 | `{villainName, villainType}` |
| **HIT** | 客户端→服务器 | 用户点击屏幕 | `{damage}` |
| **COMPLETION** | 客户端→服务器 | 达到20次点击 | `{isAssistMode}` |
| **SYNC** | 服务器→客户端 | 用户加入/状态更新 | `{state, onlineCount}` |
| **HIT_UPDATE** | 服务器→客户端 | 其他用户点击 | `{damage, totalHits}` |
| **USER_JOINED** | 服务器→客户端 | 新用户加入 | `{count}` |
| **USER_LEFT** | 服务器→客户端 | 用户离开 | `{count}` |
| **EMOJI_BROADCAST** | 服务器→客户端 | 用户发送表情 | `{emoji, x, y}` |
| **COMPLETION** | 服务器→客户端 | 封印完成 | `{totalHits}` |

## 🎮 房间ID格式

| 模式 | 房间ID格式 | 示例 |
|------|-----------|------|
| **创建新小人** | `room-{name}-{type}-{timestamp}` | `room-张三-BOSS-1704067200000` |
| **协助模式** | `room-{name}-{type}` | `room-张三-BOSS` |

## ⚙️ 关键配置

| 配置项 | 值 | 位置 |
|-------|---|------|
| **PartyKit Host** | `villain-smash-party.china-li-bai.partykit.dev/parties/main` | RitualStage.tsx 第4行 |
| **所需点击次数** | `20` | constants.ts 第147行 |
| **数据重置间隔** | `7天` | server.ts 第18行 |
| **排行榜版本** | `v1.0` | server.ts 第17行 |

## 📝 注意事项

1. **协助模式不消耗credits** - 协助者不会扣除credits
2. **协助模式不调用API** - 使用默认的resolution文本
3. **房间状态持久化** - 房间状态保存在PartyKit存储中
4. **实时同步延迟** - WebSocket消息可能有轻微延迟
5. **在线人数统计** - 只统计当前连接的用户
6. **排行榜独立房间** - `global-leaderboard` 是独立的房间

## 🚀 使用示例

### 创建新小人并分享

```typescript
// 1. 用户创建小人
// 2. 生成房间ID: room-张三-BOSS-1704067200000
// 3. 生成分享链接: https://example.com?assist=true&villain=张三&type=BOSS&reason=原因
// 4. 分享给好友
```

### 好友协助

```typescript
// 1. 好友点击分享链接
// 2. 进入协助模式
// 3. 连接到相同房间: room-张三-BOSS
// 4. 开始协助点击
// 5. 实时同步点击数
// 6. 达到20次后触发封印
```

## 🔍 调试技巧

### 检查房间状态

```bash
# 访问房间状态API
curl https://villain-smash-party.china-li-bai.partykit.dev/parties/main/room-张三-BOSS
```

### 查看WebSocket消息

```javascript
// 在浏览器控制台中
socket.addEventListener('message', (event) => {
  console.log('Received:', JSON.parse(event.data));
});
```

### 检查在线人数

```javascript
// 在RitualStage组件中
console.log('Online count:', onlineCount);
```

## 📚 相关文档

- [PARTYKIT_DEPLOYMENT.md](./PARTYKIT_DEPLOYMENT.md) - PartyKit部署文档
- [PARTYKIT_QUICKSTART.md](./PARTYKIT_QUICKSTART.md) - PartyKit快速开始
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署文档
- [README.md](./README.md) - 项目说明

---

**文档版本**: 1.0  
**最后更新**: 2026-02-06  
**维护者**: VillainSmash Team
