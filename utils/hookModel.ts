export interface HookTrigger {
  type: 'external' | 'internal';
  message: string;
  action: () => void;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
}

export interface HookReward {
  type: 'variable' | 'social' | 'self';
  message: string;
  value: number;
  icon: string;
  timestamp: number;
}

export interface HookInvestment {
  type: 'time' | 'data' | 'emotional';
  amount: number;
  description: string;
  timestamp: number;
}

export interface HookState {
  triggers: HookTrigger[];
  rewards: HookReward[];
  investments: HookInvestment[];
  streakDays: number;
  totalStressReleased: number;
  lastActiveDate: string;
}

class HookModel {
  private state: HookState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): HookState {
    const saved = localStorage.getItem('hookState');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      triggers: [],
      rewards: [],
      investments: [],
      streakDays: 0,
      totalStressReleased: 0,
      lastActiveDate: new Date().toISOString()
    };
  }

  private saveState() {
    localStorage.setItem('hookState', JSON.stringify(this.state));
  }

  private checkStreak() {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = this.state.lastActiveDate.split('T')[0];
    
    if (today !== lastActive) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        this.state.streakDays++;
      } else if (diffDays > 1) {
        this.state.streakDays = 1;
      }
      
      this.state.lastActiveDate = today;
      this.saveState();
    }
  }

  public trigger(type: 'external' | 'internal', message: string, action: () => void, priority: 'high' | 'medium' | 'low' = 'medium') {
    this.checkStreak();
    
    const trigger: HookTrigger = {
      type,
      message,
      action,
      priority,
      timestamp: Date.now()
    };
    
    this.state.triggers.push(trigger);
    this.saveState();
    
    return trigger;
  }

  public reward(type: 'variable' | 'social' | 'self', message: string, value: number, icon: string) {
    this.checkStreak();
    
    const reward: HookReward = {
      type,
      message,
      value,
      icon,
      timestamp: Date.now()
    };
    
    this.state.rewards.push(reward);
    this.state.totalStressReleased += value;
    this.saveState();
    
    return reward;
  }

  public invest(type: 'time' | 'data' | 'emotional', amount: number, description: string) {
    this.checkStreak();
    
    const investment: HookInvestment = {
      type,
      amount,
      description,
      timestamp: Date.now()
    };
    
    this.state.investments.push(investment);
    this.saveState();
    
    return investment;
  }

  public getState(): HookState {
    this.checkStreak();
    return { ...this.state };
  }

  public getStreakDays(): number {
    this.checkStreak();
    return this.state.streakDays;
  }

  public getTotalStressReleased(): number {
    this.checkStreak();
    return this.state.totalStressReleased;
  }

  public getRecentRewards(limit: number = 10): HookReward[] {
    this.checkStreak();
    return this.state.rewards.slice(-limit).reverse();
  }

  public getActiveTriggers(): HookTrigger[] {
    this.checkStreak();
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    return this.state.triggers.filter(t => t.timestamp > oneHourAgo);
  }

  public clearOldTriggers() {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    this.state.triggers = this.state.triggers.filter(t => t.timestamp > oneDayAgo);
    this.saveState();
  }

  public reset() {
    localStorage.removeItem('hookState');
    this.state = this.loadState();
  }
}

export const hookModel = new HookModel();

export function generateVariableReward(baseValue: number): number {
  const variance = baseValue * 0.5;
  const randomVariance = Math.random() * variance - variance / 2;
  return Math.round(baseValue + randomVariance);
}

export function checkAchievements(state: HookState): string[] {
  const achievements: string[] = [];
  
  if (state.streakDays >= 1) achievements.push('🌟 First Day');
  if (state.streakDays >= 7) achievements.push('🔥 Week Warrior');
  if (state.streakDays >= 30) achievements.push('💎 Monthly Master');
  if (state.totalStressReleased >= 1000) achievements.push('💪 Stress Buster');
  if (state.totalStressReleased >= 10000) achievements.push('🏆 Champion');
  if (state.totalStressReleased >= 100000) achievements.push('👑 Legend');
  
  return achievements;
}

export function getNextMilestone(currentStress: number): { value: number; label: string; progress: number } {
  const milestones = [
    { value: 100, label: '🎯 100 Points' },
    { value: 500, label: '⭐ 500 Points' },
    { value: 1000, label: '🌟 1,000 Points' },
    { value: 5000, label: '💎 5,000 Points' },
    { value: 10000, label: '🏆 10,000 Points' },
    { value: 50000, label: '👑 50,000 Points' },
    { value: 100000, label: '🏅 100,000 Points' }
  ];
  
  for (const milestone of milestones) {
    if (currentStress < milestone.value) {
      return {
        value: milestone.value,
        label: milestone.label,
        progress: (currentStress / milestone.value) * 100
      };
    }
  }
  
  return {
    value: 100000,
    label: '🏅 100,000 Points',
    progress: 100
  };
}
