# 打小人 - 倪海厦理论驱动的游戏机制

## 核心理念

### 倪海厦理论应用
倪海厦中医理论的核心：
1. **五行理论** - 金木水火土相生相克
2. **体质辨识** - 不同体质有不同的弱点
3. **时辰理论** - 不同时辰有不同的能量
4. **病邪理论** - 不同邪气需要不同的治疗方法

### 游戏化应用
- 根据用户八字推算五行属性
- 根据地理位置判断风水能量
- 根据时辰调整小人难度
- 不同类型小人需要不同策略

---

## 一、用户属性推算

### 1.1 八字五行推算
```typescript
interface Bazi {
  year: number;  // 年柱
  month: number; // 月柱
  day: number;   // 日柱
  hour: number;  // 时柱
  elements: {
    wood: number;    // 木
    fire: number;    // 火
    earth: number;   // 土
    metal: number;   // 金
    water: number;   // 水
  };
  dominantElement: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  weakElement: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
}

interface UserAttributes {
  bazi: Bazi;
  location: GeoLocation;
  fengshui: Fengshui;
  currentEnergy: number;
  optimalTime: TimeSlot[];
}
```

**推算逻辑：**
```typescript
function calculateBazi(birthday: Date): Bazi {
  const year = birthday.getFullYear();
  const month = birthday.getMonth() + 1;
  const day = birthday.getDate();
  const hour = birthday.getHours();

  // 天干地支推算
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // 五行属性映射
  const elementMap: Record<string, 'wood' | 'fire' | 'earth' | 'metal' | 'water'> = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water',
    '寅': 'wood', '卯': 'wood',
    '巳': 'fire', '午': 'fire',
    '辰': 'earth', '戌': 'earth', '丑': 'earth', '未': 'earth',
    '申': 'metal', '酉': 'metal',
    '亥': 'water', '子': 'water'
  };

  // 计算五行数量
  const elements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  // 年柱
  const yearStem = heavenlyStems[(year - 4) % 10];
  const yearBranch = earthlyBranches[(year - 4) % 12];
  elements[elementMap[yearStem]]++;
  elements[elementMap[yearBranch]]++;

  // 月柱、日柱、时柱...（类似推算）

  // 找出最强和最弱五行
  const dominantElement = Object.entries(elements).reduce((a, b) => 
    elements[a[0] as keyof typeof elements] > elements[b[0] as keyof typeof elements] ? a : b
  )[0] as 'wood' | 'fire' | 'earth' | 'metal' | 'water';

  const weakElement = Object.entries(elements).reduce((a, b) => 
    elements[a[0] as keyof typeof elements] < elements[b[0] as keyof typeof elements] ? a : b
  )[0] as 'wood' | 'fire' | 'earth' | 'metal' | 'water';

  return {
    year, month, day, hour,
    elements,
    dominantElement,
    weakElement
  };
}
```

### 1.2 地理位置风水推算
```typescript
interface Fengshui {
  direction: 'north' | 'south' | 'east' | 'west' | 'center';
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  energyLevel: number; // 0-100
  luckyColor: string;
  luckyDirection: string;
}

function calculateFengshui(location: GeoLocation, bazi: Bazi): Fengshui {
  // 根据经纬度判断方位
  const { country, region, city } = location;
  
  // 简化版：根据国家/地区判断
  const directionMap: Record<string, 'north' | 'south' | 'east' | 'west' | 'center'> = {
    'CN': 'center', 'US': 'west', 'JP': 'east',
    'GB': 'west', 'DE': 'center', 'FR': 'west'
  };

  const direction = directionMap[country] || 'center';
  
  // 根据用户五行属性和方位推算风水能量
  const energyLevel = calculateEnergyLevel(bazi, direction);
  
  return {
    direction,
    element: bazi.dominantElement,
    energyLevel,
    luckyColor: getLuckyColor(bazi),
    luckyDirection: getLuckyDirection(bazi)
  };
}
```

