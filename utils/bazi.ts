export interface Bazi {
  year: number;
  heavenlyStem: string;
  earthlyBranch: string;
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  elementName: string;
}

export interface Diagnosis {
  user: {
    element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
    year: number;
    heavenlyStem: string;
    earthlyBranch: string;
    elementName: string;
  };
  situation: {
    conflict: string;
    description: string;
  };
  villain: {
    direction: string;
    type: string;
    element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
    characteristics: string[];
  };
  solution: {
    shoeType: string;
    shoeIcon: string;
    optimalTime: string;
    timeRange: string;
    timeHour: number;
  };
  psychologicalEffect: string;
}

const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

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

const elementNames: Record<string, string> = {
  'wood': '木',
  'fire': '火',
  'earth': '土',
  'metal': '金',
  'water': '水'
};

const elementIcons: Record<string, string> = {
  'wood': '🌳',
  'fire': '🔥',
  'earth': '🏔️',
  'metal': '⚔️',
  'water': '💧'
};

const directionElements: Record<string, 'wood' | 'fire' | 'earth' | 'metal' | 'water'> = {
  '正北': 'water',
  '正南': 'fire',
  '正东': 'wood',
  '正西': 'metal',
  '东北': 'earth',
  '东南': 'wood',
  '西北': 'metal',
  '西南': 'earth'
};

const villainTypes: Record<string, { name: string; characteristics: string[] }> = {
  'wood': {
    name: '木形固执怪',
    characteristics: ['性格固执', '难以撼动', '怕金克']
  },
  'fire': {
    name: '火形躁郁怪',
    characteristics: ['性格暴躁', '攻击性强', '怕水克']
  },
  'earth': {
    name: '土形顽固怪',
    characteristics: ['性格顽固', '防御高', '怕木克']
  },
  'metal': {
    name: '金形锋利怪',
    characteristics: ['性格锋利', '攻击高', '怕火克']
  },
  'water': {
    name: '水形狡猾怪',
    characteristics: ['性格狡猾', '容易逃跑', '怕土克']
  }
};

const shoeTypes: Record<string, { name: string; icon: string }> = {
  'wood': { name: '木拖鞋', icon: '👟' },
  'fire': { name: '火拖鞋', icon: '👠' },
  'earth': { name: '土拖鞋', icon: '👢' },
  'metal': { name: '金拖鞋', icon: '👞' },
  'water': { name: '水拖鞋', icon: '👡' }
};

const timeSlots: Record<string, { name: string; range: string; hour: number }> = {
  '子时': { name: '子时', range: '23:00-01:00', hour: 23 },
  '丑时': { name: '丑时', range: '01:00-03:00', hour: 1 },
  '寅时': { name: '寅时', range: '03:00-05:00', hour: 3 },
  '卯时': { name: '卯时', range: '05:00-07:00', hour: 5 },
  '辰时': { name: '辰时', range: '07:00-09:00', hour: 7 },
  '巳时': { name: '巳时', range: '09:00-11:00', hour: 9 },
  '午时': { name: '午时', range: '11:00-13:00', hour: 11 },
  '未时': { name: '未时', range: '13:00-15:00', hour: 13 },
  '申时': { name: '申时', range: '15:00-17:00', hour: 15 },
  '酉时': { name: '酉时', range: '17:00-19:00', hour: 17 },
  '戌时': { name: '戌时', range: '19:00-21:00', hour: 19 },
  '亥时': { name: '亥时', range: '21:00-23:00', hour: 21 }
};

const elementConflicts: Record<string, Record<string, string>> = {
  'wood': {
    'fire': '木火相生，木生火，小人会更强',
    'earth': '木土相克，木克土，克制小人',
    'metal': '金木相克，金克木，小人克制你',
    'water': '水木相生，水生木，小人会更强'
  },
  'fire': {
    'wood': '火木相生，木生火，小人会更强',
    'earth': '火土相生，火生土，小人会更强',
    'metal': '火金相克，火克金，克制小人',
    'water': '水火相克，水克火，克制小人'
  },
  'earth': {
    'wood': '土木相克，木克土，小人克制你',
    'fire': '火土相生，火生土，小人会更强',
    'metal': '土金相生，土生金，小人会更强',
    'water': '土水相克，土克水，克制小人'
  },
  'metal': {
    'wood': '金木相克，金克木，克制小人',
    'fire': '火金相克，火克金，小人克制你',
    'earth': '土金相生，土生金，小人会更强',
    'water': '金水相生，金生水，小人会更强'
  },
  'water': {
    'wood': '水木相生，水生木，小人会更强',
    'fire': '水火相克，水克火，克制小人',
    'earth': '土水相克，土克水，小人克制你',
    'metal': '金水相生，金生水，小人会更强'
  }
};

const counterElements: Record<string, string> = {
  'wood': 'metal',
  'fire': 'water',
  'earth': 'wood',
  'metal': 'fire',
  'water': 'earth'
};

const troubles = [
  { id: 'insomnia', name: '失眠多梦', nameEn: 'Insomnia', icon: '😴' },
  { id: 'anxiety', name: '心烦意乱', nameEn: 'Anxiety', icon: '😰' },
  { id: 'anger', name: '容易发火', nameEn: 'Easily Angry', icon: '😡' },
  { id: 'work', name: '职场不顺', nameEn: 'Work Issues', icon: '💼' },
  { id: 'relationship', name: '感情困扰', nameEn: 'Relationship Problems', icon: '💔' },
  { id: 'health', name: '身体不适', nameEn: 'Health Issues', icon: '🤒' },
  { id: 'money', name: '财运不佳', nameEn: 'Financial Problems', icon: '💰' },
  { id: 'study', name: '学业受阻', nameEn: 'Academic Issues', icon: '📚' }
];

export { troubles };

export function calculateBazi(birthYear: number): Bazi {
  const yearIndex = (birthYear - 4) % 10;
  const branchIndex = (birthYear - 4) % 12;
  
  const heavenlyStem = heavenlyStems[yearIndex];
  const earthlyBranch = earthlyBranches[branchIndex];
  const element = elementMap[heavenlyStem];
  
  return {
    year: birthYear,
    heavenlyStem,
    earthlyBranch,
    element,
    elementName: elementNames[element]
  };
}

export function calculateVillainDirection(bedDirection: string, doorDirection: string): string {
  const directionCombinations: Record<string, string> = {
    '正北-正北': '正北',
    '正北-正南': '正西',
    '正北-正东': '西北',
    '正北-正西': '东北',
    '正北-东北': '西北',
    '正北-东南': '正东',
    '正北-西南': '正南',
    '正南-正北': '正东',
    '正南-正南': '正北',
    '正南-正东': '东北',
    '正南-正西': '东南',
    '正南-东北': '正东',
    '正南-东南': '正北',
    '正南-西南': '正西',
    '正东-正北': '东南',
    '正东-正南': '东北',
    '正东-正东': '正西',
    '正东-正西': '正南',
    '正东-东北': '西南',
    '正东-东南': '正北',
    '正西-正北': '西南',
    '正西-正南': '东南',
    '正西-正东': '西北',
    '正西-正西': '正东',
    '正西-东北': '正南',
    '正西-东南': '正北',
    '东北-正北': '西北',
    '东北-正南': '正东',
    '东北-正东': '正北',
    '东北-正西': '东北',
    '东北-西南': '正西',
    '东北-东南': '正南',
    '东南-正北': '正东',
    '东南-正南': '正北',
    '东南-正东': '东南',
    '东南-正西': '东北',
    '东南-西南': '正西',
    '西北-正北': '西南',
    '西北-正南': '正西',
    '西北-正东': '西北',
    '西北-正西': '东北',
    '西北-东北': '正南',
    '西北-东南': '正北',
    '西南-正北': '东南',
    '西南-正南': '正西',
    '西南-正东': '西南',
    '西南-正西': '西北',
    '西南-东北': '正北',
    '西南-东南': '正东'
  };
  
  const key = `${bedDirection}-${doorDirection}`;
  return directionCombinations[key] || '正南';
}

export function generateDiagnosis(birthYear: number, bedDirection: string, doorDirection: string, currentTroubles: string[], lang: 'zh' | 'en' = 'zh'): Diagnosis {
  const bazi = calculateBazi(birthYear);
  const villainDirection = calculateVillainDirection(bedDirection, doorDirection);
  const villainElement = directionElements[villainDirection];
  const counterElement = counterElements[villainElement];
  
  const villainInfo = villainTypes[villainElement];
  const shoeInfo = shoeTypes[counterElement];
  
  const timeKeys = Object.keys(timeSlots);
  const optimalTimeKey = timeKeys.find(key => {
    const slot = timeSlots[key];
    const slotElement = elementMap[key.charAt(0)];
    return slotElement === counterElement;
  }) || '午时';
  
  const optimalTime = timeSlots[optimalTimeKey];
  
  const conflict = elementConflicts[bazi.element][villainElement];
  const isAdvantageous = conflict.includes('克制小人');
  
  const psychologicalEffect = generatePsychologicalEffect(
    bazi,
    villainInfo,
    villainDirection,
    shoeInfo,
    optimalTime,
    isAdvantageous,
    currentTroubles,
    lang
  );
  
  return {
    user: {
      element: bazi.element,
      year: bazi.year,
      heavenlyStem: bazi.heavenlyStem,
      earthlyBranch: bazi.earthlyBranch,
      elementName: bazi.elementName
    },
    situation: {
      conflict: isAdvantageous ? `${bazi.elementName}克${elementNames[villainElement]}` : `${elementNames[villainElement]}克${bazi.elementName}`,
      description: conflict
    },
    villain: {
      direction: villainDirection,
      type: villainInfo.name,
      element: villainElement,
      characteristics: villainInfo.characteristics
    },
    solution: {
      shoeType: shoeInfo.name,
      shoeIcon: shoeInfo.icon,
      optimalTime: optimalTime.name,
      timeRange: optimalTime.range,
      timeHour: optimalTime.hour
    },
    psychologicalEffect
  };
}

