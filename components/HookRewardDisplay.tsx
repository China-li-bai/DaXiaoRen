import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { hookModel, HookReward, checkAchievements, getNextMilestone } from '../utils/hookModel';
import GlassCard from './ui/GlassCard';
import SmoothTransition from './ui/SmoothTransition';
import CollapsibleSection from './ui/CollapsibleSection';

interface Props {
  lang: Language;
  onReward?: (reward: HookReward) => void;
}

const HookRewardDisplay: React.FC<Props> = ({ lang, onReward }) => {
  const [rewards, setRewards] = useState<HookReward[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [milestone, setMilestone] = useState(getNextMilestone(hookModel.getTotalStressReleased()));
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const newRewards = hookModel.getRecentRewards(5);
      setRewards(newRewards);
      setAchievements(checkAchievements(hookModel.getState()));
      setMilestone(getNextMilestone(hookModel.getTotalStressReleased()));
      setUnreadCount(newRewards.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRewardClick = (reward: HookReward) => {
    if (onReward) {
      onReward(reward);
    }
  };

  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
      {!isExpanded ? (
        <SmoothTransition>
          <button
            onClick={() => setIsExpanded(true)}
            className="relative bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-full p-4 shadow-2xl transition-all transform hover:scale-110 active:scale-95"
          >
            <span className="text-2xl">🎁</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </SmoothTransition>
      ) : (
        <SmoothTransition>
          <GlassCard className="w-80 max-h-[70vh] overflow-y-auto mb-4">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {lang === 'zh' ? '🎁 奖励中心' : '🎁 Reward Center'}
              </h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <CollapsibleSection
                title={lang === 'zh' ? '🎉 最新奖励' : '🎉 Recent Rewards'}
                icon="🎉"
                defaultOpen={true}
                badge={rewards.length > 0 ? rewards.length : undefined}
              >
                {rewards.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    {lang === 'zh' ? '暂无奖励' : 'No rewards yet'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rewards.slice(0, 5).map((reward, index) => (
                      <div
                        key={index}
                        onClick={() => handleRewardClick(reward)}
                        className="flex items-center gap-3 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl p-3 cursor-pointer hover:from-amber-600/20 hover:to-orange-600/20 transition-all group"
                      >
                        <div className="text-3xl group-hover:scale-110 transition-transform">
                          {reward.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium mb-1">{reward.message}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 text-xs font-bold">+{reward.value}</span>
                            <span className="text-slate-500 text-xs">
                              {reward.type === 'variable' && (lang === 'zh' ? '随机奖励' : 'Variable')}
                              {reward.type === 'self' && (lang === 'zh' ? '自我奖励' : 'Self')}
                              {reward.type === 'investment' && (lang === 'zh' ? '投资奖励' : 'Investment')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleSection>

              <CollapsibleSection
                title={lang === 'zh' ? '🏅 成就解锁' : '🏅 Achievements'}
                icon="🏅"
                defaultOpen={false}
                badge={achievements.length > 0 ? achievements.length : undefined}
              >
                {achievements.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    {lang === 'zh' ? '暂无成就' : 'No achievements yet'}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-xl flex items-center justify-center text-2xl hover:scale-110 transition-transform cursor-pointer"
                        title={achievement}
                      >
                        {achievement}
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleSection>

              <CollapsibleSection
                title={lang === 'zh' ? '📊 进度追踪' : '📊 Progress Tracker'}
                icon="📊"
                defaultOpen={true}
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-300">{milestone.label}</span>
                      <span className="text-green-400 font-bold">{Math.round(milestone.progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 relative"
                        style={{ width: `${milestone.progress}%` }}
                      >
                        <div className="absolute right-0 top-0 h-full w-1 bg-white/50" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-xl p-3 text-center">
                      <div className="text-2xl mb-1">🔥</div>
                      <div className="text-slate-400 text-xs mb-1">
                        {lang === 'zh' ? '连续天数' : 'Streak'}
                      </div>
                      <div className="text-white text-xl font-bold">{hookModel.getStreakDays()}</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-xl p-3 text-center">
                      <div className="text-2xl mb-1">💎</div>
                      <div className="text-slate-400 text-xs mb-1">
                        {lang === 'zh' ? '总计释放' : 'Total'}
                      </div>
                      <div className="text-white text-xl font-bold">{hookModel.getTotalStressReleased()}</div>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <button
                onClick={() => setRewards([])}
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                {lang === 'zh' ? '清除所有奖励' : 'Clear All Rewards'}
              </button>
            </div>
          </GlassCard>
        </SmoothTransition>
      )}
    </div>
  );
};

export default HookRewardDisplay;
