import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { hookModel, HookReward, checkAchievements, getNextMilestone } from '../utils/hookModel';

interface Props {
  lang: Language;
  onReward?: (reward: HookReward) => void;
}

const HookRewardDisplay: React.FC<Props> = ({ lang, onReward }) => {
  const [rewards, setRewards] = useState<HookReward[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [milestone, setMilestone] = useState(getNextMilestone(hookModel.getTotalStressReleased()));

  useEffect(() => {
    const interval = setInterval(() => {
      setRewards(hookModel.getRecentRewards(5));
      setAchievements(checkAchievements(hookModel.getState()));
      setMilestone(getNextMilestone(hookModel.getTotalStressReleased()));
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
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {rewards.length > 0 && (
        <div className="bg-slate-800/95 backdrop-blur-sm border-2 border-amber-500 rounded-lg p-4 shadow-2xl max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-amber-400 font-bold text-sm">
              {lang === 'zh' ? '🎉 最新奖励' : '🎉 Recent Rewards'}
            </h3>
            <button
              onClick={() => setRewards([])}
              className="text-slate-400 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            {rewards.slice(0, 3).map((reward, index) => (
              <div
                key={index}
                onClick={() => handleRewardClick(reward)}
                className="flex items-center gap-2 bg-slate-700/50 rounded p-2 cursor-pointer hover:bg-slate-700 transition-colors"
              >
                <span className="text-2xl">{reward.icon}</span>
                <div className="flex-1">
                  <p className="text-slate-200 text-xs font-medium">{reward.message}</p>
                  <p className="text-amber-400 text-xs font-bold">+{reward.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {achievements.length > 0 && (
        <div className="bg-slate-800/95 backdrop-blur-sm border-2 border-purple-500 rounded-lg p-4 shadow-2xl max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-purple-400 font-bold text-sm">
              {lang === 'zh' ? '🏅 成就解锁' : '🏅 Achievements'}
            </h3>
            <button
              onClick={() => setShowAchievements(!showAchievements)}
              className="text-slate-400 hover:text-slate-300 text-xs"
            >
              {showAchievements ? '▼' : '▶'}
            </button>
          </div>
          {showAchievements && (
            <div className="space-y-2">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-purple-900/20 rounded p-2"
                >
                  <span className="text-xl">{achievement}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-slate-800/95 backdrop-blur-sm border-2 border-green-500 rounded-lg p-4 shadow-2xl max-w-xs">
        <h3 className="text-green-400 font-bold text-sm mb-2">
          {lang === 'zh' ? '📊 进度' : '📊 Progress'}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{milestone.label}</span>
            <span className="text-green-400 font-bold">{Math.round(milestone.progress)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${milestone.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {lang === 'zh' ? '连续天数' : 'Streak'}: {hookModel.getStreakDays()} 🔥
            </span>
            <span className="text-green-400 font-bold">
              {lang === 'zh' ? '总计' : 'Total'}: {hookModel.getTotalStressReleased()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HookRewardDisplay;
