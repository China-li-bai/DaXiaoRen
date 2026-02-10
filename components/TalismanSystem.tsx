import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export interface Talisman {
  id: string;
  type: keyof typeof TRANSLATIONS.en.talismans;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  collectedAt: number;
}

interface Props {
  lang: Language;
  onCollect?: (talisman: Talisman) => void;
}

export const dropRandomTalisman = (lang: Language) => {
  const t = TRANSLATIONS[lang];
  const talismanTypes = Object.keys(t.talismans) as Array<keyof typeof t.talismans>;
  const randomType = talismanTypes[Math.floor(Math.random() * talismanTypes.length)];
  
  const rarityRoll = Math.random();
  let rarity: Talisman['rarity'];
  if (rarityRoll < 0.6) rarity = 'common';
  else if (rarityRoll < 0.85) rarity = 'rare';
  else if (rarityRoll < 0.97) rarity = 'epic';
  else rarity = 'legendary';

  const icons: Record<string, string> = {
    hairLoss: '💇',
    raise: '💰',
    noReply: '📱',
    enjoyLife: '🍜',
    goodSleep: '😴',
    focus: '🎯',
    chill: '🧘',
    lucky: '🍀',
    money: '💎'
  };

  const newTalisman: Talisman = {
    id: `${randomType}-${Date.now()}`,
    type: randomType,
    name: t.talismans[randomType],
    icon: icons[randomType],
    rarity,
    collectedAt: Date.now()
  };

  const saved = localStorage.getItem('collectedTalismans');
  const existingTalismans: Talisman[] = saved ? JSON.parse(saved) : [];
  const existing = existingTalismans.find(talisman => talisman.type === randomType);
  
  if (!existing) {
    const updated = [...existingTalismans, newTalisman];
    localStorage.setItem('collectedTalismans', JSON.stringify(updated));
    return newTalisman;
  }
  
  return null;
};

const TalismanSystem: React.FC<Props> = ({ lang, onCollect }) => {
  const [talismans, setTalismans] = useState<Talisman[]>([]);
  const [showDrop, setShowDrop] = useState(false);
  const [droppedTalisman, setDroppedTalisman] = useState<Talisman | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('collectedTalismans');
    if (saved) {
      setTalismans(JSON.parse(saved));
    }
  }, []);

  const saveTalismans = (newTalismans: Talisman[]) => {
    setTalismans(newTalismans);
    localStorage.setItem('collectedTalismans', JSON.stringify(newTalismans));
  };

  const handleDropTalisman = () => {
    const droppedTalisman = dropRandomTalisman(lang);
    if (droppedTalisman) {
      const updated = [...talismans, droppedTalisman];
      saveTalismans(updated);
      setDroppedTalisman(droppedTalisman);
      setShowDrop(true);
      
      if (onCollect) {
        onCollect(droppedTalisman);
      }

      setTimeout(() => {
        setShowDrop(false);
        setDroppedTalisman(null);
      }, 3000);
    }
  };

  const getRarityColor = (rarity: Talisman['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-slate-500 to-slate-600';
      case 'rare': return 'from-blue-500 to-blue-600';
      case 'epic': return 'from-purple-500 to-purple-600';
      case 'legendary': return 'from-amber-500 to-amber-600';
    }
  };

  const getRarityText = (rarity: Talisman['rarity']) => {
    switch (rarity) {
      case 'common': return lang === 'zh' ? '普通' : 'Common';
      case 'rare': return lang === 'zh' ? '稀有' : 'Rare';
      case 'epic': return lang === 'zh' ? '史诗' : 'Epic';
      case 'legendary': return lang === 'zh' ? '传说' : 'Legendary';
    }
  };

  const t = TRANSLATIONS[lang];

  return (
    <>
      {showDrop && droppedTalisman && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-slate-800 border-2 border-amber-500 rounded-2xl p-8 shadow-2xl animate-bounce">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">{droppedTalisman.icon}</div>
              <h2 className="text-2xl font-bold text-amber-400 mb-2">{t.talismanDrop}</h2>
              <div className={`text-lg font-bold bg-gradient-to-r ${getRarityColor(droppedTalisman.rarity)} bg-clip-text text-transparent mb-2`}>
                {droppedTalisman.name}
              </div>
              <div className="text-sm text-slate-400 mb-4">
                {getRarityText(droppedTalisman.rarity)}
              </div>
              <div className="text-xs text-slate-500">
                {lang === 'zh' ? '已收集' : 'Collected'}: {talismans.length} / 9
              </div>
            </div>
          </div>
        </div>
      )}

      {talismans.length > 0 && (
        <div className="fixed bottom-4 left-4 z-40 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-lg p-4 shadow-2xl max-w-xs">
          <h3 className="text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
            <span>📜</span>
            <span>{lang === 'zh' ? '护身符图鉴' : 'Talisman Collection'}</span>
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {talismans.map((talisman) => (
              <div
                key={talisman.id}
                className={`relative p-2 rounded-lg border-2 bg-gradient-to-br ${getRarityColor(talisman.rarity)} hover:scale-110 transition-transform`}
                title={talisman.name}
              >
                <div className="text-2xl text-center">{talisman.icon}</div>
                <div className="absolute -top-1 -right-1 text-xs bg-slate-900 px-1 rounded">
                  {talisman.rarity === 'common' && '⚪'}
                  {talisman.rarity === 'rare' && '🔵'}
                  {talisman.rarity === 'epic' && '🟣'}
                  {talisman.rarity === 'legendary' && '🟡'}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-500 text-center">
            {lang === 'zh' ? '收集进度' : 'Collection Progress'}: {talismans.length} / 9
          </div>
        </div>
      )}
    </>
  );
};

export default TalismanSystem;
