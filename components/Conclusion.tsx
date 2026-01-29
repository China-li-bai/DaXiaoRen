import React from 'react';
import { ResolutionResponse, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  lang: Language;
  resolution: ResolutionResponse;
  onReset: () => void;
}

const Conclusion: React.FC<Props> = ({ lang, resolution, onReset }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="w-full max-w-lg text-center animate-fade-in-up">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-amber-500/50 p-8 rounded-xl shadow-[0_0_30px_rgba(251,191,36,0.2)]">
        
        {/* Paper Talisman Graphic */}
        <div className="mx-auto mb-6 w-16 h-24 bg-yellow-300 border-2 border-red-600 flex items-center justify-center shadow-lg transform rotate-3">
          <span className="text-red-600 font-serif font-bold text-2xl writing-vertical-rl">
            {lang === 'zh' ? '大吉' : 'LUCK'}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-amber-400 mb-6 font-serif">
          {t.finish}
        </h2>

        <div className="space-y-6">
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <h3 className="text-red-400 text-sm font-bold uppercase tracking-wider mb-2">
              {lang === 'en' ? 'Blessing' : '贵人指引'}
            </h3>
            <p className="text-lg text-slate-100 leading-relaxed font-serif">
              "{resolution.blessing}"
            </p>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg">
            <h3 className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-2">
              {lang === 'en' ? 'Wisdom' : '化解建议'}
            </h3>
            <p className="text-md text-slate-300 italic">
              {resolution.advice}
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="mt-8 px-8 py-3 bg-transparent border-2 border-amber-500 text-amber-500 font-bold rounded-full hover:bg-amber-500 hover:text-slate-900 transition-all duration-300"
        >
          {t.playAgain}
        </button>
      </div>
    </div>
  );
};

export default Conclusion;
