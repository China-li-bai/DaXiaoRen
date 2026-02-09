import React from 'react';

interface Props {
  lang?: 'zh' | 'en';
}

const CulturalFooter: React.FC<Props> = ({ lang = 'zh' }) => {
  const text = {
    zh: {
      title: '🏮 惊蛰打小人 - 非遗民俗文化传承',
      intro: '打小人是香港、广东地区的传统民俗，通常在惊蛰（农历二月二）进行。人们通过打小人、念口诀的仪式，驱除小人、祈求平安。',
      purpose: '本游戏旨在数字化传承这一非遗民俗文化，让更多人了解和体验传统仪式。',
      disclaimer: '⚠️ 免责声明：本游戏为虚拟娱乐，仅供文化体验，请勿对号入座。游戏中的"小人"为虚构角色，我们尊重每一个人，本游戏不针对任何真实个人。',
      learnMore: '了解更多非遗文化'
    },
    en: {
      title: '🏮 Awakening of Insects Ritual - Intangible Cultural Heritage',
      intro: 'The "Beating the Villain" ritual is a traditional folk custom from Hong Kong and Guangdong, typically performed on the Awakening of Insects (2nd day of the 2nd lunar month). People beat paper villains and chant mantras to drive away bad luck and pray for peace.',
      purpose: 'This game aims to digitally preserve and pass on this intangible cultural heritage, allowing more people to understand and experience traditional rituals.',
      disclaimer: '⚠️ Disclaimer: This game is for virtual entertainment and cultural experience only. Please do not take it personally. The "villains" in this game are fictional characters. We respect everyone, and this game does not target any real individual.',
      learnMore: 'Learn More About Heritage'
    }
  };

  const t = text[lang];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-amber-600/30 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-amber-500 text-sm font-bold mb-2">{t.title}</h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-2">
              {t.intro}
            </p>
            <p className="text-slate-500 text-xs leading-relaxed mb-2">
              {t.purpose}
            </p>
            <p className="text-slate-600 text-[10px] leading-relaxed">
              {t.disclaimer}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => window.open('https://zh.wikipedia.org/wiki/%E6%89%93%E5%B0%8F%E4%BA%BA', '_blank')}
              className="bg-amber-600 hover:bg-amber-500 text-slate-900 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              {t.learnMore}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CulturalFooter;