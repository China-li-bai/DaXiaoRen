# 打小人 - 用户成瘾机制设计

## 核心理论

### 心理学驱动力
1. **追求快乐** - 多巴胺驱动的即时满足
2. **避免痛苦** - 损失厌恶和 FOMO（错失恐惧）
3. **习惯循环** - 提示 → 行动 → 奖励 → 渴望

### Dan Koe 理论应用
- **即时反馈** - 行为立即得到响应
- **进度可视化** - 看到成长和变化
- **社交认同** - 与他人比较和竞争
- **不确定性奖励** - 间歇性强化最有效

---

## 一、追求快乐（正向激励）

### 1.1 即时反馈系统
```typescript
interface HitFeedback {
  type: 'normal' | 'critical' | 'combo' | 'super';
  damage: number;
  visualEffect: string;
  soundEffect: string;
  screenShake: boolean;
  particleCount: number;
}
```

**实现：**
- 每次打都有视觉特效（粒子爆炸、屏幕震动）
- 音效反馈（不同力度不同音效）
- 数字飘字（伤害值、暴击、连击）
- 进度条动画（20/100 满格）

### 1.2 成就系统
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
  reward: Reward;
}

type Reward = 
  | { type: 'title'; title: string }
  | { type: 'badge'; badge: string }
  | { type: 'effect'; effect: string }
  | { type: 'theme'; theme: string };
```

**成就类型：**
- **初出茅庐** - 第一次打小人
- **连击大师** - 连续打10下不中断
- **暴击专家** - 单次暴击超过100
- **夜猫子** - 凌晨2-4点打小人
- **社交达人** - 分享超过10次
- **排行榜新星** - 进入前100名
- **封印之神** - 累计封印10000个小人
- **全勤打卡** - 连续7天每天至少打20下

### 1.3 收集系统
```typescript
interface Collectible {
  id: string;
  name: string;
  type: 'villain' | 'shoe' | 'effect' | 'background';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockCondition: string;
}
```

**收集内容：**
- **小人皮肤** - 不同的反派角色（老板、前任、同事等）
- **鞋子样式** - 不同的拖鞋、高跟鞋、运动鞋
- **打击特效** - 闪电、火焰、冰冻、彩虹
- **背景主题** - 神庙、办公室、街头、森林

**稀有度概率：**
- 普通（蓝色）- 50%
- 稀有（紫色）- 30%
- 史诗（橙色）- 15%
- 传说（金色）- 5%

### 1.4 排行榜竞争
```typescript
interface LeaderboardCompetition {
  type: 'daily' | 'weekly' | 'all-time';
  rank: number;
  previousRank: number;
  change: 'up' | 'down' | 'same';
  abovePlayer: Player[];
  belowPlayer: Player[];
}
```

**竞争机制：**
- 实时排名变化（上升绿色箭头，下降红色箭头）
- 附近玩家对比（看到自己前后的人）
- 超越提醒（"你超越了用户X！"）
- 被超越提醒（"用户Y超越了你！"）

### 1.5 随机奖励
```typescript
interface RandomReward {
  type: 'damage_boost' | 'double_points' | 'critical_chance' | 'combo_extender';
  duration: number;
  multiplier: number;
  visualEffect: string;
}
```

**奖励类型：**
- **伤害加成** - 30秒内伤害x2
- **双倍积分** - 20秒内每次点击得2分
- **暴击率提升** - 40秒内暴击率+50%
- **连击延长** - 连击间隔延长到3秒

**触发机制：**
- 每打100下有10%概率触发
- 连击达到20下必触发
- 随机掉落（像游戏里的宝箱）

---

## 二、避免痛苦（负向激励）

### 2.1 每日任务系统
```typescript
interface DailyTask {
  id: string;
  description: string;
  target: number;
  progress: number;
  reward: Reward;
  deadline: number;
  penalty: string;
}
```

**任务示例：**
- 打满20下 - 奖励：随机皮肤
- 连击达到10下 - 奖励：伤害加成
- 分享到朋友圈 - 奖励：双倍积分
- 邀请1个好友 - 奖励：传说皮肤碎片

**惩罚机制：**
- 未完成任务 - "今日任务未完成，奖励已失效"
- 连续未完成 - "已连续3天未完成，连击记录已清零"

### 2.2 连击系统
```typescript
interface ComboSystem {
  currentCombo: number;
  maxCombo: number;
  comboMultiplier: number;
  comboTimer: number;
  comboBreakPenalty: string;
}
```

**连击机制：**
- 连续点击间隔<2秒 = 连击+1
- 连击越高 = 伤害倍数越高
- 连击中断 = "连击中断！当前连击：23"
- 超越记录 = "新纪录！连击：24"

**惩罚：**
- 连击中断 = 5秒内无法获得暴击
- 连续中断3次 = "手速太慢，建议练习"

### 2.3 排名压力
```typescript
interface RankingPressure {
  currentRank: number;
  targetRank: number;
  timeToDrop: number;
  warningLevel: 'safe' | 'warning' | 'danger';
}
```

**压力机制：**
- 实时显示被超越的风险
- "你距离掉出前100名还差5分"
- "用户X正在追赶你，差距：12分"
- "警告：你即将被用户Y超越！"

### 2.4 限时活动
```typescript
interface LimitedEvent {
  id: string;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  exclusiveReward: Reward;
  participationRate: number;
}
```

**活动类型：**
- **周末狂欢** - 周末双倍积分
- **午夜封印** - 凌晨0-2点三倍伤害
- **全球同步** - 特定时间全球同步打击
- **节日活动** - 春节、情人节等限定皮肤

**FOMO 机制：**
- 倒计时显示（"活动结束：23:59:59"）
- "已有12,345人参与"
- "限定奖励仅剩23份"
- "错过再等一年"

---

## 三、多巴胺循环设计

### 3.1 习惯循环
```
提示 → 行动 → 奖励 → 渴望
```

**提示设计：**
- **时间提示** - "现在是打小人的最佳时间！"
- **社交提示** - "你的好友刚刚超越了你的排名"
- **进度提示** - "再打3下就能解锁新皮肤"
- **成就提示** - "只差1个成就就能获得传说皮肤"

**行动设计：**
- 简单的点击操作
- 即时反馈（视觉+听觉）
- 低门槛（只需20下）

**奖励设计：**
- 即时奖励（伤害数字、特效）
- 短期奖励（连击、暴击）
- 中期奖励（每日任务、排行榜）
- 长期奖励（成就、收集）

**渴望设计：**
- 预告下一个奖励（"再打5下就能获得双倍积分"）
- 显示未解锁内容（"传说皮肤：未解锁"）
- 社交压力（"你的好友已经获得这个皮肤了"）

### 3.2 间歇性强化
```typescript
interface VariableReward {
  baseReward: number;
  variance: number;
  criticalChance: number;
  superCriticalChance: number;
}
```

**奖励分布：**
- 70% - 普通奖励（1x）
- 20% - 稀有奖励（2x）
- 8% - 史诗奖励（5x）
- 2% - 传说奖励（10x）

**不确定性效果：**
- 每次点击都有可能触发暴击
- 不确定性的奖励比确定性奖励更刺激
- "差一点就暴击了"的感觉

### 3.3 进度可视化
```typescript
interface ProgressVisualization {
  current: number;
  target: number;
  percentage: number;
  milestones: Milestone[];
  nextMilestone: Milestone;
}

