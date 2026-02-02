import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { Language } from '../types';

interface Props {
  lang: Language;
}

const GlobalStats: React.FC<Props> = ({ lang }) => {
  // Start with a fake high number to create "Social Proof" immediately, then fetch real if possible
  const [count, setCount] = useState<number>(128490);
  const [region, setRegion] = useState<string>('Unknown');

  useEffect(() => {
    // 1. Simulate live activity (Fake websocket effect)
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 3));
    }, 2000);

    // 2. Try to get real region
    try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const regionName = timeZone.split('/')[1] || timeZone;
        setRegion(regionName.replace('_', ' '));
    } catch (e) {
        // ignore
    }

    // 3. TODO: If Supabase is connected, fetch real global_stats here
    // const fetchRealStats = async () => { ... }

    return () => clearInterval(interval);
  }, []);

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

        <div className="w-px h-10 bg-slate-700"></div>

        {/* Regional Badge */}
        <div className="text-center min-w-[80px]">
             <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                {lang === 'en' ? 'Your Sector' : '当前战区'}
            </p>
            <p className="text-xs font-bold text-slate-300">
                📍 {region}
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