### 1.3 时辰能量推算
```typescript
interface TimeSlot {
  hour: number;
  name: string;
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  energyLevel: number;
  isOptimal: boolean;
}

function calculateTimeEnergy(bazi: Bazi): TimeSlot[] {
  const timeSlots: TimeSlot[] = [];
  
  const shichen = [
    { hour: 23, name: '子时', element: 'water' },
    { hour: 1, name: '丑时', element: 'earth' },
    { hour: 3, name: '寅时', element: 'wood' },
    { hour: 5, name: '卯时', element: 'wood' },
    { hour: 7, name: '辰时', element: 'earth' },
    { hour: 9, name: '巳时', element: 'fire' },
    { hour: 11, name: '午时', element: 'fire' },
    { hour: 13, name: '未时', element: 'earth' },
    { hour: 15, name: '申时', element: 'metal' },
    { hour: 17, name: '酉时', element: 'metal' },
    { hour: 19, name: '戌时', element: 'earth' },
    { hour: 21, name: '亥时', element: 'water' }
  ];

  shichen.forEach(slot => {
    const isOptimal = slot.element === bazi.dominantElement;
    const energyLevel = isOptimal ? 100 : 
      slot.element === bazi.weakElement ? 20 : 50;
    
    timeSlots.push({
      ...slot,
      energyLevel,
      isOptimal
    });
  });

  return timeSlots;
}
```

---

## 二、小人类型系统

### 2.1 五行小人类型
```typescript
interface VillainType {
  id: string;
  name: string;
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  description: string;
  appearance: {
    color: string;
    emoji: string;
    features: string[];
  };
  stats: {
    hp: number;
    defense: number;
    attack: number;
    speed: number;
    escapeChance: number;
    counterChance: number;
  };
  weaknesses: ('wood' | 'fire' | 'earth' | 'metal' | 'water')[];
  strengths: ('wood' | 'fire' | 'earth' | 'metal' | 'water')[];
  behavior: VillainBehavior;
}

interface VillainBehavior {
  escapeThreshold: number; // 多少时间没被打就逃跑
  escapeSpeed: number; // 逃跑速度
  counterThreshold: number; // 被打多少下会反击
  counterDamage: number; // 反击伤害
  retreatChance: number; // 暂时消退概率
  retreatCondition: number; // 达到多少下会消退
}
```

**五行小人类型：**

**1. 木型小人（木邪）**
```typescript
const woodVillain: VillainType = {
  id: 'wood_villain',
  name: '木邪小人',
  element: 'wood',
  description: '性格固执，难以撼动，但怕金克',
  appearance: {
    color: '#4CAF50',
    emoji: '🌳',
    features: ['树干身体', '叶子头发', '木纹皮肤']
  },
  stats: {
    hp: 150,
    defense: 80,
    attack: 30,
    speed: 40,
    escapeChance: 0.3,
    counterChance: 0.2
  },
  weaknesses: ['metal'],
  strengths: ['water', 'earth'],
  behavior: {
    escapeThreshold: 30, // 30秒没被打就逃跑
    escapeSpeed: 0.8,
    counterThreshold: 15, // 被打15下会反击
    counterDamage: 20,
    retreatChance: 0.4,
    retreatCondition: 25 // 打25下会暂时消退
  }
};
```

**2. 火型小人（火邪）**
```typescript
const fireVillain: VillainType = {
  id: 'fire_villain',
  name: '火邪小人',
  element: 'fire',
  description: '性格暴躁，攻击性强，但怕水克',
  appearance: {
    color: '#F44336',
    emoji: '🔥',
    features: ['火焰头发', '红色皮肤', '冒烟身体']
  },
  stats: {
    hp: 100,
    defense: 30,
    attack: 80,
    speed: 90,
    escapeChance: 0.5,
    counterChance: 0.6
  },
  weaknesses: ['water'],
  strengths: ['metal', 'wood'],
  behavior: {
    escapeThreshold: 20, // 20秒没被打就逃跑
    escapeSpeed: 1.2,
    counterThreshold: 8, // 被打8下会反击
    counterDamage: 35,
    retreatChance: 0.3,
    retreatCondition: 20 // 打20下会暂时消退
  }
};
```

