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

export interface BaziPillar {
  heavenlyStem: string;
  earthlyBranch: string;
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  elementName: string;
  elementColor: string;
}

export interface Bazi {
  year: BaziPillar;
  month: BaziPillar;
  day: BaziPillar;
  hour: BaziPillar;
  dayMaster: string;
  dayMasterElement: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
}

export interface FiveElementsStrength {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  strongest: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  weakest: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
}

export interface ElementRelationship {
  type: 'generating' | 'overcoming' | 'generated' | 'overcome';
  description: string;
}

function getElement(stemOrBranch: string): 'wood' | 'fire' | 'earth' | 'metal' | 'water' {
  return elementMap[stemOrBranch];
}

function calculateYearPillar(year: number): BaziPillar {
  const yearStemIndex = (year - 4) % 10;
  const yearBranchIndex = (year - 4) % 12;
  
  const stem = heavenlyStems[yearStemIndex];
  const branch = earthlyBranches[yearBranchIndex];
  const element = getElement(stem);
  
  return {
    heavenlyStem: stem,
    earthlyBranch: branch,
    element,
    elementName: elementNames[element],
    elementColor: elementColors[element]
  };
}

function calculateMonthPillar(year: number, month: number, day: number): BaziPillar {
  const yearPillar = calculateYearPillar(year);
  const yearStemIndex = heavenlyStems.indexOf(yearPillar.heavenlyStem);
  
  const monthBranches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  
  const monthBranchIndex = (month + 1) % 12;
  const monthBranch = monthBranches[monthBranchIndex];
  
  const monthStemStartIndex = (yearStemIndex % 5) * 2;
  const monthStemIndex = (monthStemStartIndex + monthBranchIndex) % 10;
  const monthStem = heavenlyStems[monthStemIndex];
  
  const element = getElement(monthStem);
  
  return {
    heavenlyStem: monthStem,
    earthlyBranch: monthBranch,
    element,
    elementName: elementNames[element],
    elementColor: elementColors[element]
  };
}

function calculateDayPillar(year: number, month: number, day: number): BaziPillar {
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const daysDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const baseDayStemIndex = heavenlyStems.indexOf('甲');
  const baseDayBranchIndex = earthlyBranches.indexOf('子');
  
  const dayStemIndex = (baseDayStemIndex + daysDiff) % 10;
  const dayBranchIndex = (baseDayBranchIndex + daysDiff) % 12;
  
  const stem = heavenlyStems[dayStemIndex];
  const branch = earthlyBranches[dayBranchIndex];
  const element = getElement(stem);
  
  return {
    heavenlyStem: stem,
    earthlyBranch: branch,
    element,
    elementName: elementNames[element],
    elementColor: elementColors[element]
  };
}

function calculateHourPillar(dayStem: string, hour: number): BaziPillar {
  const dayStemIndex = heavenlyStems.indexOf(dayStem);
  
  const hourBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
  const hourBranch = hourBranches[hourBranchIndex];
  
  const hourStemStartIndex = (dayStemIndex % 5) * 2;
  const hourStemIndex = (hourStemStartIndex + hourBranchIndex) % 10;
  const hourStem = heavenlyStems[hourStemIndex];
  
  const element = getElement(hourStem);
  
  return {
    heavenlyStem: hourStem,
    earthlyBranch: hourBranch,
    element,
    elementName: elementNames[element],
    elementColor: elementColors[element]
  };
}

export function calculateBazi(
  year: number,
  month: number,
  day: number,
  hour: number = 12
): Bazi {
  const yearPillar = calculateYearPillar(year);
  const monthPillar = calculateMonthPillar(year, month, day);
  const dayPillar = calculateDayPillar(year, month, day);
  const hourPillar = calculateHourPillar(dayPillar.heavenlyStem, hour);
  
  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    dayMaster: dayPillar.heavenlyStem,
    dayMasterElement: dayPillar.element
  };
}

export function analyzeFiveElementsStrength(bazi: Bazi): FiveElementsStrength {
  const strength = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0
  };
  
  const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour];
  
  pillars.forEach(pillar => {
    const stemElement = getElement(pillar.heavenlyStem);
    const branchElement = getElement(pillar.earthlyBranch);
    
    strength[stemElement] += 1;
    strength[branchElement] += 1;
  });
  
  const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const;
  const sorted = elements.sort((a, b) => strength[b] - strength[a]);
  
  return {
    ...strength,
    strongest: sorted[0],
    weakest: sorted[4]
  };
}

