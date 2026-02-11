import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  isEncryptionEnabled, 
  setEncryptionEnabled, 
  initializeEncryption, 
  deleteEncryptionKey,
  migrateToEncryption 
} from '../utils/encryption';
import { getSavedDiagnoses, deleteAllDiagnoses } from '../utils/diagnosisStorage';

interface Props {
  lang: Language;
  onBack: () => void;
  onPrivacyPolicy: () => void;
}

const PrivacySettings: React.FC<Props> = ({ lang, onBack, onPrivacyPolicy }) => {
  const t = TRANSLATIONS[lang];
  const [encryptionEnabled, setEncryptionEnabledState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEncryptionInfo, setShowEncryptionInfo] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    setEncryptionEnabledState(isEncryptionEnabled());
  };

  const handleToggleEncryption = async () => {
    setLoading(true);
    
    if (encryptionEnabled) {
      await disableEncryption();
    } else {
      await enableEncryption();
    }
    
    loadSettings();
    setLoading(false);
  };

  const enableEncryption = async () => {
    await initializeEncryption();
    setEncryptionEnabled(true);
    
    const diagnoses = await getSavedDiagnoses();
    if (diagnoses.length > 0) {
      await migrateToEncryption('savedDiagnoses');
    }
  };

  const disableEncryption = async () => {
    await deleteEncryptionKey();
    setEncryptionEnabled(false);
  };

  const handleDeleteAllData = async () => {
    await deleteAllDiagnoses();
    await deleteEncryptionKey();
    localStorage.clear();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            <span>←</span>
            <span>{lang === 'zh' ? '返回' : 'Back'}</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-500 mb-2">
            {lang === 'zh' ? '隐私设置' : 'Privacy Settings'}
          </h1>
          <p className="text-slate-400 text-sm">
            {lang === 'zh' ? '控制您的数据隐私和安全设置' : 'Control your data privacy and security settings'}
          </p>
        </header>

        <div className="space-y-4">
          <div className="bg-slate-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔐</span>
                  <h2 className="text-xl font-bold text-white">
                    {lang === 'zh' ? '数据加密' : 'Data Encryption'}
                  </h2>
                </div>
                <p className="text-slate-400 text-sm mb-3">
                  {lang === 'zh' 
                    ? '使用AES-256加密保护您的诊断数据，确保只有您可以访问。'
                    : 'Protect your diagnosis data with AES-256 encryption, ensuring only you can access it.'}
                </p>
              </div>
              <button
                onClick={() => setShowEncryptionInfo(!showEncryptionInfo)}
                className="text-slate-400 hover:text-white p-2"
              >
                {showEncryptionInfo ? '▼' : 'ℹ️'}
              </button>
            </div>

            {showEncryptionInfo && (
              <div className="bg-slate-700 rounded-lg p-4 mb-4 text-sm">
                <h3 className="text-white font-bold mb-2">
                  {lang === 'zh' ? '加密说明' : 'Encryption Details'}
                </h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• AES-256-GCM {lang === 'zh' ? '加密算法' : 'encryption algorithm'}</li>
                  <li>• {lang === 'zh' ? '端到端加密' : 'End-to-end encryption'}</li>
                  <li>• {lang === 'zh' ? '密钥存储在本地' : 'Keys stored locally'}</li>
                  <li>• {lang === 'zh' ? '符合GDPR要求' : 'GDPR compliant'}</li>
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-2xl ${encryptionEnabled ? 'text-green-400' : 'text-orange-400'}`}>
                  {encryptionEnabled ? '✓' : '⚠️'}
                </span>
                <span className="text-white font-medium">
                  {encryptionEnabled
                    ? (lang === 'zh' ? '已启用' : 'Enabled')
                    : (lang === 'zh' ? '未启用' : 'Disabled')}
                </span>
              </div>
              <button
                onClick={handleToggleEncryption}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  loading
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : encryptionEnabled
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {loading
                  ? (lang === 'zh' ? '处理中...' : 'Processing...')
                  : encryptionEnabled
                  ? (lang === 'zh' ? '禁用' : 'Disable')
                  : (lang === 'zh' ? '启用' : 'Enable')}
              </button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📄</span>
              <h2 className="text-xl font-bold text-white">
                {lang === 'zh' ? '隐私政策' : 'Privacy Policy'}
              </h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              {lang === 'zh' 
                ? '了解我们如何收集、使用和保护您的个人数据。'
                : 'Learn how we collect, use, and protect your personal data.'}
            </p>
            <button
              onClick={onPrivacyPolicy}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
            >
              {lang === 'zh' ? '查看隐私政策' : 'View Privacy Policy'}
            </button>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🗑️</span>
              <h2 className="text-xl font-bold text-white">
                {lang === 'zh' ? '删除所有数据' : 'Delete All Data'}
              </h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              {lang === 'zh' 
                ? '永久删除所有诊断记录和设置。此操作无法撤销。'
                : 'Permanently delete all diagnosis records and settings. This action cannot be undone.'}
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
            >
              {lang === 'zh' ? '删除所有数据' : 'Delete All Data'}
            </button>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🛡️</span>
              <h2 className="text-xl font-bold text-white">
                {lang === 'zh' ? '隐私保护承诺' : 'Privacy Commitment'}
              </h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <div>
                  <p className="text-white font-medium">
                    {lang === 'zh' ? '本地存储' : 'Local Storage'}
                  </p>
                  <p className="text-slate-400">
                    {lang === 'zh' 
                      ? '所有数据存储在您的设备上，不会上传到服务器。'
                      : 'All data is stored on your device, never uploaded to servers.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <div>
                  <p className="text-white font-medium">
                    {lang === 'zh' ? '数据控制' : 'Data Control'}
                  </p>
                  <p className="text-slate-400">
                    {lang === 'zh' 
                      ? '您可以随时查看、修改或删除您的数据。'
                      : 'You can view, modify, or delete your data at any time.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <div>
                  <p className="text-white font-medium">
                    {lang === 'zh' ? '透明度' : 'Transparency'}
                  </p>
                  <p className="text-slate-400">
                    {lang === 'zh' 
                      ? '我们清楚地说明数据如何被收集和使用。'
                      : 'We clearly explain how data is collected and used.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <div>
                  <p className="text-white font-medium">
                    {lang === 'zh' ? '合规性' : 'Compliance'}
                  </p>
                  <p className="text-slate-400">
                    {lang === 'zh' 
                      ? '符合GDPR和其他国际隐私法规。'
                      : 'Compliant with GDPR and other international privacy laws.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">
                {lang === 'zh' ? '确认删除所有数据' : 'Confirm Delete All Data'}
              </h3>
              <p className="text-slate-400 mb-6">
                {lang === 'zh' 
                  ? '确定要删除所有数据吗？这将包括：\n• 所有诊断记录\n• 隐私设置\n• 加密密钥\n\n此操作无法撤销。'
                  : 'Are you sure you want to delete all data? This will include:\n• All diagnosis records\n• Privacy settings\n• Encryption keys\n\nThis action cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteAllData}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
                >
                  {lang === 'zh' ? '确认删除' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacySettings;