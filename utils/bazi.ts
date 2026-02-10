export interface Bazi {
  year: number;
  heavenlyStem: string;
  earthlyBranch: string;
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  elementName: string;
  elementColor: string;
}

export interface VillainInfo {
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  name: string;
  icon: string;
  characteristics: string[];
}

export interface ShoeInfo {
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  name: string;
  icon: string;
}

export interface OptimalTime {
  name: string;
  range: string;
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
}

export interface Diagnosis {
  bazi: Bazi;
  villainInfo: VillainInfo;
  villainDirection: string;
  shoeInfo: ShoeInfo;
  optimalTime: OptimalTime;
  isAdvantageous: boolean;
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

const elementColors: Record<string, string> = {
  'wood': '#22c55e',
  'fire': '#ef4444',
  'earth': '#f59e0b',
  'metal': '#eab308',
  'water': '#3b82f6'
};

const elementIcons: Record<string, string> = {
  'wood': '🌲',
  'fire': '🔥',
  'earth': '🏔️',
  'metal': '⚔️',
  'water': '💧'
};

const directions = ['正北', '东北', '正东', '东南', '正南', '西南', '正西', '西北'];

const villainTypes: Record<string, { name: string; characteristics: string[] }> = {
  'wood': {
    name: '成长型压力',
    characteristics: ['不断增长的焦虑', '对未来的担忧', '自我怀疑', '成长压力']
  },
  'fire': {
    name: '激情型压力',
    characteristics: ['情绪波动', '冲动行为', '愤怒情绪', '情绪失控']
  },
  'earth': {
    name: '稳定型压力',
    characteristics: ['停滞不前', '缺乏动力', '舒适区依赖', '抗拒改变']
  },
  'metal': {
    name: '精准型压力',
    characteristics: ['完美主义', '过度分析', '细节纠结', '自我批评']
  },
  'water': {
    name: '适应型压力',
    characteristics: ['情绪不稳定', '适应困难', '敏感多疑', '情绪内耗']
  }
};

const shoeTypes: Record<string, { name: string; icon: string }> = {
  'wood': { name: '成长拖鞋', icon: '🌱' },
  'fire': { name: '激情拖鞋', icon: '🔥' },
  'earth': { name: '稳定拖鞋', icon: '🏔️' },
  'metal': { name: '精准拖鞋', icon: '⚔️' },
  'water': { name: '适应拖鞋', icon: '💧' }
};

const optimalTimes: Record<string, { name: string; range: string }> = {
  'wood': { name: '寅时', range: '03:00-05:00' },
  'fire': { name: '巳时', range: '09:00-11:00' },
  'earth': { name: '辰时', range: '07:00-09:00' },
  'metal': { name: '申时', range: '15:00-17:00' },
  'water': { name: '亥时', range: '21:00-23:00' }
};

export function calculateBazi(birthYear: number): Bazi {
  const yearIndex = birthYear - 4;
  const stemIndex = yearIndex % 10;
  const branchIndex = yearIndex % 12;
  
  const heavenlyStem = heavenlyStems[stemIndex];
  const earthlyBranch = earthlyBranches[branchIndex];
  const element = elementMap[heavenlyStem];
  
  return {
    year: birthYear,
    heavenlyStem,
    earthlyBranch,
    element,
    elementName: elementNames[element],
    elementColor: elementColors[element]
  };
}

export function getElementIcon(element: 'wood' | 'fire' | 'earth' | 'metal' | 'water'): string {
  return elementIcons[element];
}

export function getElementName(element: 'wood' | 'fire' | 'earth' | 'metal' | 'water'): string {
  return elementNames[element];
}

export function generateDiagnosis(
  data: any,
  lang: 'zh' | 'en' = 'zh'
): Diagnosis {
  const bazi = calculateBazi(data.age + 2000 - 25);
  
  const elementOrder: ('wood' | 'fire' | 'earth' | 'metal' | 'water')[] = 
    ['wood', 'fire', 'earth', 'metal', 'water'];
  
  const userElementIndex = elementOrder.indexOf(bazi.element);
  const villainElementIndex = (userElementIndex + 2) % 5;
  const shoeElementIndex = (userElementIndex + 3) % 5;
  
  const villainElement = elementOrder[villainElementIndex];
  const shoeElement = elementOrder[shoeElementIndex];
  
  const villainInfo: VillainInfo = {
    element: villainElement,
    name: villainTypes[villainElement].name,
    icon: elementIcons[villainElement],
    characteristics: villainTypes[villainElement].characteristics
  };
  
  const shoeInfo: ShoeInfo = {
    element: shoeElement,
    name: shoeTypes[shoeElement].name,
    icon: shoeTypes[shoeElement].icon
  };
  
  const optimalTime: OptimalTime = {
    name: optimalTimes[shoeElement].name,
    range: optimalTimes[shoeElement].range,
    element: shoeElement
  };
  
  const directionIndex = (userElementIndex + 1) % 8;
  const villainDirection = directions[directionIndex];
  
  const isAdvantageous = data.stressTypes && data.stressTypes.length > 0;
  
  const psychologicalEffect = generatePsychologicalEffect(
    bazi,
    villainInfo,
    villainDirection,
    shoeInfo,
    optimalTime,
    isAdvantageous,
    data.stressTypes || [],
    lang
  );
  
  return {
    bazi,
    villainInfo,
    villainDirection,
    shoeInfo,
    optimalTime,
    isAdvantageous,
    psychologicalEffect
  };
}

function generatePsychologicalEffect(
  bazi: Bazi,
  villainInfo: VillainInfo,
  villainDirection: string,
  shoeInfo: ShoeInfo,
  optimalTime: OptimalTime,
  isAdvantageous: boolean,
  currentTroubles: string[],
  lang: 'zh' | 'en' = 'zh'
): string {
  const troubleText = currentTroubles.length > 0 
    ? currentTroubles.join('、') 
    : '';
  
  if (lang === 'en') {
    if (isAdvantageous) {
      return `Based on behavioral psychology analysis, your personality type is ${bazi.elementName} (${bazi.year}). 

The stress patterns you're experiencing (${troubleText ? troubleText : 'various pressures'}) are related to the ${villainInfo.name} from the ${villainDirection} direction.

Characteristics: ${villainInfo.characteristics.join(', ')}.

Recommended relief strategy: Use the "${shoeInfo.name}" tool during ${optimalTime.name} (${optimalTime.range}) for optimal stress release.

Psychological insight: This isn't about your capability - it's about understanding your stress patterns and using the right tools for relief.`;
    } else {
      return `Based on behavioral psychology analysis, your personality type is ${bazi.elementName} (${bazi.year}). 

Your stress patterns suggest you may be experiencing ${villainInfo.name} from the ${villainDirection} direction.

Characteristics: ${villainInfo.characteristics.join(', ')}.

Recommended relief strategy: Use the "${shoeInfo.name}" tool during ${optimalTime.name} (${optimalTime.range}) for optimal stress release.

Psychological insight: Understanding your stress patterns is the first step to effective relief. This tool is designed to help you release pressure in a healthy way.`;
    }
  } else {
    if (isAdvantageous) {
      return `天哪，难怪${troubleText ? troubleText : '你最近感到不安'} - 这是压力模式的冲突！

你的人格类型是${bazi.elementName}型（${bazi.year}），${bazi.elementName}型的人容易受到${elementNames[villainInfo.element]}型压力的影响，难怪${troubleText ? '你最近感到焦虑' : '你感到不安'}。

压力源来自${villainDirection}方向（${elementNames[villainInfo.element]}方位），这是一个"${villainInfo.name}"，${villainInfo.characteristics.join('、')}。

建议使用"${shoeInfo.name}"在${optimalTime.name}（${optimalTime.range}）进行压力释放，效果最佳。

—— 这不是你${troubleText ? '能力不行' : '脾气不好'}，这是压力模式冲突！`;
    } else {
      return `根据行为心理学分析，你的人格类型是${bazi.elementName}型（${bazi.year}）。

你的压力模式显示，你可能正在经历来自${villainDirection}方向（${elementNames[villainInfo.element]}方位）的"${villainInfo.name}"。

特征：${villainInfo.characteristics.join('、')}。

建议使用"${shoeInfo.name}"在${optimalTime.name}（${optimalTime.range}）进行压力释放，效果最佳。

心理洞察：理解你的压力模式是有效缓解的第一步。这个工具旨在帮助你以健康的方式释放压力。`;
    }
  }
}
