import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { hookModel, HookReward, checkAchievements, getNextMilestone } from '../utils/hookModel';
import { GlobalLeaderboardState, LeaderboardMetadata } from '../partykit/types';
import { getPartyKitHost } from '../config/partykit';
import usePartySocket from 'partysocket/react';
import { SavedDiagnosis, getSavedDiagnoses, deleteDiagnosis, deleteAllDiagnoses } from '../utils/diagnosisStorage';
import { isEncryptionEnabled } from '../utils/encryption';
import GlassCard from './ui/GlassCard';
import SmoothTransition from './ui/SmoothTransition';
import CollapsibleSection from './ui/CollapsibleSection';
import StatCard from './ui/StatCard';
import IOSSwitch from './ui/IOSSwitch';

interface Props {
  lang: Language;
  onSelectDiagnosis: (diagnosis: SavedDiagnosis) => void;
  onNewDiagnosis: () => void;
  onPrivacySettings: () => void;
  clicksToAdd: number;
  onClicksSent: () => void;
}

type DockView = 'main' | 'rewards' | 'leaderboard' | 'profile';

interface UserStats {
  totalDiagnoses: number;
  totalUses: number;
  mostUsedStrategy: string;
  stressDistribution: {
    severe: number;
    moderate: number;
    mild: number;
  };
  mostCommonStressType: string;
  averageUsesPerDiagnosis: number;
  lastDiagnosisDate: number;
  firstDiagnosisDate: number;
}