function generatePsychologicalEffect(
  bazi: Bazi,
  villainInfo: { name: string; characteristics: string[] },
  villainDirection: string,
  shoeInfo: { name: string; icon: string },
  optimalTime: { name: string; range: string },
  isAdvantageous: boolean,
  currentTroubles: string[],
  lang: 'zh' | 'en' = 'zh'
): string {
  const troubleText = currentTroubles.length > 0 
    ? lang === 'en'
      ? `you have ${currentTroubles.map(t => {
          const trouble = troubles.find(tr => tr.id === t);
          return trouble?.nameEn || '';
        }).join(', ')}, `
      : `最近${currentTroubles.map(t => {
          const trouble = troubles.find(tr => tr.id === t);
          return trouble?.name || '';
        }).join('、')}，`
    : '';
  
  if (lang === 'en') {
    if (isAdvantageous) {
      return `Oh my god, no wonder ${troubleText ? troubleText : 'you feel uneasy'} - it's a Five Elements conflict!
You are a ${bazi.elementName} person (born in ${bazi.year}), ${bazi.elementName} overcomes ${elementNames[villainInfo.element]}, no wonder ${troubleText ? 'you feel anxious lately' : 'you feel uneasy'}.
The villain comes from ${villainDirection} (${elementNames[villainInfo.element]} position), it's a '${villainInfo.name}', ${villainInfo.characteristics.join(', ')}.
You must use '${shoeInfo.name}' during ${optimalTime.name} (${optimalTime.range}) to suppress it.
— It's not that I'm ${troubleText ? 'incapable' : 'bad-tempered'}, it's Five Elements conflict!`;
    } else {
      return `Finally found the reason!
You are a ${bazi.elementName} person (born in ${bazi.year}), ${elementNames[villainInfo.element]} overcomes ${bazi.elementName}, no wonder ${troubleText ? 'you always hit walls' : 'you feel uneasy'}.
The villain comes from ${villainDirection} (${elementNames[villainInfo.element]} position), it's a '${villainInfo.name}', ${villainInfo.characteristics.join(', ')}.
You must use '${shoeInfo.name}' during ${optimalTime.name} (${optimalTime.range}) to suppress it.
— It's not that I'm ${troubleText ? 'incapable' : 'bad-tempered'}, it's Five Elements conflict!`;
    }
  } else {
    if (isAdvantageous) {
      return `天啊，难怪${troubleText}原来是五行犯冲！
你是${bazi.elementName}命（生于${bazi.year}年），${bazi.elementName}克${elementNames[villainInfo.element]}，难怪最近${troubleText || '心烦意乱'}。
小人来自${villainDirection}（${elementNames[villainInfo.element]}位），是'${villainInfo.name}'，${villainInfo.characteristics.join('、')}。
必须在${optimalTime.name}（${optimalTime.range}）使用'${shoeInfo.name}'进行压制。
——原来不是我${troubleText ? '能力不行' : '脾气不好'}，是五行犯冲啊！`;
    } else {
      return `终于找到原因了！
你是${bazi.elementName}命（生于${bazi.year}年），${elementNames[villainInfo.element]}克${bazi.elementName}，难怪最近${troubleText || '做事总是碰壁'}。
小人来自${villainDirection}（${elementNames[villainInfo.element]}位），是'${villainInfo.name}'，${villainInfo.characteristics.join('、')}。
必须在${optimalTime.name}（${optimalTime.range}）使用'${shoeInfo.name}'进行压制。
——不是我${troubleText ? '能力不行' : '脾气不好'}，是五行犯克啊！`;
    }
  }
}

export function getElementIcon(element: 'wood' | 'fire' | 'earth' | 'metal' | 'water'): string {
  return elementIcons[element];
}

export function getElementName(element: 'wood' | 'fire' | 'earth' | 'metal' | 'water'): string {
  return elementNames[element];
}

export function getDirectionName(direction: string): string {
  return direction;
}
