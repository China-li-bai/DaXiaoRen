import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { SavedDiagnosis } from '../utils/diagnosisStorage';
import { getSavedDiagnoses, deleteDiagnosis, deleteAllDiagnoses } from '../utils/diagnosisStorage';
import { isEncryptionEnabled, deleteEncryptionKey } from '../utils/encryption';

interface Props {
  lang: Language;
  onNewDiagnosis: () => void;
  onSelectDiagnosis: (diagnosis: SavedDiagnosis) => void;
  onPrivacySettings: () => void;
}

const UserProfile: React.FC<Props> = ({ lang, onNewDiagnosis, onSelectDiagnosis, onPrivacySettings }) => {
  const t = TRANSLATIONS[lang];
  const [diagnoses, setDiagnoses] = useState<SavedDiagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  useEffect(() => {
    loadDiagnoses();
  }, []);

  const loadDiagnoses = async () => {
    setLoading(true);
    const saved = await getSavedDiagnoses();
    setDiagnoses(saved);
    setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-500 mb-2">
            {lang === 'zh' ? '个人资料' : 'My Profile'}
          </h1>
          <p className="text-slate-400 text-sm">
            {lang === 'zh' ? '管理您的诊断记录和隐私设置' : 'Manage your diagnosis records and privacy settings'}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <button
            onClick={onNewDiagnosis}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="text-3xl mb-2">📝</div>
            <div className="text-lg">
              {lang === 'zh' ? '创建新诊断' : 'New Diagnosis'}
            </div>
          </button>

          <button
            onClick={onPrivacySettings}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="text-3xl mb-2">🔒</div>
            <div className="text-lg">
              {lang === 'zh' ? '隐私设置' : 'Privacy Settings'}
            </div>
          </button>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📊</span>
              <span>{lang === 'zh' ? '诊断记录' : 'Diagnosis Records'}</span>
            </h2>
            <span className="text-slate-400 text-sm">
              {diagnoses.length} {lang === 'zh' ? '条记录' : 'records'}
            </span>
          </div>

          {diagnoses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-slate-400 mb-4">
                {lang === 'zh' ? '暂无诊断记录' : 'No diagnosis records yet'}
              </p>
              <button
                onClick={onNewDiagnosis}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
              >
                {lang === 'zh' ? '创建第一个诊断' : 'Create First Diagnosis'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {diagnoses.map((diagnosis) => (
                <div
                  key={diagnosis.id}
                  className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-all cursor-pointer"
                  onClick={() => onSelectDiagnosis(diagnosis)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-1">
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
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      🗑️
                    </button>
                  </div>

                  {diagnosis.stressPattern && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">
                        {lang === 'zh' ? '压力程度：' : 'Stress Level: '}
                      </span>
                      <span className={`font-bold ${getStressSeverityColor(diagnosis.stressPattern.severity)}`}>
                        {getStressSeverityText(diagnosis.stressPattern.severity)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>
                      {lang === 'zh' ? '使用次数：' : 'Uses: '} {diagnosis.useCount}
                    </span>
                    <span>
                      {lang === 'zh' ? '最后使用：' : 'Last used: '} {formatDate(diagnosis.lastUsed)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {diagnoses.length > 0 && (
            <button
              onClick={() => setShowClearAllConfirm(true)}
              className="mt-4 w-full bg-red-900/50 hover:bg-red-900/70 text-red-400 font-bold py-2 px-4 rounded-lg transition-all text-sm"
            >
              {lang === 'zh' ? '清除所有记录' : 'Clear All Records'}
            </button>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl p-4 sm:p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>ℹ️</span>
            <span>{lang === 'zh' ? '隐私信息' : 'Privacy Info'}</span>
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-slate-300">
                {lang === 'zh' ? '数据存储在本地设备' : 'Data stored locally on device'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={isEncryptionEnabled() ? 'text-green-400' : 'text-orange-400'}>
                {isEncryptionEnabled() ? '✓' : '⚠️'}
              </span>
              <span className="text-slate-300">
                {isEncryptionEnabled()
                  ? (lang === 'zh' ? '数据已加密保护' : 'Data is encrypted')
                  : (lang === 'zh' ? '数据未加密（建议启用）' : 'Data not encrypted (recommended)')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-slate-300">
                {lang === 'zh' ? '符合GDPR隐私法规' : 'GDPR compliant'}
              </span>
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">
                {lang === 'zh' ? '确认删除' : 'Confirm Delete'}
              </h3>
              <p className="text-slate-400 mb-6">
                {lang === 'zh' ? '确定要删除这条诊断记录吗？此操作无法撤销。' : 'Are you sure you want to delete this diagnosis record? This action cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={() => handleDeleteDiagnosis(showDeleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
                >
                  {lang === 'zh' ? '删除' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showClearAllConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">
                {lang === 'zh' ? '确认清除所有' : 'Confirm Clear All'}
              </h3>
              <p className="text-slate-400 mb-6">
                {lang === 'zh' ? '确定要清除所有诊断记录吗？此操作无法撤销。' : 'Are you sure you want to clear all diagnosis records? This action cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearAllConfirm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
                >
                  {lang === 'zh' ? '清除所有' : 'Clear All'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;