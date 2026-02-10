import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Diagnosis, getElementIcon, getElementName } from '../utils/bazi';
import { Bazi as ProfessionalBazi, FiveElementsStrength } from '../utils/baziCalculator';

interface Props {
  diagnosis: Diagnosis;
  onStart: () => void;
  onRetry: () => void;
  lang: Language;
}

const DiagnosisBook: React.FC<Props> = ({ diagnosis, onStart, onRetry, lang }) => {
  const t = TRANSLATIONS[lang];
  
  console.log('DiagnosisBook - diagnosis:', diagnosis);
  console.log('DiagnosisBook - diagnosis.bazi:', diagnosis.bazi);

  const isProfessionalBazi = diagnosis.bazi && 
    typeof diagnosis.bazi === 'object' &&
    'year' in diagnosis.bazi &&
    typeof diagnosis.bazi.year === 'object' &&
    'heavenlyStem' in diagnosis.bazi.year;

  console.log('DiagnosisBook - isProfessionalBazi:', isProfessionalBazi);

  if (!isProfessionalBazi) {
    console.error('DiagnosisBook - bazi is not professional format');
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
    console.error('DiagnosisBook - bazi pillars incomplete', {
      year: bazi.year,
      month: bazi.month,
      day: bazi.day,
      hour: bazi.hour
    });
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
      <div className="max-w-2xl w-full bg-slate-800 border-2 border-amber-600 rounded-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-4 text-center">
          <div className="text-4xl mb-2">📜</div>
          <h1 className="text-2xl font-bold text-white mb-1">{t.diagnosisTitle}</h1>
          <p className="text-amber-100 text-sm">{t.diagnosisSubtitle}</p>
        </div>

        <div className="p-6 space-y-6">
          <section className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h2 className="text-amber-500 font-bold mb-3 text-lg flex items-center gap-2">
              <span>🌟</span>
              <span>{lang === 'zh' ? '八字命盘' : 'Bazi Chart'}</span>
            </h2>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
                <p className="text-xs text-slate-500 mb-1">{lang === 'zh' ? '年柱' : 'Year'}</p>
                <p className="text-2xl font-bold text-slate-200 mb-1">
                  {bazi.year.heavenlyStem}{bazi.year.earthlyBranch}
                </p>
                <p className="text-sm text-slate-400">{bazi.year.elementName}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
                <p className="text-xs text-slate-500 mb-1">{lang === 'zh' ? '月柱' : 'Month'}</p>
                <p className="text-2xl font-bold text-slate-200 mb-1">
                  {bazi.month.heavenlyStem}{bazi.month.earthlyBranch}
                </p>
                <p className="text-sm text-slate-400">{bazi.month.elementName}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 text-center border border-amber-600">
                <p className="text-xs text-amber-500 mb-1">{lang === 'zh' ? '日柱（日主）' : 'Day (Master)'}</p>
                <p className="text-2xl font-bold text-amber-400 mb-1">
                  {bazi.day.heavenlyStem}{bazi.day.earthlyBranch}
                </p>
                <p className="text-sm text-amber-300">{bazi.day.elementName}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
                <p className="text-xs text-slate-500 mb-1">{lang === 'zh' ? '时柱' : 'Hour'}</p>
                <p className="text-2xl font-bold text-slate-200 mb-1">
                  {bazi.hour.heavenlyStem}{bazi.hour.earthlyBranch}
                </p>
                <p className="text-sm text-slate-400">{bazi.hour.elementName}</p>
              </div>
            </div>
          </section>

          <section className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h2 className="text-purple-500 font-bold mb-3 text-lg flex items-center gap-2">
              <span>⚖️</span>
              <span>{lang === 'zh' ? '五行强弱分析' : 'Five Elements Strength'}</span>
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-2">
                {[
                  { element: 'wood', label: '木', color: '#22c55e' },
                  { element: 'fire', label: '火', color: '#ef4444' },
                  { element: 'earth', label: '土', color: '#f59e0b' },
                  { element: 'metal', label: '金', color: '#eab308' },
                  { element: 'water', label: '水', color: '#3b82f6' }
                ].map(item => (
                  <div key={item.element} className="text-center">
                    <div className="text-2xl mb-1">{getElementIcon(item.element)}</div>
                    <p className="text-sm text-slate-400 mb-1">{item.label}</p>
                    <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${(strength[item.element] / 8) * 100}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{strength[item.element]}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">
                  {lang === 'zh' ? '最旺' : 'Strongest'}: 
                  <span className="text-green-400 font-bold ml-1">{getElementName(strength.strongest)}</span>
                </span>
                <span className="text-slate-400">
                  {lang === 'zh' ? '最弱' : 'Weakest'}: 
                  <span className="text-red-400 font-bold ml-1">{getElementName(strength.weakest)}</span>
                </span>
              </div>
            </div>
          </section>

          {diagnosis.stressPattern && (
            <section className="bg-red-900/30 rounded-lg p-4 border border-red-600">
              <h2 className="text-red-500 font-bold mb-3 text-lg flex items-center gap-2">
                <span>⚠️</span>
                <span>{lang === 'zh' ? '压力模式分析' : 'Stress Pattern Analysis'}</span>
              </h2>
              <div className="space-y-3">
                <div className="bg-red-900/50 rounded p-3">
                  <p className="text-red-400 font-bold text-center text-lg mb-2">
                    {diagnosis.stressPattern.severity === 'severe' && (lang === 'zh' ? '严重压力' : 'Severe Stress')}
                    {diagnosis.stressPattern.severity === 'moderate' && (lang === 'zh' ? '中度压力' : 'Moderate Stress')}
                    {diagnosis.stressPattern.severity === 'mild' && (lang === 'zh' ? '轻度压力' : 'Mild Stress')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-2">
                    {lang === 'zh' ? '触发因素' : 'Triggers'}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {diagnosis.stressPattern.triggers.map((trigger, index) => (
                      <span
                        key={index}
                        className="bg-red-800 text-red-300 text-xs px-2 py-1 rounded"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-2">
                    {lang === 'zh' ? '症状表现' : 'Symptoms'}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {diagnosis.stressPattern.symptoms.map((symptom, index) => (
                      <span
                        key={index}
                        className="bg-red-800/50 text-red-400 text-xs px-2 py-1 rounded"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h2 className="text-purple-500 font-bold mb-3 text-lg flex items-center gap-2">
              <span>🧭</span>
              <span>{t.villainDirection}</span>
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-4xl">🧭</div>
              <div>
                <p className="text-xl font-bold text-slate-200">{diagnosis.villainDirection}</p>
                <p className="text-sm text-slate-400">
                  {getElementIcon(diagnosis.villainInfo.element)}位
                </p>
              </div>
            </div>
          </section>

          <section className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h2 className="text-orange-500 font-bold mb-3 text-lg flex items-center gap-2">
              <span>👻</span>
              <span>{t.villainType}</span>
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getElementIcon(diagnosis.villainInfo.element)}</span>
                <div>
                  <p className="text-xl font-bold text-slate-200">{diagnosis.villainInfo.name}</p>
                  <p className="text-sm text-slate-400">
                    {getElementName(diagnosis.villainInfo.element)}型
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {diagnosis.villainInfo.characteristics.map((char, index) => (
                  <span
                    key={index}
                    className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded"
                  >
                    {char}
                  </span>
                ))}
              </div>
              {(diagnosis.villainInfo as any).reason && (
                <p className="text-sm text-slate-400 italic mt-2">
                  {(diagnosis.villainInfo as any).reason}
                </p>
              )}
            </div>
          </section>

          {diagnosis.reliefStrategy && (
            <section className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg p-4 border-2 border-green-500">
              <h2 className="text-green-400 font-bold mb-3 text-lg flex items-center gap-2">
                <span>�</span>
                <span>{t.solution}</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-green-300 mb-2">
                    {diagnosis.reliefStrategy.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {diagnosis.reliefStrategy.description}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-2">
                    {lang === 'zh' ? '推荐行动' : 'Recommended Actions'}:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {diagnosis.reliefStrategy.actions.map((action, index) => (
                      <div
                        key={index}
                        className="bg-green-800/30 text-green-300 text-sm px-3 py-2 rounded border border-green-700"
                      >
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-green-900/20 rounded p-3 border border-green-600">
                  <span className="text-3xl">⏱️</span>
                  <div>
                    <p className="text-lg font-bold text-green-400">
                      {lang === 'zh' ? '建议时长' : 'Suggested Duration'}:
                    </p>
                    <p className="text-2xl font-bold text-green-300">
                      {diagnosis.reliefStrategy.duration}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">
                    {lang === 'zh' ? '有效性' : 'Effectiveness'}:
                  </span>
                  <span className={`text-sm font-bold px-2 py-1 rounded ${
                    diagnosis.reliefStrategy.effectiveness === 'high' ? 'bg-green-600 text-white' :
                    diagnosis.reliefStrategy.effectiveness === 'medium' ? 'bg-yellow-600 text-white' :
                    'bg-slate-600 text-white'
                  }`}>
                    {diagnosis.reliefStrategy.effectiveness === 'high' && (lang === 'zh' ? '高' : 'High')}
                    {diagnosis.reliefStrategy.effectiveness === 'medium' && (lang === 'zh' ? '中' : 'Medium')}
                    {diagnosis.reliefStrategy.effectiveness === 'low' && (lang === 'zh' ? '低' : 'Low')}
                  </span>
                </div>
              </div>
            </section>
          )}

          <section className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 rounded-lg p-4 border-2 border-amber-500">
            <h2 className="text-amber-400 font-bold mb-3 text-lg flex items-center gap-2">
              <span>💡</span>
              <span>{t.psychologicalEffect}</span>
            </h2>
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-mono">
              {diagnosis.psychologicalEffect}
            </p>
          </section>
        </div>

        <div className="bg-slate-700 p-4 flex gap-3">
          <button
            onClick={onStart}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95"
          >
            {t.startRitual}
          </button>
          <button
            onClick={onRetry}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95"
          >
            {t.retryDiagnosis}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisBook;