**3. 土型小人（土邪）**
```typescript
const earthVillain: VillainType = {
  id: 'earth_villain',
  name: '土邪小人',
  element: 'earth',
  description: '性格顽固，防御高，但怕木克',
  appearance: {
    color: '#795548',
    emoji: '🏔️',
    features: ['岩石皮肤', '厚重身体', '泥土头发']
  },
  stats: {
    hp: 200,
    defense: 100,
    attack: 40,
    speed: 20,
    escapeChance: 0.2,
    counterChance: 0.3
  },
  weaknesses: ['wood'],
  strengths: ['water', 'fire'],
  behavior: {
    escapeThreshold: 40, // 40秒没被打就逃跑
    escapeSpeed: 0.5,
    counterThreshold: 20, // 被打20下会反击
    counterDamage: 25,
    retreatChance: 0.5,
    retreatCondition: 30 // 打30下会暂时消退
  }
};
```

**4. 金型小人（金邪）**
```typescript
const metalVillain: VillainType = {
  id: 'metal_villain',
  name: '金邪小人',
  element: 'metal',
  description: '性格锋利，攻击高，但怕火克',
  appearance: {
    color: '#FFD700',
    emoji: '⚔️',
    features: ['金属皮肤', '刀锋头发', '闪亮身体']
  },
  stats: {
    hp: 120,
    defense: 60,
    attack: 90,
    speed: 70,
    escapeChance: 0.4,
    counterChance: 0.5
  },
  weaknesses: ['fire'],
  strengths: ['wood', 'earth'],
  behavior: {
    escapeThreshold: 25, // 25秒没被打就逃跑
    escapeSpeed: 1.0,
    counterThreshold: 10, // 被打10下会反击
    counterDamage: 40,
    retreatChance: 0.35,
    retreatCondition: 22 // 打22下会暂时消退
  }
};
```

**5. 水型小人（水邪）**
```typescript
const waterVillain: VillainType = {
  id: 'water_villain',
  name: '水邪小人',
  element: 'water',
  description: '性格狡猾，容易逃跑，但怕土克',
  appearance: {
    color: '#2196F3',
    emoji: '💧',
    features: ['水滴头发', '透明皮肤', '流动身体']
  },
  stats: {
    hp: 80,
    defense: 20,
    attack: 50,
    speed: 100,
    escapeChance: 0.7,
    counterChance: 0.4
  },
  weaknesses: ['earth'],
  strengths: ['fire', 'metal'],
  behavior: {
    escapeThreshold: 15, // 15秒没被打就逃跑
    escapeSpeed: 1.5,
    counterThreshold: 12, // 被打12下会反击
    counterDamage: 30,
    retreatChance: 0.25,
    retreatCondition: 18 // 打18下会暂时消退
  }
};
```

### 2.2 特殊小人类型

**1. 混合型小人**
```typescript
const hybridVillain: VillainType = {
  id: 'hybrid_villain',
  name: '混合邪小人',
  element: 'hybrid',
  description: '五行混合，难以对付',
  appearance: {
    color: '#9C27B0',
    emoji: '🌈',
    features: ['多色身体', '混合元素', '复杂特征']
  },
  stats: {
    hp: 180,
    defense: 70,
    attack: 60,
    speed: 60,
    escapeChance: 0.4,
    counterChance: 0.4
  },
  weaknesses: [],
  strengths: ['wood', 'fire', 'earth', 'metal', 'water'],
  behavior: {
    escapeThreshold: 30,
    escapeSpeed: 1.0,
    counterThreshold: 15,
    counterDamage: 30,
    retreatChance: 0.3,
    retreatCondition: 25
  }
};
```

