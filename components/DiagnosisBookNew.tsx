import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Diagnosis, getElementIcon, getElementName } from '../utils/bazi';
import { Bazi as ProfessionalBazi, FiveElementsStrength } from '../utils/baziCalculator';
import GlassCard from './ui/GlassCard';
import CollapsibleSection from './ui/CollapsibleSection';
import SmoothTransition from './ui/SmoothTransition';

interface Props {
  diagnosis: Diagnosis;
  onStart: () => void;
  onRetry: () => void;
  onBackToProfile?: () => void;
  lang: Language;
}

const DiagnosisBook: React.FC<Props> = ({ diagnosis, onStart, onRetry, onBackToProfile, lang }) => {
  const t = TRANSLATIONS[lang];

  const isProfessionalBazi = diagnosis.bazi && 
    typeof diagnosis.bazi === 'object' &&
    'year' in diagnosis.bazi &&
    typeof diagnosis.bazi.year === 'object' &&
    'heavenlyStem' in diagnosis.bazi.year;

  if (!isProfessionalBazi) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">
            {lang === 'zh' ? '诊断数据格式不正确' : 'Diagnosis data format incorrect'}
          </p>
          <button
            onClick={onRetry}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            {lang === 'zh' ? '重新诊断' : 'Retry Diagnosis'}
          </button>
        </div>
      </div>
    );
  }

  const bazi = diagnosis.bazi as ProfessionalBazi;
  const strength = diagnosis.strength as FiveElementsStrength;

  if (!bazi.year || !bazi.month || !bazi.day || !bazi.hour) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">
            {lang === 'zh' ? '八字命盘数据不完整' : 'Bazi chart data incomplete'}
          </p>
          <button
            onClick={onRetry}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            {lang === 'zh' ? '重新诊断' : 'Retry Diagnosis'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        <SmoothTransition>
          <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-6 rounded-2xl text-center mb-6 shadow-2xl">
            <div className="text-5xl mb-2">📜</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{t.diagnosisTitle}</h1>
            <p className="text-amber-100 text-sm">{t.diagnosisSubtitle}</p>
          </div>
        </SmoothTransition>

        <SmoothTransition>
          <CollapsibleSection 
            title={lang === 'zh' ? '八字命盘' : 'Bazi Chart'}
            icon="🌟"
            defaultOpen={true}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <GlassCard hover={true} className="p-4 text-center">
                <p className="text-xs text-slate-500 mb-2">{lang === 'zh' ? '年柱' : 'Year'}</p>
                <p className="text-2xl font-bold text-slate-200 mb-1">
                  {bazi.year.heavenlyStem}{bazi.year.earthlyBranch}
                </p>
                <p className="text-sm text-slate-400">{bazi.year.elementName}</p>
              </GlassCard>
              <GlassCard hover={true} className="p-4 text-center">
                <p className="text-xs text-slate-500 mb-2">{lang === 'zh' ? '月柱' : 'Month'}</p>
                <p className="text-2xl font-bold text-slate-200 mb-1">
                  {bazi.month.heavenlyStem}{bazi.month.earthlyBranch}
                </p>
                <p className="text-sm text-slate-400">{bazi.month.elementName}</p>
              </GlassCard>
              <GlassCard hover={true} className="p-4 text-center border-amber-500/30">
                <p className="text-xs text-amber-500 mb-2">{lang === 'zh' ? '日柱（日主）' : 'Day (Master)'}</p>
                <p className="text-2xl font-bold text-amber-400 mb-1">
                  {bazi.day.heavenlyStem}{bazi.day.earthlyBranch}
                </p>
                <p className="text-sm text-amber-300">{bazi.day.elementName}</p>
              </GlassCard>
              <GlassCard hover={true} className="p-4 text-center">
                <p className="text-xs text-slate-500 mb-2">{lang === 'zh' ? '时柱' : 'Hour'}</p>
                <p className="text-2xl font-bold text-slate-200 mb-1">
                  {bazi.hour.heavenlyStem}{bazi.hour.earthlyBranch}
                </p>
                <p className="text-sm text-slate-400">{bazi.hour.elementName}</p>
              </GlassCard>
            </div>
          </CollapsibleSection>
        </SmoothTransition>

        <SmoothTransition>
          <CollapsibleSection 
            title={lang === 'zh' ? '五行强弱分析' : 'Five Elements Strength'}
            icon="⚖️"
            defaultOpen={true}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { element: 'wood', label: '木', color: '#22c55e' },
                  { element: 'fire', label: '火', color: '#ef4444' },
                  { element: 'earth', label: '土', color: '#f59e0b' },
                  { element: 'metal', label: '金', color: '#eab308' },
                  { element: 'water', label: '水', color: '#3b82f6' }
                ].map(item => (
                  <GlassCard key={item.element} hover={true} className="p-4 text-center">
                    <div className="text-3xl mb-2">{getElementIcon(item.element)}</div>
                    <p className="text-sm text-slate-400 mb-2">{item.label}</p>
                    <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${(strength[item.element] / 8) * 100}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{strength[item.element]}</p>
                  </GlassCard>
                ))}
              </div>
              <div className="flex justify-between text-sm bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-400">
                  {lang === 'zh' ? '最旺' : 'Strongest'}: 
                </span>
                <span className="text-amber-400 font-bold">
                  {getElementName(Object.entries(strength).sort((a, b) => b[1] - a[1])[0][0])}
                </span>
              </div>
            </div>
          </CollapsibleSection>
        </SmoothTransition>

        <SmoothTransition>
          <CollapsibleSection 
            title={lang === 'zh' ? '压力模式分析' : 'Stress Pattern Analysis'}
            icon="⚠️"
            defaultOpen={true}
          >
            {diagnosis.stressPattern && (
              <div className="space-y-4">
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{lang === 'zh' ? '压力程度' : 'Stress Level'}</span>
                    </h3>
                    <span className={`text-lg font-bold ${
                      diagnosis.stressPattern.severity === 'severe' ? 'text-red-400' :
                      diagnosis.stressPattern.severity === 'moderate' ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      {diagnosis.stressPattern.severity === 'severe' && (lang === 'zh' ? '严重' : 'Severe')}
                      {diagnosis.stressPattern.severity === 'moderate' && (lang === 'zh' ? '中度' : 'Moderate')}
                      {diagnosis.stressPattern.severity === 'mild' && (lang === 'zh' ? '轻度' : 'Mild')}
                    </span>
                  </div>
                </GlassCard>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassCard className="p-4">
                    <h4 className="text-amber-400 font-bold mb-3 text-sm">
                      {lang === 'zh' ? '触发因素' : 'Triggers'}
                    </h4>
                    <ul className="space-y-2">
                      {diagnosis.stressPattern.triggers.map((trigger, index) => (
                        <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          <span>{trigger}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                  <GlassCard className="p-4">
                    <h4 className="text-blue-400 font-bold mb-3 text-sm">
                      {lang === 'zh' ? '症状表现' : 'Symptoms'}
                    </h4>
                    <ul className="space-y-2">
                      {diagnosis.stressPattern.symptoms.map((symptom, index) => (
                        <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </div>
              </div>
            )}
          </CollapsibleSection>
        </SmoothTransition>

        <SmoothTransition>
          <CollapsibleSection 
            title={t.solution}
            icon="💚"
            defaultOpen={true}
          >
            {diagnosis.reliefStrategy && (
              <GlassCard className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-green-300 mb-2">
                    {diagnosis.reliefStrategy.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {diagnosis.reliefStrategy.description}
                  </p>
                </div>
                <div>
                  <h4 className="text-green-400 font-bold mb-3 text-sm">
                    {lang === 'zh' ? '行动建议' : 'Action Items'}
                  </h4>
                  <ul className="space-y-3">
                    {diagnosis.reliefStrategy.actions.map((action, index) => (
                      <li key={index} className="text-slate-300 text-sm flex items-start gap-3">
                        <span className="text-green-500 text-lg">{index + 1}.</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-400">
                    {lang === 'zh' ? '建议时长：' : 'Suggested Duration: '}
                  </span>
                  <span className="text-green-400 font-bold">
                    {diagnosis.reliefStrategy.duration}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-400">
                    {lang === 'zh' ? '预期效果：' : 'Expected Effectiveness: '}
                  </span>
                  <span className={`font-bold ${
                    diagnosis.reliefStrategy.effectiveness === 'high' ? 'text-green-400' :
                    diagnosis.reliefStrategy.effectiveness === 'medium' ? 'text-yellow-400' :
                    'text-orange-400'
                  }`}>
                    {diagnosis.reliefStrategy.effectiveness === 'high' && (lang === 'zh' ? '高' : 'High')}
                    {diagnosis.reliefStrategy.effectiveness === 'medium' && (lang === 'zh' ? '中' : 'Medium')}
                    {diagnosis.reliefStrategy.effectiveness === 'low' && (lang === 'zh' ? '低' : 'Low')}
                  </span>
                </div>
              </GlassCard>
            )}
          </CollapsibleSection>
        </SmoothTransition>

        <SmoothTransition>
          <GlassCard className="p-6">
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-mono mb-4">
              {diagnosis.psychologicalEffect}
            </p>
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👞</span>
                <div>
                  <p className="text-white font-bold text-sm">{diagnosis.villainInfo.name}</p>
                  <p className="text-slate-400 text-xs">{diagnosis.villainInfo.element}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">{lang === 'zh' ? '建议工具' : 'Recommended Tool'}</p>
                  <p className="text-white font-medium">{diagnosis.shoeInfo.name}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">{lang === 'zh' ? '最佳方向' : 'Best Direction'}</p>
                  <p className="text-amber-400 font-bold">{diagnosis.villainDirection}</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </SmoothTransition>

        <SmoothTransition>
          <div className="flex gap-3">
            {onBackToProfile && (
              <button
                onClick={onBackToProfile}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95"
              >
                ←
              </button>
            )}
            <button
              onClick={onStart}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95"
            >
              {t.startRitual}
            </button>
            <button
              onClick={onRetry}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95"
            >
              {t.retryDiagnosis}
            </button>
          </div>
        </SmoothTransition>
      </div>
    </div>
  );
};

export default DiagnosisBook;