const FloatingDock: React.FC<Props> = ({
  lang,
  onSelectDiagnosis,
  onNewDiagnosis,
  onPrivacySettings,
  clicksToAdd,
  onClicksSent
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentView, setCurrentView] = useState<DockView>('main');
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Rewards state
  const [rewards, setRewards] = useState<HookReward[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [milestone, setMilestone] = useState(getNextMilestone(hookModel.getTotalStressReleased()));
  
  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<GlobalLeaderboardState>({});
  const [metadata, setMetadata] = useState<LeaderboardMetadata | null>(null);
  const [prevLeaderboard, setPrevLeaderboard] = useState<GlobalLeaderboardState>({});
  const clickBuffer = useRef(0);
  
  // Profile state
  const [diagnoses, setDiagnoses] = useState<SavedDiagnosis[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  // Leaderboard socket
  const socket = usePartySocket({
    host: getPartyKitHost(),
    room: "global-leaderboard",
    onMessage(event) {
      const msg = JSON.parse(event.data);
      if (msg.type === 'LB_UPDATE') {
        setPrevLeaderboard(leaderboard);
        setLeaderboard(msg.state);
        if (msg.metadata) {
          setMetadata(msg.metadata);
        }
      }
    }
  });

  // Accumulate clicks
  useEffect(() => {
    if (clicksToAdd > 0) {
      clickBuffer.current += clicksToAdd;
      onClicksSent();
    }
  }, [clicksToAdd, onClicksSent]);

  // Flush buffer every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (clickBuffer.current > 0 && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'LB_CLICK', count: clickBuffer.current }));
        clickBuffer.current = 0;
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [socket]);

  // Load rewards data
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

  // Load profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    const saved = await getSavedDiagnoses();
    setDiagnoses(saved);
    calculateStats(saved);
    setLoading(false);
  };

  const calculateStats = (diagnoses: SavedDiagnosis[]) => {
    if (diagnoses.length === 0) {
      setStats(null);
      return;
    }

    const totalDiagnoses = diagnoses.length;
    const totalUses = diagnoses.reduce((sum, d) => sum + d.useCount, 0);
    const averageUsesPerDiagnosis = totalDiagnoses > 0 ? (totalUses / totalDiagnoses).toFixed(1) : '0';

    const stressDistribution = {
      severe: diagnoses.filter(d => d.stressPattern?.severity === 'severe').length,
      moderate: diagnoses.filter(d => d.stressPattern?.severity === 'moderate').length,
      mild: diagnoses.filter(d => d.stressPattern?.severity === 'mild').length
    };

    const stressTypeCount: Record<string, number> = {};
    diagnoses.forEach(d => {
      if (d.stressPattern?.stressTypes) {
        d.stressPattern.stressTypes.forEach(type => {
          stressTypeCount[type] = (stressTypeCount[type] || 0) + 1;
        });
      }
    });

    const mostCommonStressType = Object.entries(stressTypeCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    const strategyCount: Record<string, number> = {};
    diagnoses.forEach(d => {
      if (d.reliefStrategy?.title) {
        strategyCount[d.reliefStrategy.title] = (strategyCount[d.reliefStrategy.title] || 0) + 1;
      }
    });

    const mostUsedStrategy = Object.entries(strategyCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    const sortedByDate = [...diagnoses].sort((a, b) => a.createdAt - b.createdAt);
    const firstDiagnosisDate = sortedByDate[0]?.createdAt || Date.now();
    const lastDiagnosisDate = sortedByDate[sortedByDate.length - 1]?.createdAt || Date.now();

    setStats({
      totalDiagnoses,
      totalUses,
      mostUsedStrategy,
      stressDistribution,
      mostCommonStressType,
      averageUsesPerDiagnosis: parseFloat(averageUsesPerDiagnosis),
      lastDiagnosisDate,
      firstDiagnosisDate
    });
  };

  const handleDeleteDiagnosis = async (id: string) => {
    await deleteDiagnosis(id);
    await loadProfileData();
    setShowDeleteConfirm(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStressSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'text-red-400';
      case 'moderate': return 'text-orange-400';
      case 'mild': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStressSeverityText = (severity: string) => {
    if (lang === 'zh') {
      switch (severity) {
        case 'severe': return '严重';
        case 'moderate': return '中度';
        case 'mild': return '轻度';
        default: return '未知';
      }
    } else {
      switch (severity) {
        case 'severe': return 'Severe';
        case 'moderate': return 'Moderate';
        case 'mild': return 'Mild';
        default: return 'Unknown';
      }
    }
  };

  const getStressTypeText = (type: string) => {
    const typeMap: Record<string, { zh: string; en: string }> = {
      'work': { zh: '工作压力', en: 'Work Stress' },
      'relationship': { zh: '人际关系', en: 'Relationship' },
      'health': { zh: '健康问题', en: 'Health' },
      'finance': { zh: '经济压力', en: 'Finance' },
      'family': { zh: '家庭压力', en: 'Family' },
      'career': { zh: '职业发展', en: 'Career' },
      'study': { zh: '学习压力', en: 'Study' },
      'other': { zh: '其他', en: 'Other' }
    };
    return typeMap[type]?.[lang] || type;
  };

  const getDaysBetween = (start: number, end: number) => {
    const diff = end - start;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getFlagEmoji = (countryCode: string): string => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const getScoreChange = (countryCode: string): number => {
    const current = leaderboard[countryCode]?.score || 0;
    const previous = prevLeaderboard[countryCode]?.score || 0;
    return current - previous;
  };

  const sortedCountries = Object.entries(leaderboard)
    .map(([code, data]) => ({ code, ...data }))
    .sort((a, b) => b.score - a.score);

  const handleNavigate = (view: DockView) => {
    setCurrentView(view);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleBack = () => {
    setCurrentView('main');
  };

  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(() => setCurrentView('main'), 300);
  };

  // Render main menu
  const renderMainMenu = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleNavigate('rewards')}
          className="relative bg-gradient-to-br from-amber-600/20 to-orange-600/20 hover:from-amber-600/40 hover:to-orange-600/40 rounded-2xl p-4 transition-all group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎁</div>
          <div className="text-white text-sm font-medium">
            {lang === 'zh' ? '奖励' : 'Rewards'}
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleNavigate('leaderboard')}
          className="relative bg-gradient-to-br from-blue-600/20 to-indigo-600/20 hover:from-blue-600/40 hover:to-indigo-600/40 rounded-2xl p-4 transition-all group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏆</div>
          <div className="text-white text-sm font-medium">
            {lang === 'zh' ? '排行' : 'Rank'}
          </div>
        </button>

        <button
          onClick={() => handleNavigate('profile')}
          className="relative bg-gradient-to-br from-green-600/20 to-emerald-600/20 hover:from-green-600/40 hover:to-emerald-600/40 rounded-2xl p-4 transition-all group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👤</div>
          <div className="text-white text-sm font-medium">
            {lang === 'zh' ? '资料' : 'Profile'}
          </div>
          {diagnoses.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {diagnoses.length > 9 ? '9+' : diagnoses.length}
            </span>
          )}
        </button>
      </div>

      {/* Quick Stats Preview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-700/30 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{hookModel.getTotalStressReleased()}</div>
          <div className="text-slate-400 text-xs">{lang === 'zh' ? '总释放' : 'Total'}</div>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">{hookModel.getStreakDays()}</div>
          <div className="text-slate-400 text-xs">{lang === 'zh' ? '连续天数' : 'Streak'}</div>
        </div>
      </div>
    </div>
  );

  // Render rewards view
  const renderRewardsView = () => (
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
                className="flex items-center gap-3 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl p-3"
              >
                <div className="text-3xl">{reward.icon}</div>
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
                className="aspect-square bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-xl flex items-center justify-center text-2xl"
                title={achievement}
              >
                {achievement}
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title={lang === 'zh' ? '📊 进度追踪' : '📊 Progress'}
        icon="📊"
        defaultOpen={true}
      >
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-300">{milestone.label}</span>
              <span className="text-green-400 font-bold">{Math.round(milestone.progress)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${milestone.progress}%` }}
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );

  // Render leaderboard view
  const renderLeaderboardView = () => (
    <div className="space-y-4">
      {metadata && (
        <div className="bg-slate-700/30 rounded-xl p-3 text-center">
          <div className="text-slate-400 text-xs mb-1">{lang === 'zh' ? '全球总计' : 'Global Total'}</div>
          <div className="text-xl font-bold text-amber-400">{metadata.totalGlobalClicks.toLocaleString()}</div>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {sortedCountries.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            {lang === 'zh' ? '加载中...' : 'Loading...'}
          </div>
        ) : (
          sortedCountries.slice(0, 10).map((c, index) => {
            const scoreChange = getScoreChange(c.code);
            return (
              <div key={c.code} className="flex items-center justify-between bg-slate-700/30 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <span className={`font-mono font-bold text-sm w-6 text-center ${index < 3 ? 'text-yellow-400' : 'text-slate-500'}`}>
                    #{index + 1}
                  </span>
                  <span className="text-xl">{getFlagEmoji(c.code)}</span>
                  <span className="font-bold text-slate-200 text-sm">{c.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {scoreChange > 0 && (
                    <span className="text-green-400 text-xs font-mono animate-pulse">+{scoreChange.toLocaleString()}</span>
                  )}
                  <span className="text-amber-500 font-mono font-bold text-sm">{c.score.toLocaleString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // Render profile view
  const renderProfileView = () => (
    <div className="space-y-4">
      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">{stats.totalDiagnoses}</div>
              <div className="text-slate-400 text-xs">{lang === 'zh' ? '诊断次数' : 'Diagnoses'}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">{stats.totalUses}</div>
              <div className="text-slate-400 text-xs">{lang === 'zh' ? '使用次数' : 'Uses'}</div>
            </div>
          </div>

          <CollapsibleSection
            title={lang === 'zh' ? '📜 诊断记录' : '📜 Records'}
            icon="📜"
            defaultOpen={true}
            badge={diagnoses.length > 0 ? diagnoses.length : undefined}
          >
            {diagnoses.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                {lang === 'zh' ? '暂无记录' : 'No records'}
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {diagnoses.slice(0, 5).map((diagnosis) => (
                  <div
                    key={diagnosis.id}
                    onClick={() => {
                      onSelectDiagnosis(diagnosis);
                      handleClose();
                    }}
                    className="flex items-center justify-between bg-slate-700/30 rounded-xl p-3 cursor-pointer hover:bg-slate-700/50 transition-colors"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{diagnosis.villainInfo.name}</p>
                      <p className="text-slate-400 text-xs">{formatDate(diagnosis.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-bold ${getStressSeverityColor(diagnosis.stressPattern?.severity || '')}`}>
                      {getStressSeverityText(diagnosis.stressPattern?.severity || '')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>
        </>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => {
            onNewDiagnosis();
            handleClose();
          }}
          className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-2 px-4 rounded-xl transition-all"
        >
          {lang === 'zh' ? '新诊断' : 'New'}
        </button>
        <button
          onClick={() => {
            onPrivacySettings();
            handleClose();
          }}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-xl transition-all"
        >
          {lang === 'zh' ? '隐私' : 'Privacy'}
        </button>
      </div>
    </div>
  );

  // Render header with back button
  const renderHeader = () => {
    const titles: Record<DockView, string> = {
      main: lang === 'zh' ? '控制中心' : 'Control Center',
      rewards: lang === 'zh' ? '🎁 奖励中心' : '🎁 Rewards',
      leaderboard: lang === 'zh' ? '🏆 排行榜' : '🏆 Leaderboard',
      profile: lang === 'zh' ? '👤 个人资料' : '👤 Profile'
    };

    return (
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {currentView !== 'main' && (
            <button
              onClick={handleBack}
              className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              ←
            </button>
          )}
          <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            {titles[currentView]}
          </h2>
        </div>
        <button
          onClick={handleClose}
          className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
        >
          ✕
        </button>
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      {!isExpanded ? (
        <SmoothTransition>
          <button
            onClick={() => setIsExpanded(true)}
            className="relative bg-gradient-to-r from-slate-800 to-slate-900 border border-amber-600/50 text-amber-500 rounded-full px-6 py-3 shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
          >
            <span className="text-xl">🎁</span>
            <span className="font-bold text-sm">
              {lang === 'zh' ? '控制中心' : 'Menu'}
            </span>
            {(unreadCount > 0 || diagnoses.length > 0) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadCount + diagnoses.length > 9 ? '9+' : unreadCount + diagnoses.length}
              </span>
            )}
          </button>
        </SmoothTransition>
      ) : (
        <SmoothTransition>
          <GlassCard className="w-80 max-h-[70vh] overflow-y-auto mb-4">
            {renderHeader()}
            
            {currentView === 'main' && renderMainMenu()}
            {currentView === 'rewards' && renderRewardsView()}
            {currentView === 'leaderboard' && renderLeaderboardView()}
            {currentView === 'profile' && renderProfileView()}
          </GlassCard>
        </SmoothTransition>
      )}
    </div>
  );
};

export default FloatingDock;
