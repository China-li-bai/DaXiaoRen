import React from 'react';
import { ResolutionResponse, Language, VillainData } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  lang: Language;
  resolution: ResolutionResponse;
  villain: VillainData; // Added villain prop to show name on talisman
  onReset: () => void;
  isAssistMode?: boolean;
}

const Conclusion: React.FC<Props> = ({ lang, resolution, villain, onReset, isAssistMode = false }) => {
  const t = TRANSLATIONS[lang];
  const dateStr = new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in-up pb-10">
      
      {/* Share Instruction */}
      <p className="text-amber-400 text-xs md:text-sm uppercase tracking-widest mb-4 animate-pulse">
        📸 {t.screenshotShare}
      </p>

      {/* The Talisman Card (Designed to be screenshotted) */}
      <div className="relative w-full max-w-sm bg-[#fcf8e3] text-slate-900 overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.4)] border-4 border-amber-600 rounded-sm">
        
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiLz4KPC9zdmc+")' }}></div>
        
        {/* Decorative Border Pattern */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-repeat-x" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, #b45309 50%)', backgroundSize: '10px 100%' }}></div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-repeat-x" style={{ backgroundImage: 'linear-gradient(90deg, #b45309 50%, transparent 50%)', backgroundSize: '10px 100%' }}></div>

        {/* Co-op Badge */}
        {isAssistMode && (
             <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded transform rotate-3 z-20 shadow-md border border-red-400">
                 {lang === 'zh' ? '好友助阵封印' : 'CO-OP SEAL'}
             </div>
        )}

        <div className="p-6 md:p-8 flex flex-col items-center text-center relative z-10">
          
          {/* Header Seal */}
          <div className="w-16 h-16 border-4 border-red-600 rounded-full flex items-center justify-center mb-4 opacity-80 rotate-12 mask-ink">
            <span className="text-red-600 font-serif font-bold text-xs transform -rotate-12">
              {lang === 'zh' ? '有求必应' : 'GRANTED'}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-red-700 font-serif font-bold text-3xl mb-1 tracking-widest">
            {lang === 'zh' ? (isAssistMode ? '合力封印' : '功德圆满') : 'PURIFIED'}
          </h2>
          <div className="w-full h-px bg-red-800/30 mb-4"></div>

          {/* Banishment Info */}
          <div className="mb-6 w-full">
            <p className="text-slate-500 text-xs uppercase mb-1">{lang === 'zh' ? '已成功封印' : 'BANISHED'}</p>
            <p className="text-xl font-bold text-slate-800 bg-red-100/50 py-1 px-2 rounded mx-auto inline-block border border-red-200">
               {villain.name.length > 8 ? villain.name.substring(0,8)+'...' : villain.name}
            </p>
          </div>

          {/* Main Blessing (Vertical text for Chinese feels more authentic) */}
          <div className={`mb-6 text-red-600 font-bold font-serif leading-relaxed ${lang === 'zh' ? 'text-2xl' : 'text-xl'}`}>
            "{resolution.blessing}"
          </div>

          {/* Advice */}
          <div className="bg-amber-50 p-4 border border-amber-200 rounded w-full mb-6">
             <p className="text-amber-800 text-xs font-bold uppercase mb-1">{lang === 'zh' ? '大师指点' : 'WISDOM'}</p>
             <p className="text-sm text-amber-900 italic font-serif">
               {resolution.advice}
             </p>
          </div>

          {/* Footer Info */}
          <div className="flex justify-between w-full items-end mt-2">
            <div className="text-left">
              <p className="text-[10px] text-slate-400 font-sans">DATE</p>
              <p className="text-xs text-slate-600 font-serif font-bold">{dateStr}</p>
            </div>
            
            {/* The Big Red Stamp */}
            <div className="w-20 h-20 border-4 border-red-600 flex items-center justify-center opacity-70 transform -rotate-12 mix-blend-multiply absolute bottom-4 right-4 pointer-events-none">
              <div className="border border-red-600 w-[90%] h-[90%] flex flex-col items-center justify-center text-red-600 leading-none">
                <span className="text-xs font-bold block">{lang === 'zh' ? '打小人' : 'SMASH'}</span>
                <span className="text-2xl font-black block">{lang === 'zh' ? '大吉' : 'LUCK'}</span>
                <span className="text-xs font-bold block">VillainSmash</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <button
        onClick={onReset}
        className={`mt-8 px-10 py-3 font-bold rounded-full transition-all shadow-lg text-sm uppercase tracking-wider ${
            isAssistMode 
                ? 'bg-amber-600 hover:bg-amber-500 text-white animate-bounce' 
                : 'bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
      >
        {isAssistMode ? t.createYourOwn : t.playAgain}
      </button>
    </div>
  );
};

export default Conclusion;