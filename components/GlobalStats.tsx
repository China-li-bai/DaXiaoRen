import React, { useState } from 'react';
import usePartySocket from 'partysocket/react';
import { Language } from '../types';
import { getPartyKitHost } from '../config/partykit';

interface Props {
  lang: Language;
}

const GlobalStats: React.FC<Props> = ({ lang }) => {
  const [count, setCount] = useState<number>(0);
  const [metadata, setMetadata] = useState<{ totalGlobalClicks: number } | null>(null);

  const socket = usePartySocket({
    host: getPartyKitHost(),
    room: 'global-leaderboard',
    onConnect() {
      console.log('✅ GlobalStats socket connected');
    },
    onMessage(event) {
      const msg = JSON.parse(event.data);
      if (msg.type === 'LB_UPDATE' && msg.metadata) {
        setMetadata(msg.metadata);
        setCount(msg.metadata.totalGlobalClicks);
      }
    }
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 space-y-2 animate-fade-in">
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-6 py-3 flex items-center gap-4 shadow-lg backdrop-blur-md">
        
        {/* Global Counter */}
        <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                {lang === 'en' ? 'Total Spirits Banished' : '全网已封印小人'}
            </p>
            <p className="text-2xl md:text-3xl font-mono font-bold text-amber-500 tabular-nums shadow-amber-500/20 drop-shadow-md">
                {formatNumber(count)}
            </p>
        </div>
      </div>
      
      {/* Social Motivation Text */}
      <p className="text-[10px] text-slate-500 italic">
        {lang === 'en' 
            ? "You are not alone. The digital temple is busy tonight." 
            : "你不是一个人在战斗。今晚神庙香火鼎盛。"}
      </p>
    </div>
  );
};

export default GlobalStats;