import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Diagnosis, getElementIcon, getElementName } from '../utils/bazi';
import { Bazi as ProfessionalBazi, FiveElementsStrength } from '../utils/baziCalculator';
import HolographicBagua from './HolographicBagua';
import GlassCard from './ui/GlassCard';

interface Props {
  diagnosis: Diagnosis;
  onStart: () => void;
  onRetry: () => void;
  onBackToProfile?: () => void;
  lang: Language;
}

const DiagnosisBook: React.FC<Props> = ({ diagnosis, onStart, onRetry, onBackToProfile, lang }) => {
  const t = TRANSLATIONS[lang];
  const [showDetails, setShowDetails] = useState(false);
  const [showStressDetails, setShowStressDetails] = useState(false);

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
          {/* 全息八卦命盘 - 核心视觉 */}
          <section className="flex flex-col items-center">
            <div className="relative">
              {/* 外层光环 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-3xl animate-pulse" />

              {/* 全息八卦图 */}
              <HolographicBagua
                dayMaster={bazi.day.heavenlyStem}
                element={diagnosis.villainInfo.element}
                size={280}
              />

              {/* 四柱信息 - 环绕布局 */}
              <div className="absolute inset-0 pointer-events-none">
                {/* 年柱 - 上方 */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-600 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{lang === 'zh' ? '年柱' : 'Year'}</p>
                  <p className="text-lg font-bold text-slate-200">{bazi.year.heavenlyStem}{bazi.year.earthlyBranch}</p>
                </div>

                {/* 月柱 - 右方 */}
                <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-600 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{lang === 'zh' ? '月柱' : 'Month'}</p>
                  <p className="text-lg font-bold text-slate-200">{bazi.month.heavenlyStem}{bazi.month.earthlyBranch}</p>
                </div>

                {/* 时柱 - 左方 */}
                <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-600 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{lang === 'zh' ? '时柱' : 'Hour'}</p>
                  <p className="text-lg font-bold text-slate-200">{bazi.hour.heavenlyStem}{bazi.hour.earthlyBranch}</p>
                </div>

                {/* 日柱标签 - 下方 */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                  <p className="text-xs text-amber-400 font-medium">{lang === 'zh' ? '日主' : 'Day Master'}</p>
                  <p className="text-sm text-slate-400">{bazi.day.heavenlyStem}{bazi.day.earthlyBranch} · {bazi.day.elementName}</p>
                </div>
              </div>
            </div>

            {/* 展开详情按钮 */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-12 text-slate-400 hover:text-amber-400 text-sm flex items-center gap-2 transition-colors"
            >
              <span>{showDetails ? (lang === 'zh' ? '收起详情' : 'Hide Details') : (lang === 'zh' ? '查看五行分析' : 'View Five Elements')}</span>
              <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>▼</span>
            </button>
          </section>

          {/* 五行强弱分析 - 可展开 */}
          {showDetails && (
            <GlassCard className="animate-fade-in">
              <h2 className="text-slate-300 font-bold mb-4 text-base flex items-center gap-2">
                <span>⚖️</span>
                <span>{lang === 'zh' ? '五行强弱分析' : 'Five Elements Strength'}</span>
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { element: 'wood', label: lang === 'zh' ? '木' : 'Wood', color: '#22c55e', icon: '🌲' },
                    { element: 'fire', label: lang === 'zh' ? '火' : 'Fire', color: '#ef4444', icon: '🔥' },
                    { element: 'earth', label: lang === 'zh' ? '土' : 'Earth', color: '#f59e0b', icon: '🌍' },
                    { element: 'metal', label: lang === 'zh' ? '金' : 'Metal', color: '#eab308', icon: '⚜️' },
                    { element: 'water', label: lang === 'zh' ? '水' : 'Water', color: '#3b82f6', icon: '💧' }
                  ].map(item => (
                    <div key={item.element} className="text-center">
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <p className="text-xs text-slate-400 mb-2">{item.label}</p>
                      <div className="bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full transition-all duration-700 rounded-full"
                          style={{
                            width: `${Math.min((strength[item.element] / 8) * 100, 100)}%`,
                            backgroundColor: item.color,
                            boxShadow: `0 0 10px ${item.color}40`
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{strength[item.element]}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-slate-700/50">
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
            </GlassCard>
          )}

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

          {/* 压力分析 - 简化展示 + 可展开详情 */}
          {diagnosis.stressPattern && (
            <GlassCard className="overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    diagnosis.stressPattern.severity === 'severe' ? 'bg-red-600/30 text-red-400' :
                    diagnosis.stressPattern.severity === 'moderate' ? 'bg-orange-600/30 text-orange-400' :
                    'bg-green-600/30 text-green-400'
                  }`}>
                    {diagnosis.stressPattern.severity === 'severe' ? '🔴' :
                     diagnosis.stressPattern.severity === 'moderate' ? '🟠' : '🟢'}
                  </div>
                  <div>
                    <p className="text-slate-300 text-sm">{lang === 'zh' ? '压力等级' : 'Stress Level'}</p>
                    <p className={`font-bold ${
                      diagnosis.stressPattern.severity === 'severe' ? 'text-red-400' :
                      diagnosis.stressPattern.severity === 'moderate' ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      {diagnosis.stressPattern.severity === 'severe' && (lang === 'zh' ? '严重压力' : 'Severe')}
                      {diagnosis.stressPattern.severity === 'moderate' && (lang === 'zh' ? '中度压力' : 'Moderate')}
                      {diagnosis.stressPattern.severity === 'mild' && (lang === 'zh' ? '轻度压力' : 'Mild')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStressDetails(!showStressDetails)}
                  className="text-slate-400 hover:text-slate-200 text-sm flex items-center gap-1 transition-colors"
                >
                  <span>{showStressDetails ? (lang === 'zh' ? '收起' : 'Hide') : (lang === 'zh' ? '详情' : 'Details')}</span>
                  <span className={`transform transition-transform ${showStressDetails ? 'rotate-180' : ''}`}>▼</span>
                </button>
              </div>

              {/* 展开的压力详情 */}
              {showStressDetails && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3 animate-fade-in">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                      {lang === 'zh' ? '触发因素' : 'Triggers'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {diagnosis.stressPattern.triggers.map((trigger, index) => (
                        <span
                          key={index}
                          className="bg-slate-700/50 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-600/50"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                      {lang === 'zh' ? '症状表现' : 'Symptoms'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {diagnosis.stressPattern.symptoms.map((symptom, index) => (
                        <span
                          key={index}
                          className="bg-slate-700/30 text-slate-400 text-xs px-3 py-1.5 rounded-lg"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          )}

          {/* 小人信息 - 合并为简洁卡片 */}
          <GlassCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-3xl border border-slate-600">
                  {getElementIcon(diagnosis.villainInfo.element)}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-200">{diagnosis.villainInfo.name}</p>
                  <p className="text-sm text-slate-400">
                    {getElementName(diagnosis.villainInfo.element)}{lang === 'zh' ? '型 · ' : ' · '}
                    {diagnosis.villainDirection}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wider">{lang === 'zh' ? '方位' : 'Direction'}</p>
                <p className="text-xl">🧭</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="flex flex-wrap gap-2">
                {diagnosis.villainInfo.characteristics.map((char, index) => (
                  <span
                    key={index}
                    className="bg-slate-800/50 text-slate-400 text-xs px-3 py-1.5 rounded-lg border border-slate-700/50"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>

          {diagnosis.reliefStrategy && (
            <section className="relative overflow-hidden rounded-2xl border-2 border-green-500/50 shadow-lg shadow-green-900/20">
              {/* 背景渐变 */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-emerald-900/30 to-green-900/40" />

              {/* 发光边框效果 */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/20 via-transparent to-green-500/20" />

              {/* 推荐标签 */}
              <div className="absolute -top-px left-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-b-lg shadow-lg z-10">
                <span className="flex items-center gap-1">
                  <span>💡</span>
                  <span>{lang === 'zh' ? '专属缓解方案' : 'Your Relief Plan'}</span>
                </span>
              </div>

              <div className="relative p-6 pt-8 space-y-5">
                {/* 标题和描述 */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-green-300 mb-3">
                    {diagnosis.reliefStrategy.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto">
                    {diagnosis.reliefStrategy.description}
                  </p>
                </div>

                {/* 行动步骤 - 横向滚动 */}
                <div>
                  <p className="text-green-400/80 text-xs font-medium uppercase tracking-wider mb-3 text-center">
                    {lang === 'zh' ? '执行步骤' : 'Action Steps'}
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {diagnosis.reliefStrategy.actions.map((action, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 bg-green-800/40 backdrop-blur-sm text-green-200 text-sm px-4 py-3 rounded-xl border border-green-600/30 min-w-[140px] text-center"
                      >
                        <span className="block text-green-400 text-xs mb-1">Step {index + 1}</span>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 时长和有效性 */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="text-center">
                    <p className="text-slate-400 text-xs mb-1">{lang === 'zh' ? '建议时长' : 'Duration'}</p>
                    <p className="text-xl font-bold text-green-300">{diagnosis.reliefStrategy.duration}</p>
                  </div>
                  <div className="w-px h-10 bg-green-600/30" />
                  <div className="text-center">
                    <p className="text-slate-400 text-xs mb-1">{lang === 'zh' ? '有效性' : 'Effectiveness'}</p>
                    <span className={`inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${
                      diagnosis.reliefStrategy.effectiveness === 'high' ? 'bg-green-600/80 text-white' :
                      diagnosis.reliefStrategy.effectiveness === 'medium' ? 'bg-yellow-600/80 text-white' :
                      'bg-slate-600/80 text-white'
                    }`}>
                      <span>
                        {diagnosis.reliefStrategy.effectiveness === 'high' && (lang === 'zh' ? '高' : 'High')}
                        {diagnosis.reliefStrategy.effectiveness === 'medium' && (lang === 'zh' ? '中' : 'Medium')}
                        {diagnosis.reliefStrategy.effectiveness === 'low' && (lang === 'zh' ? '低' : 'Low')}
                      </span>
                      {diagnosis.reliefStrategy.effectiveness === 'high' && <span>⭐</span>}
                    </span>
                  </div>
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

        {/* 按钮区域 - 重构：主CTA突出 */}
        <div className="p-6 space-y-3 bg-gradient-to-t from-slate-900/50 to-transparent">
          {/* 主CTA：开始仪式 */}
          <button
            onClick={onStart}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:via-orange-500 hover:to-amber-500 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-900/30"
          >
            {/* 光效动画 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-2 text-lg">
              <span>🎯</span>
              <span>{lang === 'zh' ? '开始仪式 · 释放压力' : 'Start Ritual · Release Stress'}</span>
              <span className="animate-pulse">✨</span>
            </span>
          </button>

          {/* 次要操作 */}
          <div className="flex gap-3">
            {onBackToProfile && (
              <button
                onClick={onBackToProfile}
                className="flex-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>←</span>
                <span className="text-sm">{lang === 'zh' ? '返回' : 'Back'}</span>
              </button>
            )}
            <button
              onClick={onRetry}
              className="flex-1 text-slate-500 hover:text-slate-300 py-3 text-sm transition-all"
            >
              {lang === 'zh' ? '重新诊断' : 'Redo Diagnosis'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisBook;