**2. 时令小人**
```typescript
const seasonalVillain: VillainType = {
  id: 'seasonal_villain',
  name: '时令小人',
  element: 'seasonal',
  description: '根据季节变化属性',
  appearance: {
    color: '#FF9800',
    emoji: '🍂',
    features: ['季节特征', '时令元素', '变化外观']
  },
  stats: {
    hp: 140,
    defense: 60,
    attack: 50,
    speed: 50,
    escapeChance: 0.35,
    counterChance: 0.35
  },
  weaknesses: [], // 动态变化
  strengths: [], // 动态变化
  behavior: {
    escapeThreshold: 28,
    escapeSpeed: 0.9,
    counterThreshold: 14,
    counterDamage: 28,
    retreatChance: 0.38,
    retreatCondition: 24
  }
};
```

---

## 三、游戏机制

### 3.1 小人生成逻辑
```typescript
interface VillainSpawnConfig {
  userAttributes: UserAttributes;
  currentTime: Date;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

function spawnVillain(config: VillainSpawnConfig): VillainType {
  const { userAttributes, currentTime, difficulty } = config;
  const { bazi, fengshui } = userAttributes;

  // 1. 根据用户五行属性生成对应小人
  const baseVillain = getVillainByElement(bazi.dominantElement);

  // 2. 根据时辰调整难度
  const currentHour = currentTime.getHours();
  const timeEnergy = calculateTimeEnergy(bazi).find(t => 
    t.hour === currentHour || (t.hour + 2) % 24 === currentHour
  );

  // 3. 根据风水调整属性
  const fengshuiBonus = fengshui.energyLevel / 100;

  // 4. 根据难度调整
  const difficultyMultiplier = {
    easy: 0.8,
    medium: 1.0,
    hard: 1.2,
    expert: 1.5
  }[difficulty];

  // 5. 生成最终小人
  const villain: VillainType = {
    ...baseVillain,
    stats: {
      hp: Math.floor(baseVillain.stats.hp * fengshuiBonus * difficultyMultiplier),
      defense: Math.floor(baseVillain.stats.defense * fengshuiBonus * difficultyMultiplier),
      attack: Math.floor(baseVillain.stats.attack * fengshuiBonus * difficultyMultiplier),
      speed: Math.floor(baseVillain.stats.speed * fengshuiBonus * difficultyMultiplier),
      escapeChance: baseVillain.stats.escapeChance / difficultyMultiplier,
      counterChance: baseVillain.stats.counterChance / difficultyMultiplier
    }
  };

  return villain;
}
```

### 3.2 逃跑机制
```typescript
interface EscapeSystem {
  lastHitTime: number;
  escapeTimer: number;
  escapeProgress: number;
  isEscaping: boolean;
  escapeAnimation: string;
}

function checkEscape(villain: VillainType, escapeSystem: EscapeSystem): boolean {
  const currentTime = Date.now();
  const timeSinceLastHit = (currentTime - escapeSystem.lastHitTime) / 1000;

  // 检查是否达到逃跑阈值
  if (timeSinceLastHit >= villain.behavior.escapeThreshold) {
    // 计算逃跑概率
    const escapeRoll = Math.random();
    
    if (escapeRoll < villain.stats.escapeChance) {
      // 触发逃跑
      escapeSystem.isEscaping = true;
      escapeSystem.escapeAnimation = 'running_away';
      
      // 逃跑动画
      setTimeout(() => {
        // 小人逃跑
        showEscapeEffect(villain);
        return true;
      }, 1000);
    }
  }

  return false;
}

function showEscapeEffect(villain: VillainType) {
  // 显示逃跑提示
  showNotification({
    type: 'warning',
    title: `${villain.name} 逃跑了！`,
    message: `下次要更快一点哦`,
    icon: '🏃'
  });

  // 显示逃跑动画
  playAnimation({
    type: 'escape',
    villain: villain,
    duration: 2000
  });

  // 更新统计
  updateStats({
    escapes: 1,
    escapedVillains: villain.id
  });
}
```