export function getElementRelationship(
  element1: 'wood' | 'fire' | 'earth' | 'metal' | 'water',
  element2: 'wood' | 'fire' | 'earth' | 'metal' | 'water'
): ElementRelationship {
  const generating: Record<string, string> = {
    'wood': 'fire',
    'fire': 'earth',
    'earth': 'metal',
    'metal': 'water',
    'water': 'wood'
  };
  
  const overcoming: Record<string, string> = {
    'wood': 'earth',
    'earth': 'water',
    'water': 'fire',
    'fire': 'metal',
    'metal': 'wood'
  };
  
  if (generating[element1] === element2) {
    return {
      type: 'generating',
      description: `${elementNames[element1]}生${elementNames[element2]}，相生关系，和谐顺畅`
    };
  }
  
  if (generating[element2] === element1) {
    return {
      type: 'generated',
      description: `${elementNames[element2]}生${elementNames[element1]}，被生关系，得贵人相助`
    };
  }
  
  if (overcoming[element1] === element2) {
    return {
      type: 'overcoming',
      description: `${elementNames[element1]}克${elementNames[element2]}，相克关系，需要克制`
    };
  }
  
  if (overcoming[element2] === element1) {
    return {
      type: 'overcome',
      description: `${elementNames[element2]}克${elementNames[element1]}，被克关系，需要化解`
    };
  }
  
  return {
    type: 'generating',
    description: '五行平衡，关系和谐'
  };
}

export function getVillainBasedOnBazi(
  bazi: Bazi,
  strength: FiveElementsStrength
): {
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  name: string;
  icon: string;
  characteristics: string[];
  reason: string;
} {
  const dayMasterElement = bazi.dayMasterElement;
  const weakestElement = strength.weakest;
  
  const villainTypes: Record<string, { name: string; characteristics: string[]; reason: string }> = {
    'wood': {
      name: '成长型压力',
      characteristics: ['不断增长的焦虑', '对未来的担忧', '自我怀疑', '成长压力'],
      reason: '木主生长，过旺则如藤蔓缠绕，让你感到窒息和压抑'
    },
    'fire': {
      name: '激情型压力',
      characteristics: ['情绪波动', '冲动行为', '愤怒情绪', '情绪失控'],
      reason: '火主激情，过旺则如烈火焚身，让你情绪难以平静'
    },
    'earth': {
      name: '稳定型压力',
      characteristics: ['停滞不前', '缺乏动力', '舒适区依赖', '抗拒改变'],
      reason: '土主稳定，过旺则如重土压身，让你难以突破和前进'
    },
    'metal': {
      name: '控制型压力',
      characteristics: ['过度分析', '完美主义', '自我批评', '控制欲强'],
      reason: '金主肃杀，过旺则如利刃伤身，让你对自己过于苛刻'
    },
    'water': {
      name: '适应型压力',
      characteristics: ['情绪波动', '缺乏安全感', '过度敏感', '情绪压抑'],
      reason: '水主流动，过旺则如洪水泛滥，让你情绪难以稳定'
    }
  };
  
  const villainInfo = villainTypes[weakestElement];
  
  return {
    element: weakestElement,
    name: villainInfo.name,
    icon: elementIcons[weakestElement],
    characteristics: villainInfo.characteristics,
    reason: villainInfo.reason
  };
}

export function getShoeBasedOnBazi(
  bazi: Bazi,
  villainElement: 'wood' | 'fire' | 'earth' | 'metal' | 'water'
): {
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  name: string;
  icon: string;
  reason: string;
} {
  const dayMasterElement = bazi.dayMasterElement;
  
  const elementOrder: ('wood' | 'fire' | 'earth' | 'metal' | 'water')[] = 
    ['wood', 'fire', 'earth', 'metal', 'water'];
  
  const villainIndex = elementOrder.indexOf(villainElement);
  const shoeIndex = (villainIndex + 2) % 5;
  const shoeElement = elementOrder[shoeIndex];
  
  const shoeTypes: Record<string, { name: string; icon: string; reason: string }> = {
    'wood': {
      name: '青木拖鞋',
      icon: '👟',
      reason: '木能克土，用青木拖鞋可以化解土型压力，如春风化雨般温柔而有力'
    },
    'fire': {
      name: '赤火拖鞋',
      icon: '👞',
      reason: '火能克金，用赤火拖鞋可以化解金型压力，如烈火炼金般彻底而果断'
    },
    'earth': {
      name: '黄土拖鞋',
      icon: '👡',
      reason: '土能克水，用黄土拖鞋可以化解水型压力，如高山止水般稳重而可靠'
    },
    'metal': {
      name: '白金拖鞋',
      icon: '👠',
      reason: '金能克木，用白金拖鞋可以化解木型压力，如利刃断木般精准而有效'
    },
    'water': {
      name: '黑水拖鞋',
      icon: '🩴',
      reason: '水能克火，用黑水拖鞋可以化解火型压力，如暴雨灭火般迅速而彻底'
    }
  };
  
  const shoeInfo = shoeTypes[shoeElement];
  
  return {
    element: shoeElement,
    name: shoeInfo.name,
    icon: shoeInfo.icon,
    reason: shoeInfo.reason
  };
}

export function getOptimalTimeBasedOnBazi(
  bazi: Bazi,
  shoeElement: 'wood' | 'fire' | 'earth' | 'metal' | 'water'
): {
  name: string;
  range: string;
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  reason: string;
} {
  const optimalTimes: Record<string, { name: string; range: string; reason: string }> = {
    'wood': {
      name: '卯时',
      range: '05:00-07:00',
      reason: '卯时属木，此时木气最旺，使用青木拖鞋可以借天时之力，事半功倍'
    },
    'fire': {
      name: '午时',
      range: '11:00-13:00',
      reason: '午时属火，此时火气最旺，使用赤火拖鞋可以借天时之力，威力倍增'
    },
    'earth': {
      name: '辰戌丑未时',
      range: '07:00-09:00 / 13:00-15:00 / 19:00-21:00 / 01:00-03:00',
      reason: '辰戌丑未时属土，此时土气最旺，使用黄土拖鞋可以借天时之力，稳固可靠'
    },
    'metal': {
      name: '申酉时',
      range: '15:00-17:00 / 17:00-19:00',
      reason: '申酉时属金，此时金气最旺，使用白金拖鞋可以借天时之力，精准有效'
    },
    'water': {
      name: '亥子时',
      range: '21:00-23:00 / 23:00-01:00',
      reason: '亥子时属水，此时水气最旺，使用黑水拖鞋可以借天时之力，迅速彻底'
    }
  };
  
  const timeInfo = optimalTimes[shoeElement];
  
  return {
    name: timeInfo.name,
    range: timeInfo.range,
    element: shoeElement,
    reason: timeInfo.reason
  };
}

export function getVillainDirectionBasedOnBazi(
  bazi: Bazi,
  villainElement: 'wood' | 'fire' | 'earth' | 'metal' | 'water'
): {
  direction: string;
  reason: string;
} {
  const elementToDirection: Record<string, { direction: string; reason: string }> = {
    'wood': {
      direction: '正东',
      reason: '木属东方，正东为木气汇聚之地，压力源多来自东方'
    },
    'fire': {
      direction: '正南',
      reason: '火属南方，正南为火气汇聚之地，压力源多来自南方'
    },
    'earth': {
      direction: '东北/西南',
      reason: '土属东北西南，此二方为土气汇聚之地，压力源多来自这些方向'
    },
    'metal': {
      direction: '正西',
      reason: '金属西方，正西为金气汇聚之地，压力源多来自西方'
    },
    'water': {
      direction: '正北',
      reason: '水属北方，正北为水气汇聚之地，压力源多来自北方'
    }
  };
  
  return elementToDirection[villainElement];
}