interface Milestone {
  value: number;
  reward: Reward;
  unlocked: boolean;
}
```

**可视化元素：**
- 进度条（20/100）
- 里程碑标记（25/50/75/100）
- 动画效果（进度条增长）
- 完成庆祝（满屏特效）

---

## 四、社交认同机制

### 4.1 分享系统
```typescript
interface ShareContent {
  type: 'achievement' | 'record' | 'ranking' | 'collection';
  title: string;
  description: string;
  image: string;
  shareCount: number;
  reward: Reward;
}
```

**分享激励：**
- 分享成就获得额外奖励
- 分享记录获得双倍积分
- 分享排行榜获得限定皮肤
- 分享次数统计和排名

### 4.2 好友系统
```typescript
interface FriendSystem {
  friends: Friend[];
  friendRequests: FriendRequest[];
  leaderboard: FriendLeaderboard;
  competition: FriendCompetition;
}

interface FriendCompetition {
  type: 'daily' | 'weekly';
  myScore: number;
  friendScore: number;
  difference: number;
  winner: 'me' | 'friend' | 'pending';
}
```

**好友互动：**
- 好友排行榜
- 好友对战（每日比拼）
- 好友成就对比
- 好友邀请奖励

### 4.3 社区活动
```typescript
interface CommunityEvent {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  participants: number;
  reward: Reward;
  status: 'active' | 'completed' | 'failed';
}
```

**集体目标：**
- "全球目标：封印1,000,000个小人"
- "当前进度：856,432 / 1,000,000"
- "参与人数：12,345"
- 完成后全员获得奖励

---

## 五、数据驱动的优化

### 5.1 用户行为分析
```typescript
interface UserAnalytics {
  sessionDuration: number;
  clicksPerSession: number;
  returnFrequency: number;
  peakHours: number[];
  favoriteVillain: string;
  favoriteShoe: string;
  achievementProgress: AchievementProgress[];
}
```

**分析指标：**
- 用户留存率（次日、7日、30日）
- 用户活跃度（DAU、MAU）
- 用户参与度（平均会话时长、点击次数）
- 用户转化率（完成任务、解锁成就）
- 用户分享率（分享次数、分享转化）

### 5.2 A/B 测试
```typescript
interface ABTest {
  id: string;
  name: string;
  variantA: Variant;
  variantB: Variant;
  metrics: Metric[];
  winner: 'A' | 'B' | 'pending';
}
```

**测试内容：**
- 奖励频率（每次 vs 每10次）
- 连击间隔（1秒 vs 2秒 vs 3秒）
- 排行榜更新频率（实时 vs 每10秒）
- 活动通知时机（提前1天 vs 提前1小时）

---

## 六、实施优先级

### Phase 1: 基础成瘾机制（1-2周）
- [x] 即时反馈系统
- [ ] 连击系统
- [ ] 暴击系统
- [ ] 进度条动画

### Phase 2: 成就与收集（2-3周）
- [ ] 成就系统
- [ ] 收集系统
- [ ] 皮肤解锁
- [ ] 成就通知

### Phase 3: 社交竞争（3-4周）
- [ ] 好友系统
- [ ] 分享系统
- [ ] 排行榜优化
- [ ] 超越提醒

### Phase 4: 高级机制（4-6周）
- [ ] 每日任务
- [ ] 限时活动
- [ ] 随机奖励
- [ ] 社区活动

### Phase 5: 数据优化（持续）
- [ ] 用户行为分析
- [ ] A/B 测试
- [ ] 个性化推荐
- [ ] 智能通知

---

## 七、伦理考虑

### 7.1 避免过度沉迷
- 设置每日上限（最多打1000下）
- 提醒休息（"你已经打了500下，休息一下吧"）
- 时间限制（每天最多使用2小时）

### 7.2 健康使用
- 显示使用时长
- 提供休息建议
- 防沉迷模式（家长控制）

### 7.3 透明度
- 明确说明奖励机制
- 不隐藏概率信息
- 提供退出选项

---

## 八、成功指标

### 8.1 核心指标
- **DAU（日活跃用户）** - 目标：增长50%
- **留存率** - 次日留存>40%，7日留存>20%
- **会话时长** - 平均>5分钟
- **点击次数** - 平均>100次/会话

### 8.2 参与度指标
- **任务完成率** - >60%
- **成就解锁率** - >50%
- **分享率** - >20%
- **好友互动率** - >30%

### 8.3 收入指标（如适用）
- **付费转化率** - >5%
- **ARPU（每用户平均收入）** - >$5
- **LTV（用户生命周期价值）** - >$50

---

## 九、技术实现建议

### 9.1 前端
- 使用 React Context 管理全局状态
- 使用 localStorage 持久化用户数据
- 使用 Web Workers 处理复杂计算
- 使用 Service Workers 实现离线功能

### 9.2 后端
- 使用 PartyKit 实现实时同步
- 使用 Durable Objects 存储用户数据
- 使用 Cloudflare Workers 实现边缘计算
- 使用 Analytics 跟踪用户行为

### 9.3 数据库
- 用户表（user_id, stats, achievements, collection）
- 排行榜表（user_id, score, rank, timestamp）
- 活动表（event_id, type, target, current, reward）
- 好友表（user_id, friend_id, status, timestamp）

---

## 十、总结

通过结合**追求快乐**和**避免痛苦**两种驱动力，设计多层次、多维度的成瘾机制：

1. **即时反馈** - 每次点击都有视觉和听觉反馈
2. **进度可视化** - 清晰看到自己的成长
3. **社交竞争** - 与他人比较和超越
4. **不确定性奖励** - 间歇性强化最有效
5. **限时活动** - FOMO 驱动参与
6. **成就收集** - 长期目标和奖励
7. **社交认同** - 分享和好友互动

关键是在**乐趣**和**压力**之间找到平衡，让用户既享受过程，又有动力持续参与。
