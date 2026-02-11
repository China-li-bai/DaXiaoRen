import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { SavedDiagnosis } from '../utils/diagnosisStorage';
import { getSavedDiagnoses, deleteDiagnosis, deleteAllDiagnoses } from '../utils/diagnosisStorage';
import { isEncryptionEnabled, deleteEncryptionKey } from '../utils/encryption';
import StatCard from './ui/StatCard';
import GlassCard from './ui/GlassCard';
import SmoothTransition from './ui/SmoothTransition';
import CollapsibleSection from './ui/CollapsibleSection';

interface Props {
  lang: Language;
  onNewDiagnosis: () => void;
  onSelectDiagnosis: (diagnosis: SavedDiagnosis) => void;
  onPrivacySettings: () => void;
}

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

const UserProfile: React.FC<Props> = ({ lang, onNewDiagnosis, onSelectDiagnosis, onPrivacySettings }) => {
  const t = TRANSLATIONS[lang];
  const [diagnoses, setDiagnoses] = useState<SavedDiagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    loadDiagnoses();
  }, []);

  const loadDiagnoses = async () => {
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
    await loadDiagnoses();
    setShowDeleteConfirm(null);
  };

  const handleClearAll = async () => {
    await deleteAllDiagnoses();
    await loadDiagnoses();
    setShowClearAllConfirm(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <SmoothTransition>
          <header className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
              {lang === 'zh' ? '个人资料' : 'My Profile'}
            </h1>
            <p className="text-slate-400 text-sm">
              {lang === 'zh' ? '管理您的诊断记录和隐私设置' : 'Manage your diagnosis records and privacy settings'}
            </p>
          </header>
        </SmoothTransition>

        <SmoothTransition>
          <div className="grid gap-4 sm:grid-cols-2">
            <GlassCard hover={true} onClick={onNewDiagnosis} className="p-6">
              <div className="text-4xl mb-3">📝</div>
              <div className="text-xl font-bold text-white mb-1">
                {lang === 'zh' ? '创建新诊断' : 'New Diagnosis'}
              </div>
              <div className="text-slate-400 text-sm">
                {lang === 'zh' ? '开始新的压力分析' : 'Start a new stress analysis'}
              </div>
            </GlassCard>

            <GlassCard hover={true} onClick={onPrivacySettings} className="p-6">
              <div className="text-4xl mb-3">🔒</div>
              <div className="text-xl font-bold text-white mb-1">
                {lang === 'zh' ? '隐私设置' : 'Privacy Settings'}
              </div>
              <div className="text-slate-400 text-sm">
                {lang === 'zh' ? '管理您的隐私偏好' : 'Manage your privacy preferences'}
              </div>
            </GlassCard>
          </div>
        </SmoothTransition>

        {stats && (
          <SmoothTransition>
            <CollapsibleSection 
              title={lang === 'zh' ? '统计仪表板' : 'Statistics Dashboard'}
              icon="📊"
              defaultOpen={true}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title={lang === 'zh' ? '总诊断次数' : 'Total Diagnoses'}
                  value={stats.totalDiagnoses}
                  icon="📋"
                  color="amber"
                />
                <StatCard
                  title={lang === 'zh' ? '总使用次数' : 'Total Uses'}
                  value={stats.totalUses}
                  icon="🔄"
                  color="blue"
                />
                <StatCard
                  title={lang === 'zh' ? '平均使用次数' : 'Avg Uses/Diagnosis'}
                  value={stats.averageUsesPerDiagnosis}
                  icon="📈"
                  color="green"
                />
                <StatCard
                  title={lang === 'zh' ? '最常用策略' : 'Most Used Strategy'}
                  value={stats.mostUsedStrategy.length > 15 ? stats.mostUsedStrategy.substring(0, 15) + '...' : stats.mostUsedStrategy}
                  icon="🎯"
                  color="purple"
                />
                <StatCard
                  title={lang === 'zh' ? '主要压力类型' : 'Main Stress Type'}
                  value={getStressTypeText(stats.mostCommonStressType)}
                  icon="😰"
                  color="red"
                />
                <StatCard
                  title={lang === 'zh' ? '使用天数' : 'Days Active'}
                  value={getDaysBetween(stats.firstDiagnosisDate, stats.lastDiagnosisDate) + 1}
                  icon="📅"
                  color="amber"
                />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <GlassCard className="p-4">
                  <h3 className="text-slate-400 text-sm mb-3">
                    {lang === 'zh' ? '压力分布' : 'Stress Distribution'}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-red-400">{lang === 'zh' ? '严重' : 'Severe'}</span>
                        <span className="text-white">{stats.stressDistribution.severe}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                          style={{ width: `${(stats.stressDistribution.severe / stats.totalDiagnoses) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-orange-400">{lang === 'zh' ? '中度' : 'Moderate'}</span>
                        <span className="text-white">{stats.stressDistribution.moderate}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                          style={{ width: `${(stats.stressDistribution.moderate / stats.totalDiagnoses) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-green-400">{lang === 'zh' ? '轻度' : 'Mild'}</span>
                        <span className="text-white">{stats.stressDistribution.mild}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                          style={{ width: `${(stats.stressDistribution.mild / stats.totalDiagnoses) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-4">
                  <h3 className="text-slate-400 text-sm mb-3">
                    {lang === 'zh' ? '使用频率' : 'Usage Frequency'}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{lang === 'zh' ? '本周' : 'This Week'}</span>
                      <span className="text-amber-400 font-bold">
                        {diagnoses.filter(d => Date.now() - d.lastUsed < 7 * 24 * 60 * 60 * 1000).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{lang === 'zh' ? '本月' : 'This Month'}</span>
                      <span className="text-amber-400 font-bold">
                        {diagnoses.filter(d => Date.now() - d.lastUsed < 30 * 24 * 60 * 60 * 1000).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{lang === 'zh' ? '总计' : 'Total'}</span>
                      <span className="text-amber-400 font-bold">{stats.totalUses}</span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-4">
                  <h3 className="text-slate-400 text-sm mb-3">
                    {lang === 'zh' ? '隐私状态' : 'Privacy Status'}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">✓</span>
                      <span className="text-slate-300">
                        {lang === 'zh' ? '本地存储' : 'Local Storage'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={isEncryptionEnabled() ? 'text-green-400' : 'text-orange-400'}>
                        {isEncryptionEnabled() ? '✓' : '⚠️'}
                      </span>
                      <span className="text-slate-300">
                        {isEncryptionEnabled()
                          ? (lang === 'zh' ? '已加密' : 'Encrypted')
                          : (lang === 'zh' ? '未加密' : 'Not Encrypted')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">✓</span>
                      <span className="text-slate-300">
                        {lang === 'zh' ? 'GDPR合规' : 'GDPR Compliant'}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </CollapsibleSection>
          </SmoothTransition>
        )}

        <SmoothTransition>
          <CollapsibleSection 
            title={lang === 'zh' ? '诊断记录' : 'Diagnosis Records'}
            icon="📜"
            defaultOpen={true}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">
                {diagnoses.length} {lang === 'zh' ? '条记录' : 'records'}
              </span>
            </div>

            {diagnoses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-slate-400 mb-4">
                  {lang === 'zh' ? '暂无诊断记录' : 'No diagnosis records yet'}
                </p>
                <button
                  onClick={onNewDiagnosis}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  {lang === 'zh' ? '创建第一个诊断' : 'Create First Diagnosis'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {diagnoses.map((diagnosis, index) => (
                  <GlassCard 
                    key={diagnosis.id} 
                    hover={true} 
                    onClick={() => onSelectDiagnosis(diagnosis)}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1">
                          {diagnosis.villainInfo.name}
                        </h3>
                        <p className="text-slate-400 text-sm mb-2">
                          {formatDate(diagnosis.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(diagnosis.id);
                        }}
                        className="text-red-400 hover:text-red-300 p-2 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>

                    {diagnosis.stressPattern && (
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <span className="text-slate-400">
                          {lang === 'zh' ? '压力程度：' : 'Stress Level: '}
                        </span>
                        <span className={`font-bold ${getStressSeverityColor(diagnosis.stressPattern.severity)}`}>
                          {getStressSeverityText(diagnosis.stressPattern.severity)}
                        </span>
                      </div>
                    )}

                    {diagnosis.reliefStrategy && (
                      <div className="text-sm text-slate-300 mb-2">
                        <span className="text-slate-400">{lang === 'zh' ? '缓解策略：' : 'Strategy: '}</span>
                        {diagnosis.reliefStrategy.title}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>
                        {lang === 'zh' ? '使用次数：' : 'Uses: '} {diagnosis.useCount}
                      </span>
                      <span>
                        {lang === 'zh' ? '最后使用：' : 'Last used: '} {formatDate(diagnosis.lastUsed)}
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {diagnoses.length > 0 && (
              <button
                onClick={() => setShowClearAllConfirm(true)}
                className="mt-4 w-full bg-red-900/50 hover:bg-red-900/70 text-red-400 font-bold py-3 px-4 rounded-xl transition-all text-sm"
              >
                {lang === 'zh' ? '清除所有记录' : 'Clear All Records'}
              </button>
            )}
          </CollapsibleSection>
        </SmoothTransition>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <GlassCard className="p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">
                {lang === 'zh' ? '确认删除' : 'Confirm Delete'}
              </h3>
              <p className="text-slate-400 mb-6">
                {lang === 'zh' ? '确定要删除这条诊断记录吗？此操作无法撤销。' : 'Are you sure you want to delete this diagnosis record? This action cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-all"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={() => handleDeleteDiagnosis(showDeleteConfirm)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl transition-all"
                >
                  {lang === 'zh' ? '删除' : 'Delete'}
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        {showClearAllConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <GlassCard className="p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">
                {lang === 'zh' ? '确认清除所有' : 'Confirm Clear All'}
              </h3>
              <p className="text-slate-400 mb-6">
                {lang === 'zh' ? '确定要清除所有诊断记录吗？此操作无法撤销。' : 'Are you sure you want to clear all diagnosis records? This action cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearAllConfirm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-all"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl transition-all"
                >
                  {lang === 'zh' ? '清除所有' : 'Clear All'}
                </button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
