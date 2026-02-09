import React, { useState } from 'react';

interface Props {
  lang?: 'zh' | 'en';
}

const HeritageBadge: React.FC<Props> = ({ lang = 'zh' }) => {
  const [showInfo, setShowInfo] = useState(false);

  const text = {
    zh: {
      title: '非遗民俗',
      subtitle: '惊蛰打小人',
      description: '惊蛰打小人是香港、广东地区的传统非遗民俗，通常在惊蛰（农历二月二）进行。人们通过打小人、念口诀的仪式，驱除小人、祈求平安。',
      learnMore: '了解更多'
    },
    en: {
      title: 'Intangible Cultural Heritage',
      subtitle: 'Awakening of Insects Ritual',
      description: 'The "Beating the Villain" ritual is a traditional folk custom from Hong Kong and Guangdong, typically performed on the Awakening of Insects (2nd day of the 2nd lunar month). People beat paper villains and chant mantras to drive away bad luck and pray for peace.',
      learnMore: 'Learn More'
    }
  };

  const t = text[lang];

  return (
    <div className="fixed top-4 left-4 z-50">
      <div 
        className="relative cursor-pointer group"
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(false)}
      >
        <div className="flex items-center gap-2 bg-gradient-to-br from-amber-600 to-amber-800 text-white px-3 py-2 rounded-full shadow-lg border-2 border-amber-400 hover:scale-105 transition-transform">
          <span className="text-xl">🏮</span>
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-tight">{t.title}</span>
            <span className="text-[10px] leading-tight opacity-90">{t.subtitle}</span>
          </div>
        </div>

        {showInfo && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-sm border border-amber-600/50 rounded-lg p-4 shadow-2xl z-50">
            <div className="text-xs text-slate-300 leading-relaxed">
              <p className="mb-2">{t.description}</p>
              <button 
                className="text-amber-500 hover:text-amber-400 text-xs font-semibold"
                onClick={() => window.open('https://zh.wikipedia.org/wiki/%E6%89%93%E5%B0%8F%E4%BA%BA', '_blank')}
              >
                {t.learnMore} →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeritageBadge;