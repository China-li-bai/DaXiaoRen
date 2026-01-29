import React from 'react';
import { Language } from '../types';

interface Props {
  lang: Language;
  setLang: (l: Language) => void;
}

const LanguageSwitch: React.FC<Props> = ({ lang, setLang }) => {
  return (
    <div className="absolute top-4 right-4 z-50 flex gap-2">
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${
          lang === 'en' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('zh')}
        className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${
          lang === 'zh' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400 hover:text-white'
        }`}
      >
        中文
      </button>
    </div>
  );
};

export default LanguageSwitch;