### 3.3 反击机制
```typescript
interface CounterSystem {
  hitCount: number;
  counterCooldown: number;
  isCountering: boolean;
  counterDamage: number;
}

function checkCounter(villain: VillainType, counterSystem: CounterSystem): void {
  counterSystem.hitCount++;

  // 检查是否达到反击阈值
  if (counterSystem.hitCount >= villain.behavior.counterThreshold) {
    // 检查反击概率
    const counterRoll = Math.random();
    
    if (counterRoll < villain.stats.counterChance) {
      // 触发反击
      triggerCounterAttack(villain, counterSystem);
    }

    // 重置计数
    counterSystem.hitCount = 0;
  }
}

function triggerCounterAttack(villain: VillainType, counterSystem: CounterSystem) {
  counterSystem.isCountering = true;
  counterSystem.counterDamage = villain.behavior.counterDamage;

  // 显示反击提示
  showNotification({
    type: 'danger',
    title: `${villain.name} 反击了！`,
    message: `受到 ${villain.behavior.counterDamage} 点伤害`,
    icon: '⚔️'
  });

  // 显示反击动画
  playAnimation({
    type: 'counter',
    villain: villain,
    damage: villain.behavior.counterDamage,
    duration: 1000
  });

  // 扣除玩家生命值
  reducePlayerHealth(villain.behavior.counterDamage);

  // 更新统计
  updateStats({
    counters: 1,
    damageReceived: villain.behavior.counterDamage
  });

  // 冷却时间
  setTimeout(() => {
    counterSystem.isCountering = false;
  }, 3000);
}
```

### 3.4 暂时消退机制
```typescript
interface RetreatSystem {
  hitCount: number;
  retreatProgress: number;
  isRetreating: boolean;
  retreatAnimation: string;
  retreatTimer: number;
}

function checkRetreat(villain: VillainType, retreatSystem: RetreatSystem): boolean {
  retreatSystem.hitCount++;

  // 检查是否达到消退条件
  if (retreatSystem.hitCount >= villain.behavior.retreatCondition) {
    // 计算消退概率
    const retreatRoll = Math.random();
    
    if (retreatRoll < villain.behavior.retreatChance) {
      // 触发消退
      triggerRetreat(villain, retreatSystem);
      return true;
    }
  }

  return false;
}

function triggerRetreat(villain: VillainType, retreatSystem: RetreatSystem) {
  retreatSystem.isRetreating = true;
  retreatSystem.retreatAnimation = 'fading_away';

  // 显示消退提示
  showNotification({
    type: 'success',
    title: `${villain.name} 暂时消退了！`,
    message: `稍后会重新出现`,
    icon: '💨'
  });

  // 显示消退动画
  playAnimation({
    type: 'retreat',
    villain: villain,
    duration: 2000
  });

  // 更新统计
  updateStats({
    retreats: 1,
    retreatedVillains: villain.id
  });

  // 设置重新出现时间
  const respawnTime = calculateRespawnTime(villain);
  scheduleRespawn(villain, respawnTime);
}

function calculateRespawnTime(villain: VillainType): number {
  const baseTime = 5 * 60 * 1000; // 5分钟基础时间
  const variance = Math.random() * 5 * 60 * 1000; // 0-5分钟随机
  const elementBonus = getElementRespawnBonus(villain.element);
  
  return baseTime + variance + elementBonus;
}

function getElementRespawnBonus(element: string): number {
  const bonuses = {
    wood: 2 * 60 * 1000,    // 木：+2分钟
    fire: 1 * 60 * 1000,    // 火：+1分钟
    earth: 3 * 60 * 1000,   // 土：+3分钟
    metal: 1.5 * 60 * 1000,  // 金：+1.5分钟
    water: 0.5 * 60 * 1000   // 水：+0.5分钟
  };
  
  return bonuses[element as keyof typeof bonuses] || 0;
}
```

---

## 四、相生相克系统

### 4.1 五行相克
```typescript
const elementWeaknesses: Record<string, string[]> = {
  wood: ['metal'],      // 金克木
  fire: ['water'],      // 水克火
  earth: ['wood'],      // 木克土
  metal: ['fire'],      // 火克金
  water: ['earth']      // 土克水
};

const elementStrengths: Record<string, string[]> = {
  wood: ['water', 'earth'],   // 木生火，木克土
  fire: ['metal', 'wood'],    // 火生土，火克金
  earth: ['fire', 'water'],   // 土生金，土克水
  metal: ['water', 'earth'],  // 金生水，金克木
  water: ['wood', 'metal']    // 水生木，水克火
};
```

### 4.2 相克效果
```typescript
function applyElementEffect(
  userElement: string,
  villainElement: string,
  baseDamage: number
): number {
  // 检查是否相克
  const isWeakness = elementWeaknesses[userElement]?.includes(villainElement);
  const isStrength = elementStrengths[userElement]?.includes(villainElement);

  // 计算伤害倍数
  let multiplier = 1.0;
  
  if (isWeakness) {
    multiplier = 1.5; // 相克：伤害+50%
    showEffect('critical_weakness');
  } else if (isStrength) {
    multiplier = 0.8; // 相生：伤害-20%
    showEffect('reduced_damage');
  }

  // 显示效果提示
  if (isWeakness) {
    showNotification({
      type: 'info',
      title: '相克！',
      message: `你的${userElement}属性克制${villainElement}小人`,
      icon: '⚔️'
    });
  } else if (isStrength) {
    showNotification({
      type: 'warning',
      title: '相生！',
      message: `你的${userElement}属性与${villainElement}小人相生`,
      icon: '🌿'
    });
  }

  return Math.floor(baseDamage * multiplier);
}
```

---

## 五、时辰系统

### 5.1 时辰能量表
```typescript
const timeEnergyTable: Record<string, {
  hour: number;
  name: string;
  element: string;
  energyLevel: number;
  optimalElements: string[];
  weakElements: string[];
}> = {
  '子时': { hour: 23, name: '子时', element: 'water', energyLevel: 80, optimalElements: ['water'], weakElements: ['earth'] },
  '丑时': { hour: 1, name: '丑时', element: 'earth', energyLevel: 60, optimalElements: ['earth'], weakElements: ['wood'] },
  '寅时': { hour: 3, name: '寅时', element: 'wood', energyLevel: 90, optimalElements: ['wood'], weakElements: ['metal'] },
  '卯时': { hour: 5, name: '卯时', element: 'wood', energyLevel: 100, optimalElements: ['wood'], weakElements: ['metal'] },
  '辰时': { hour: 7, name: '辰时', element: 'earth', energyLevel: 70, optimalElements: ['earth'], weakElements: ['wood'] },
  '巳时': { hour: 9, name: '巳时', element: 'fire', energyLevel: 95, optimalElements: ['fire'], weakElements: ['water'] },
  '午时': { hour: 11, name: '午时', element: 'fire', energyLevel: 100, optimalElements: ['fire'], weakElements: ['water'] },
  '未时': { hour: 13, name: '未时', element: 'earth', energyLevel: 65, optimalElements: ['earth'], weakElements: ['wood'] },
  '申时': { hour: 15, name: '申时', element: 'metal', energyLevel: 85, optimalElements: ['metal'], weakElements: ['fire'] },
  '酉时': { hour: 17, name: '酉时', element: 'metal', energyLevel: 90, optimalElements: ['metal'], weakElements: ['fire'] },
  '戌时': { hour: 19, name: '戌时', element: 'earth', energyLevel: 55, optimalElements: ['earth'], weakElements: ['wood'] },
  '亥时': { hour: 21, name: '亥时', element: 'water', energyLevel: 75, optimalElements: ['water'], weakElements: ['earth'] }
};
```

