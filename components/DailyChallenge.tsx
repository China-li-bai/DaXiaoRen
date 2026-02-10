import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { hookModel, getNextMilestone } from '../utils/hookModel';

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  reward: number;
  icon: string;
}

interface Props {
  lang: Language;
  onComplete?: (challenge: DailyChallenge) => void;
}

const DailyChallenge: React.FC<Props> = ({ lang, onComplete }) => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`dailyChallenge_${today}`);
    
    if (saved) {
      setChallenges(JSON.parse(saved));
    } else {
      const newChallenges = generateDailyChallenges(lang);
      setChallenges(newChallenges);
      localStorage.setItem(`dailyChallenge_${today}`, JSON.stringify(newChallenges));
      setShow(true);
    }
  }, [lang]);

  const generateDailyChallenges = (lang: Language): DailyChallenge[] => {
    const totalStress = hookModel.getTotalStressReleased();
    const milestone = getNextMilestone(totalStress);
    
    return [
      {
        id: 'first_hit',
        title: lang === 'zh' ? '第一次释放' : 'First Release',
        description: lang === 'zh' ? '点击屏幕释放第一次压力' : 'Tap to release stress for the first time',
        target: 1,
        current: totalStress > 0 ? 1 : 0,
        completed: totalStress > 0,
        reward: 10,
        icon: '🎯'
      },
      {
        id: 'streak_1',
        title: lang === 'zh' ? '连续 1 天' : '1 Day Streak',
        description: lang === 'zh' ? '连续使用 1 天' : 'Use the app for 1 day in a row',
        target: 1,
        current: hookModel.getStreakDays(),
        completed: hookModel.getStreakDays() >= 1,
        reward: 25,
        icon: '🔥'
      },
      {
        id: 'progress',
        title: lang === 'zh' ? '进度里程碑' : 'Progress Milestone',
        description: milestone.label,
        target: milestone.value,
        current: totalStress,
        completed: totalStress >= milestone.value,
        reward: 50,
        icon: '📊'
      }
    ];
  };

  const handleChallengeClick = (challenge: DailyChallenge) => {
    if (challenge.completed && onComplete) {
      onComplete(challenge);
    }
  };

  const t = TRANSLATIONS[lang];

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border-2 border-amber-500 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500 mb-2">
            {lang === 'zh' ? '一天改变' : 'Change in a Day'}
          </h2>
          <p className="text-slate-400 text-sm">
            {lang === 'zh' ? '完成今日挑战，释放压力，改变心情' : 'Complete today\'s challenges, release stress, change your mood'}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              onClick={() => handleChallengeClick(challenge)}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                challenge.completed
                  ? 'bg-green-900/20 border-green-500 hover:bg-green-900/30'
                  : 'bg-slate-700/50 border-slate-600 hover:border-amber-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{challenge.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-bold ${challenge.completed ? 'text-green-400' : 'text-slate-200'}`}>
                      {challenge.title}
                    </h3>
                    {challenge.completed && (
                      <span className="text-green-400 text-xl">✓</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{challenge.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">
                        {lang === 'zh' ? '进度' : 'Progress'}:
                      </span>
                      <span className={challenge.completed ? 'text-green-400' : 'text-amber-400'}>
                        {challenge.current} / {challenge.target}
                      </span>
                    </div>
                    <span className="text-amber-400 font-bold">
                      +{challenge.reward}
                    </span>
                  </div>
                  {!challenge.completed && (
                    <div className="w-full bg-slate-600 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-red-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min((challenge.current / challenge.target) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShow(false)}
          className="w-full bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
        >
          {lang === 'zh' ? '开始挑战' : 'Start Challenge'}
        </button>
      </div>
    </div>
  );
};

export default DailyChallenge;
