import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  lang: Language;
  onBack: () => void;
}

const PrivacyPolicy: React.FC<Props> = ({ lang, onBack }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            <span>←</span>
            <span>{lang === 'zh' ? '返回' : 'Back'}</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-500 mb-2">
            {lang === 'zh' ? '隐私政策' : 'Privacy Policy'}
          </h1>
          <p className="text-slate-400 text-sm">
            {lang === 'zh' ? '最后更新：2025年2月' : 'Last Updated: February 2025'}
          </p>
        </header>

        <div className="bg-slate-800 rounded-xl p-4 sm:p-6 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📋</span>
              <span>{lang === 'zh' ? '概述' : 'Overview'}</span>
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {lang === 'zh' 
                ? '本隐私政策说明了"打小人"（以下简称"我们"或"本应用"）如何收集、使用、存储和保护您的个人信息。我们致力于保护您的隐私，并确保您的个人数据得到妥善处理。'
                : 'This Privacy Policy explains how "Smash Villain" (hereinafter referred to as "we" or "the App") collects, uses, stores, and protects your personal information. We are committed to protecting your privacy and ensuring your personal data is handled properly.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🔍</span>
              <span>{lang === 'zh' ? '我们收集的信息' : 'Information We Collect'}</span>
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-white font-bold mb-2">
                  {lang === 'zh' ? '诊断信息' : 'Diagnosis Information'}
                </h3>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li>• {lang === 'zh' ? '出生日期和时间' : 'Date and time of birth'}</li>
                  <li>• {lang === 'zh' ? '压力类型和来源' : 'Stress types and sources'}</li>
                  <li>• {lang === 'zh' ? '压力症状描述' : 'Stress symptom descriptions'}</li>
                </ul>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-white font-bold mb-2">
                  {lang === 'zh' ? '使用数据' : 'Usage Data'}
                </h3>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li>• {lang === 'zh' ? '诊断记录和使用次数' : 'Diagnosis records and usage count'}</li>
                  <li>• {lang === 'zh' ? '最后使用时间' : 'Last usage time'}</li>
                  <li>• {lang === 'zh' ? '应用设置和偏好' : 'App settings and preferences'}</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🎯</span>
              <span>{lang === 'zh' ? '信息使用方式' : 'How We Use Your Information'}</span>
            </h2>
            <ul className="text-slate-300 space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-amber-500 mt-1">•</span>
                <span>
                  <strong className="text-white">{lang === 'zh' ? '提供诊断服务' : 'Provide Diagnosis Services'}</strong>
                  {lang === 'zh' ? '：根据您提供的信息生成个性化的压力分析和缓解策略。' : ': Generate personalized stress analysis and relief strategies based on the information you provide.'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 mt-1">•</span>
                <span>
                  <strong className="text-white">{lang === 'zh' ? '改善用户体验' : 'Improve User Experience'}</strong>
                  {lang === 'zh' ? '：保存您的诊断记录，方便您随时查看历史数据。' : ': Save your diagnosis records for easy access to historical data.'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 mt-1">•</span>
                <span>
                  <strong className="text-white">{lang === 'zh' ? '数据分析' : 'Data Analysis'}</strong>
                  {lang === 'zh' ? '：分析使用模式以改进我们的服务（匿名化处理）。' : ': Analyze usage patterns to improve our services (anonymized).'}
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>💾</span>
              <span>{lang === 'zh' ? '数据存储和安全' : 'Data Storage and Security'}</span>
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-white font-bold mb-2">
                  {lang === 'zh' ? '本地存储' : 'Local Storage'}
                </h3>
                <p className="text-slate-300 text-sm">
                  {lang === 'zh' 
                    ? '所有数据都存储在您的设备本地，不会上传到任何服务器。这意味着您的数据始终在您的控制之下。'
                    : 'All data is stored locally on your device and never uploaded to any server. This means your data is always under your control.'}
                </p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-white font-bold mb-2">
                  {lang === 'zh' ? '数据加密' : 'Data Encryption'}
                </h3>
                <p className="text-slate-300 text-sm">
                  {lang === 'zh' 
                    ? '我们提供AES-256-GCM加密选项，您可以选择启用加密以获得额外的安全保护。加密密钥也存储在您的设备本地。'
                    : 'We offer AES-256-GCM encryption, which you can enable for additional security. Encryption keys are also stored locally on your device.'}
                </p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-white font-bold mb-2">
                  {lang === 'zh' ? '数据保留' : 'Data Retention'}
                </h3>
                <p className="text-slate-300 text-sm">
                  {lang === 'zh' 
                    ? '数据将一直保留在您的设备上，直到您主动删除。您可以通过隐私设置随时删除所有数据。'
                    : 'Data will remain on your device until you actively delete it. You can delete all data at any time through privacy settings.'}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>⚖️</span>
              <span>{lang === 'zh' ? '您的权利（GDPR）' : 'Your Rights (GDPR)'}
              </span>
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              {lang === 'zh' 
                ? '根据欧盟通用数据保护条例（GDPR），您享有以下权利：'
                : 'Under the General Data Protection Regulation (GDPR), you have the following rights:'}
            </p>
            <ul className="text-slate-300 space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <div>
                  <strong className="text-white">{lang === 'zh' ? '访问权' : 'Right to Access'}</strong>
                  <p className="text-sm">{lang === 'zh' ? '您可以随时查看我们存储的所有关于您的数据。' : 'You can view all data we store about you at any time.'}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <div>
                  <strong className="text-white">{lang === 'zh' ? '更正权' : 'Right to Rectification'}</strong>
                  <p className="text-sm">{lang === 'zh' ? '您可以要求更正不准确或不完整的数据。' : 'You can request correction of inaccurate or incomplete data.'}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <div>
                  <strong className="text-white">{lang === 'zh' ? '删除权' : 'Right to Erasure'}</strong>
                  <p className="text-sm">{lang === 'zh' ? '您可以要求删除您的所有数据。' : 'You can request deletion of all your data.'}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <div>
                  <strong className="text-white">{lang === 'zh' ? '数据可携带权' : 'Right to Data Portability'}</strong>
                  <p className="text-sm">{lang === 'zh' ? '您可以要求以结构化格式获取您的数据。' : 'You can request your data in a structured format.'}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <div>
                  <strong className="text-white">{lang === 'zh' ? '反对权' : 'Right to Object'}</strong>
                  <p className="text-sm">{lang === 'zh' ? '您可以反对某些数据处理活动。' : 'You can object to certain data processing activities.'}</p>
                </div>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>👶</span>
              <span>{lang === 'zh' ? '儿童隐私' : 'Children\'s Privacy'}</span>
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {lang === 'zh' 
                ? '本应用不针对13岁以下的儿童。如果我们发现无意中收集了13岁以下儿童的个人信息，我们将立即删除该信息。'
                : 'This App is not intended for children under 13 years of age. If we discover that we have inadvertently collected personal information from a child under 13, we will immediately delete that information.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📞</span>
              <span>{lang === 'zh' ? '联系我们' : 'Contact Us'}</span>
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {lang === 'zh' 
                ? '如果您对本隐私政策有任何疑问或 concerns，或者想行使您的GDPR权利，请通过以下方式联系我们：'
                : 'If you have any questions or concerns about this Privacy Policy, or wish to exercise your GDPR rights, please contact us at:'}
            </p>
            <div className="bg-slate-700 rounded-lg p-4 mt-4">
              <p className="text-white font-medium">Email: privacy@smashvillain.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🔄</span>
              <span>{lang === 'zh' ? '政策更新' : 'Policy Updates'}</span>
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {lang === 'zh' 
                ? '我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，并在顶部注明更新日期。我们建议您定期查看本页面以了解最新信息。'
                : 'We may update this Privacy Policy from time to time. The updated policy will be posted on this page with the revision date noted at the top. We recommend that you review this page regularly for the latest information.'}
            </p>
          </section>

          <section className="bg-slate-700 rounded-lg p-4">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span>🌍</span>
              <span>{lang === 'zh' ? '国际数据传输' : 'International Data Transfers'}</span>
            </h2>
            <p className="text-slate-300 text-sm">
              {lang === 'zh' 
                ? '由于所有数据都存储在您的设备本地，不涉及任何国际数据传输。这确保了您的数据始终符合GDPR和其他国际隐私法规的要求。'
                : 'Since all data is stored locally on your device, no international data transfers are involved. This ensures your data always complies with GDPR and other international privacy regulations.'}
            </p>
          </section>
        </div>

        <footer className="mt-8 text-center text-slate-500 text-sm">
          <p>
            {lang === 'zh' ? '© 2025 打小人. 保留所有权利。' : '© 2025 Smash Villain. All rights reserved.'}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;