export function generateProfessionalDiagnosis(
  bazi: Bazi,
  strength: FiveElementsStrength,
  lang: 'zh' | 'en' = 'zh'
): {
  bazi: Bazi;
  strength: FiveElementsStrength;
  villain: ReturnType<typeof getVillainBasedOnBazi>;
  shoe: ReturnType<typeof getShoeBasedOnBazi>;
  optimalTime: ReturnType<typeof getOptimalTimeBasedOnBazi>;
  villainDirection: ReturnType<typeof getVillainDirectionBasedOnBazi>;
  analysis: string;
} {
  const villain = getVillainBasedOnBazi(bazi, strength);
  const shoe = getShoeBasedOnBazi(bazi, villain.element);
  const optimalTime = getOptimalTimeBasedOnBazi(bazi, shoe.element);
  const villainDirection = getVillainDirectionBasedOnBazi(bazi, villain.element);
  
  const dayMasterRelationship = getElementRelationship(bazi.dayMasterElement, villain.element);
  
  let analysis = '';
  
  if (lang === 'zh') {
    analysis = `
【命盘分析】
年柱：${bazi.year.heavenlyStem}${bazi.year.earthlyBranch}（${bazi.year.elementName}）
月柱：${bazi.month.heavenlyStem}${bazi.month.earthlyBranch}（${bazi.month.elementName}）
日柱：${bazi.day.heavenlyStem}${bazi.day.earthlyBranch}（${bazi.day.elementName}）← 日主
时柱：${bazi.hour.heavenlyStem}${bazi.hour.earthlyBranch}（${bazi.hour.elementName}）

【五行强弱】
木：${strength.wood}  火：${strength.fire}  土：${strength.earth}  金：${strength.metal}  水：${strength.water}
最旺：${elementNames[strength.strongest]}  最弱：${elementNames[strength.weakest]}

【压力分析】
你的日主为${bazi.day.heavenlyStem}（${bazi.dayMasterElement}），五行中${elementNames[strength.weakest]}最弱。
${dayMasterRelationship.description}

根据倪海厦老师的五行生克理论，你的压力源来自${elementNames[villain.element]}型压力——"${villain.name}"。
${villain.reason}

【化解方案】
克制${elementNames[villain.element]}的最佳五行是${elementNames[shoe.element]}。
推荐使用"${shoe.name}"，${shoe.reason}

最佳时机为${optimalTime.name}（${optimalTime.range}）。
${optimalTime.reason}

压力源主要来自${villainDirection.direction}方向。
${villainDirection.reason}

【心理洞察】
这不是你的能力问题，而是五行能量的自然流动。通过正确的工具和时机，你可以化解压力，重获平衡。
    `.trim();
  } else {
    analysis = `
【Bazi Analysis】
Year Pillar: ${bazi.year.heavenlyStem}${bazi.year.earthlyBranch} (${bazi.year.elementName})
Month Pillar: ${bazi.month.heavenlyStem}${bazi.month.earthlyBranch} (${bazi.month.elementName})
Day Pillar: ${bazi.day.heavenlyStem}${bazi.day.earthlyBranch} (${bazi.day.elementName}) ← Day Master
Hour Pillar: ${bazi.hour.heavenlyStem}${bazi.hour.earthlyBranch} (${bazi.hour.elementName})

【Five Elements Strength】
Wood: ${strength.wood}  Fire: ${strength.fire}  Earth: ${strength.earth}  Metal: ${strength.metal}  Water: ${strength.water}
Strongest: ${elementNames[strength.strongest]}  Weakest: ${elementNames[strength.weakest]}

【Stress Analysis】
Your Day Master is ${bazi.day.heavenlyStem} (${bazi.dayMasterElement}), and ${elementNames[strength.weakest]} is the weakest element.
${dayMasterRelationship.description}

According to Ni Haixia's Five Elements theory, your stress comes from ${elementNames[villain.element]} type stress - "${villain.name}".
${villain.reason}

【Relief Strategy】
The best element to overcome ${elementNames[villain.element]} is ${elementNames[shoe.element]}.
Recommended: "${shoe.name}", ${shoe.reason}

Best timing: ${optimalTime.name} (${optimalTime.range}).
${optimalTime.reason}

Stress mainly comes from the ${villainDirection.direction} direction.
${villainDirection.reason}

【Psychological Insight】
This is not about your ability, but the natural flow of Five Elements energy. With the right tools and timing, you can resolve stress and restore balance.
    `.trim();
  }
  
  return {
    bazi,
    strength,
    villain,
    shoe,
    optimalTime,
    villainDirection,
    analysis
  };
}
