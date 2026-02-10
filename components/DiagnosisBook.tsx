import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Diagnosis, getElementIcon, getElementName } from '../utils/bazi';

interface Props {
  diagnosis: Diagnosis;
  onStart: () => void;
  onRetry: () => void;
  lang: Language;
}

const DiagnosisBook: React.FC<Props> = ({ diagnosis, onStart, onRetry, lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-800 border-2 border-amber-600 rounded-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-4 text-center">
          <div className="text-4xl mb-2">📜</div>
          <h1 className="text-2xl font-bold text-white mb-1">{t.diagnosisTitle}</h1>
          <p className="text-amber-100 text-sm">{t.diagnosisSubtitle}</p>
        </div>

        <div className="p-6 space-y-6">
          <section className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h2 className="text-amber-500 font-bold mb-3 text-lg flex items-center gap-2">
              <span>👤</span>
              <span>{t.userAttribute}</span>
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getElementIcon(diagnosis.user.element)}</span>
                <div>
                  <p className="text-xl font-bold text-slate-200">{t.elements[diagnosis.user.element]}命</p>
                  <p className="text-sm text-slate-400">{t.birthYear}: {diagnosis.user.year}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-800 rounded p-2">
                  <span className="text-slate-500">{t.heavenlyStem}：</span>
                  <span className="text-amber-500 font-bold">{diagnosis.user.heavenlyStem}</span>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <span className="text-slate-500">{t.earthlyBranch}：</span>
                  <span className="text-amber-500 font-bold">{diagnosis.user.earthlyBranch}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h2 className="text-red-500 font-bold mb-3 text-lg flex items-center gap-2">
              <span>⚔️</span>
              <span>{t.currentSituation}</span>
            </h2>
            <div className="space-y-2">
              <div className="bg-red-900/30 rounded p-3 border border-red-600">
                <p className="text-red-400 font-bold text-center text-lg">
                  {diagnosis.situation.conflict}
                </p>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {diagnosis.situation.description}
              </p>
            </div>
          </section>

          <section className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h2 className="text-purple-500 font-bold mb-3 text-lg flex items-center gap-2">
              <span>🧭</span>
              <span>{t.villainDirection}</span>
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-4xl">🧭</div>
              <div>
                <p className="text-xl font-bold text-slate-200">{diagnosis.villain.direction}</p>
                <p className="text-sm text-slate-400">
                  {getElementIcon(diagnosis.villain.element)}位
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
                <span className="text-4xl">{getElementIcon(diagnosis.villain.element)}</span>
                <div>
                  <p className="text-xl font-bold text-slate-200">{diagnosis.villain.type}</p>
                  <p className="text-sm text-slate-400">
                    {getElementName(diagnosis.villain.element)}形小人
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {diagnosis.villain.characteristics.map((char, index) => (
                  <span
                    key={index}
                    className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h2 className="text-green-500 font-bold mb-3 text-lg flex items-center gap-2">
              <span>👟</span>
              <span>{t.solution}</span>
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-green-900/20 rounded p-3 border border-green-600">
                <span className="text-4xl">{diagnosis.solution.shoeIcon}</span>
                <div>
                  <p className="text-xl font-bold text-green-400">{diagnosis.solution.shoeType}</p>
                  <p className="text-sm text-slate-400">{t.shoeType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-amber-900/20 rounded p-3 border border-amber-600">
                <span className="text-4xl">⏰</span>
                <div>
                  <p className="text-xl font-bold text-amber-400">{diagnosis.solution.optimalTime}</p>
                  <p className="text-sm text-slate-400">{t.optimalTime}: {diagnosis.solution.timeRange}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 rounded-lg p-4 border-2 border-amber-500">
            <h2 className="text-amber-400 font-bold mb-3 text-lg flex items-center gap-2">
              <span>💡</span>
              <span>{t.psychologicalEffect}</span>
            </h2>
            <p className="text-slate-200 text-base leading-relaxed whitespace-pre-line">
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
