import { Bazi, Diagnosis, VillainInfo, ShoeInfo, OptimalTime, elementNames } from './bazi';

export interface ReliefStrategy {
  title: string;
  description: string;
  actions: string[];
  duration: string;
  effectiveness: 'low' | 'medium' | 'high';
}

export interface StressPattern {
  type: string;
  triggers: string[];
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

export function analyzeStressPattern(data: any): StressPattern {
  const stressTypes = data.stressTypes || [];
  const age = data.age || 25;
  
  let severity: StressPattern['severity'] = 'mild';
  if (stressTypes.length >= 3) severity = 'severe';
  else if (stressTypes.length >= 2) severity = 'moderate';
  
  const triggers: string[] = [];
  const symptoms: string[] = [];
  
  if (stressTypes.includes('work')) {
    triggers.push('工作压力', 'deadline', '会议', '加班');
    symptoms.push('失眠', '焦虑', '注意力不集中');
  }
  if (stressTypes.includes('relationship')) {
    triggers.push('人际关系', '冲突', '误解');
    symptoms.push('情绪波动', '孤独感', '压力');
  }
  if (stressTypes.includes('health')) {
    triggers.push('健康担忧', '身体不适', '疲劳');
    symptoms.push('紧张', '不安', '情绪低落');
  }
  if (stressTypes.includes('finance')) {
    triggers.push('经济压力', '账单', '投资');
    symptoms.push('焦虑', '失眠', '食欲不振');
  }
  if (stressTypes.includes('study')) {
    triggers.push('学业压力', '考试', '作业');
    symptoms.push('注意力分散', '记忆力下降', '紧张');
  }
  if (stressTypes.includes('anxiety')) {
    triggers.push('不确定性', '过度思考', '担忧未来');
    symptoms.push('心悸', '出汗', '呼吸急促');
  }
  if (stressTypes.includes('insomnia')) {
    triggers.push('睡眠不足', '作息不规律', '夜醒');
    symptoms.push('疲劳', '情绪不稳', '记忆力差');
  }
  if (stressTypes.includes('anger')) {
    triggers.push('不公', '被忽视', '压力积累');
    symptoms.push('易怒', '冲动', '攻击性');
  }
  
  return {
    type: stressTypes.length > 0 ? stressTypes[0] : 'general',
    triggers,
    symptoms,
    severity
  };
}

export function generateReliefStrategy(
  bazi: Bazi,
  stressPattern: StressPattern,
  lang: 'zh' | 'en' = 'zh'
): ReliefStrategy {
  const element = bazi.element;
  
  const strategies: Record<string, ReliefStrategy> = {
    wood: {
      title: lang === 'zh' ? '生长型缓解' : 'Growth-based Relief',
      description: lang === 'zh' 
        ? '通过创造和成长来释放压力，适合需要表达和发展的你。'
        : 'Release stress through creativity and growth, suitable for those who need expression and development.',
      actions: lang === 'zh'
        ? ['写日记', '绘画', '园艺', '学习新技能']
        : ['Journaling', 'Drawing', 'Gardening', 'Learning new skills'],
      duration: lang === 'zh' ? '30-60分钟' : '30-60 minutes',
      effectiveness: 'medium'
    },
    fire: {
      title: lang === 'zh' ? '激情型缓解' : 'Passion-based Relief',
      description: lang === 'zh'
        ? '通过运动和表达来释放激情，适合需要行动和挑战的你。'
        : 'Release passion through exercise and expression, suitable for those who need action and challenges.',
      actions: lang === 'zh'
        ? ['有氧运动', '舞蹈', '拳击', '大声喊叫']
        : ['Aerobic exercise', 'Dancing', 'Boxing', 'Loud shouting'],
      duration: lang === 'zh' ? '20-40分钟' : '20-40 minutes',
      effectiveness: 'high'
    },
    earth: {
      title: lang === 'zh' ? '稳定型缓解' : 'Stability-based Relief',
      description: lang === 'zh'
        ? '通过稳定和 grounding 来释放压力，适合需要安全感的你。'
        : 'Release stress through stability and grounding, suitable for those who need security.',
      actions: lang === 'zh'
        ? ['冥想', '瑜伽', '整理房间', '泡茶']
        : ['Meditation', 'Yoga', 'Organizing room', 'Tea brewing'],
      duration: lang === 'zh' ? '15-30分钟' : '15-30 minutes',
      effectiveness: 'medium'
    },
    metal: {
      title: lang === 'zh' ? '精准型缓解' : 'Precision-based Relief',
      description: lang === 'zh'
        ? '通过分析和规划来释放压力，适合需要秩序和控制的你。'
        : 'Release stress through analysis and planning, suitable for those who need order and control.',
      actions: lang === 'zh'
        ? ['列清单', '时间管理', '分解任务', '深度工作']
        : ['Making lists', 'Time management', 'Breaking down tasks', 'Deep work'],
      duration: lang === 'zh' ? '45-90分钟' : '45-90 minutes',
      effectiveness: 'high'
    },
    water: {
      title: lang === 'zh' ? '适应型缓解' : 'Adaptability-based Relief',
      description: lang === 'zh'
        ? '通过流动和变化来释放压力，适合需要灵活性和适应的你。'
        : 'Release stress through flow and change, suitable for those who need flexibility and adaptation.',
      actions: lang === 'zh'
        ? ['听音乐', '散步', '泡澡', '改变环境']
        : ['Listening to music', 'Walking', 'Bathing', 'Changing environment'],
      duration: lang === 'zh' ? '10-30分钟' : '10-30 minutes',
      effectiveness: 'low'
    }
  };
  
  let baseStrategy = strategies[element];
  
  if (stressPattern.severity === 'severe') {
    baseStrategy.effectiveness = 'high';
    baseStrategy.actions = [...baseStrategy.actions, 
      lang === 'zh' ? '寻求专业帮助' : 'Seek professional help',
      lang === 'zh' ? '深呼吸练习' : 'Deep breathing exercises'
    ];
  }
  
  return baseStrategy;
}

export function searchReliefStrategies(
  query: string,
  lang: 'zh' | 'en' = 'zh'
): ReliefStrategy[] {
  const allStrategies: ReliefStrategy[] = [];
  
  const elements: Array<keyof typeof elementNames> = ['wood', 'fire', 'earth', 'metal', 'water'];
  
  elements.forEach(element => {
    const mockBazi: Bazi = {
      year: 2000,
      heavenlyStem: '甲',
      earthlyBranch: '子',
      element,
      elementName: elementNames[element],
      elementColor: '#22c55e'
    };
    
    const mockStressPattern: StressPattern = {
      type: 'general',
      triggers: [],
      symptoms: [],
      severity: 'moderate'
    };
    
    const strategy = generateReliefStrategy(mockBazi, mockStressPattern, lang);
    
    if (strategy.title.toLowerCase().includes(query.toLowerCase()) ||
        strategy.description.toLowerCase().includes(query.toLowerCase()) ||
        strategy.actions.some(action => action.toLowerCase().includes(query.toLowerCase()))) {
      allStrategies.push(strategy);
    }
  });
  
  return allStrategies;
}