### 5.2 时辰效果
```typescript
function applyTimeEffect(
  currentTime: Date,
  userBazi: Bazi,
  baseDamage: number
): number {
  const hour = currentTime.getHours();
  const shichen = Object.values(timeEnergyTable).find(t => 
    t.hour === hour || (t.hour + 2) % 24 === hour
  );

  if (!shichen) return baseDamage;

  // 检查是否是最佳时辰
  const isOptimal = shichen.optimalElements.includes(userBazi.dominantElement);
  const isWeak = shichen.weakElements.includes(userBazi.dominantElement);

  // 计算伤害倍数
  let multiplier = 1.0;
  
  if (isOptimal) {
    multiplier = 1.3; // 最佳时辰：伤害+30%
    showEffect('time_boost');
  } else if (isWeak) {
    multiplier = 0.7; // 弱势时辰：伤害-30%
    showEffect('time_penalty');
  } else {
    multiplier = shichen.energyLevel / 100; // 根据时辰能量调整
  }

  // 显示时辰提示
  showNotification({
    type: 'info',
    title: `当前时辰：${shichen.name}`,
    message: `能量等级：${shichen.energyLevel}%`,
    icon: '⏰'
  });

  return Math.floor(baseDamage * multiplier);
}
```

---

## 六、用户界面设计

### 6.1 用户属性显示
```typescript
interface UserAttributesUI {
  bazi: {
    dominantElement: string;
    weakElement: string;
    elements: Record<string, number>;
  };
  fengshui: {
    direction: string;
    energyLevel: number;
    luckyColor: string;
  };
  currentTime: {
    shichen: string;
    energyLevel: number;
    isOptimal: boolean;
  };
}
```

**UI 组件：**
```tsx
<UserAttributesPanel>
  <BaziDisplay>
    <ElementIcon element={userAttributes.bazi.dominantElement} />
    <ElementName>{getElementName(userAttributes.bazi.dominantElement)}</ElementName>
    <ElementStats>
      {Object.entries(userAttributes.bazi.elements).map(([element, count]) => (
        <ElementBar key={element} element={element} count={count} />
      ))}
    </ElementStats>
  </BaziDisplay>

  <FengshuiDisplay>
    <DirectionIcon direction={userAttributes.fengshui.direction} />
    <EnergyLevel level={userAttributes.fengshui.energyLevel} />
    <LuckyColor color={userAttributes.fengshui.luckyColor} />
  </FengshuiDisplay>

  <TimeDisplay>
    <ShichenName>{currentTime.shichen}</ShichenName>
    <EnergyBar level={currentTime.energyLevel} />
    <OptimalBadge isOptimal={currentTime.isOptimal} />
  </TimeDisplay>
</UserAttributesPanel>
```

### 6.2 小人状态显示
```typescript
interface VillainStatusUI {
  villain: VillainType;
  health: number;
  maxHealth: number;
  escapeTimer: number;
  escapeProgress: number;
  counterCooldown: number;
  retreatProgress: number;
}
```

**UI 组件：**
```tsx
<VillainStatusPanel>
  <HealthBar current={health} max={maxHealth} />
  
  <EscapeTimer>
    <TimerIcon>⏱️</TimerIcon>
    <TimeValue>{escapeTimer}s</TimeValue>
    <ProgressBar progress={escapeProgress} />
  </EscapeTimer>

  <CounterCooldown>
    <CounterIcon>⚔️</CounterIcon>
    <CooldownValue>{counterCooldown}s</CooldownValue>
  </CounterCooldown>

  <RetreatProgress>
    <RetreatIcon>💨</RetreatIcon>
    <ProgressValue>{retreatProgress}/{villain.behavior.retreatCondition}</ProgressValue>
  </RetreatProgress>

  <ElementBadge element={villain.element} />
  <WeaknessBadge weaknesses={villain.weaknesses} />
</VillainStatusPanel>
```

---

## 七、游戏流程

### 7.1 初始化流程
```
1. 用户输入生日
   ↓
2. 推算八字五行
   ↓
3. 获取地理位置
   ↓
4. 计算风水能量
   ↓
5. 显示用户属性面板
   ↓
6. 生成对应小人
   ↓
7. 开始游戏
```

### 7.2 游戏循环
```
每秒检查：
  ├─ 逃跑计时器
  ├─ 反击冷却
  ├─ 消退进度
  └─ 时辰变化

每次点击：
  ├─ 计算伤害（考虑相克、时辰）
  ├─ 更新小人生命值
  ├─ 检查反击
  ├─ 检查消退
  ├─ 更新统计
  └─ 显示反馈
```

### 7.3 小人重生流程
```
小人消退
  ↓
计算重生时间（5-10分钟）
   ↓
显示倒计时
   ↓
时间到
   ↓
生成新小人
   ↓
显示重生动画
```

---

## 八、数据持久化

### 8.1 用户数据存储
```typescript
interface UserData {
  userId: string;
  birthday: Date;
  bazi: Bazi;
  location: GeoLocation;
  fengshui: Fengshui;
  stats: {
    totalHits: number;
    totalVillainsDefeated: number;
    totalEscapes: number;
    totalCounters: number;
    totalRetreats: number;
    bestCombo: number;
    totalDamage: number;
  };
  achievements: Achievement[];
  collection: Collectible[];
  history: GameHistory[];
}

interface GameHistory {
  timestamp: number;
  villainType: string;
  result: 'defeated' | 'escaped' | 'retreated';
  hits: number;
  damage: number;
  timeTaken: number;
}
```

### 8.2 存储策略
```typescript
// 使用 localStorage 存储用户数据
function saveUserData(userData: UserData): void {
  localStorage.setItem('userData', JSON.stringify(userData));
}

function loadUserData(): UserData | null {
  const data = localStorage.getItem('userData');
  return data ? JSON.parse(data) : null;
}

// 使用 PartyKit 同步游戏状态
function syncGameState(state: GameState): void {
  socket.send(JSON.stringify({
    type: 'GAME_STATE_UPDATE',
    state: state
  }));
}
```

---

## 九、实施优先级

### Phase 1: 基础五行系统（1-2周）
- [ ] 八字推算系统
- [ ] 五行小人类型
- [ ] 相克相生效果
- [ ] 用户属性显示

### Phase 2: 行为机制（2-3周）
- [ ] 逃跑机制
- [ ] 反击机制
- [ ] 暂时消退机制
- [ ] 小人重生系统

### Phase 3: 时辰系统（3-4周）
- [ ] 时辰能量计算
- [ ] 时辰效果应用
- [ ] 最佳时辰提示
- [ ] 时辰倒计时

### Phase 4: 风水系统（4-5周）
- [ ] 地理位置获取
- [ ] 风水能量计算
- [ ] 幸运颜色/方向
- [ ] 风水效果应用

### Phase 5: 高级功能（5-6周）
- [ ] 混合型小人
- [ ] 时令小人
- [ ] 动态难度调整
- [ ] 个性化推荐

---

## 十、总结

通过结合倪海厦的中医理论，"打小人"游戏将具有：

1. **文化深度** - 八字、五行、时辰、风水
2. **个性化体验** - 根据用户属性生成专属小人
3. **策略性玩法** - 相克相生、时辰选择、时机把握
4. **动态难度** - 逃跑、反击、消退机制
5. **持续参与** - 小人重生、时辰变化、风水调整

关键是在**传统文化**和**现代游戏**之间找到平衡，让用户既感受到文化内涵，又享受游戏乐趣。
