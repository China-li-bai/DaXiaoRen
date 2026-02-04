import React, { useEffect, useState, useRef } from 'react';
import usePartySocket from 'partysocket/react';
import { GlobalLeaderboardState } from '../partykit/types';

// Replace with your actual deployed PartyKit URL or localhost
const PARTYKIT_HOST = window.location.hostname === 'localhost' ? '127.0.0.1:1999' : window.location.host; 

interface Props {
  clicksToAdd: number;
  onClicksSent: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const LeaderboardWidget: React.FC<Props> = ({ clicksToAdd, onClicksSent, isOpen, onToggle }) => {
  const [leaderboard, setLeaderboard] = useState<GlobalLeaderboardState>({});
  const [prevLeaderboard, setPrevLeaderboard] = useState<GlobalLeaderboardState>({});

  // Buffer sending clicks to avoid flooding websocket
  const clickBuffer = useRef(0);

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: "global-leaderboard",
    onMessage(event) {
      const msg = JSON.parse(event.data);
      if (msg.type === 'LB_UPDATE') {
        setPrevLeaderboard(leaderboard);
        setLeaderboard(msg.state);
      }
    }
  });

  // Accumulate clicks from props
  useEffect(() => {
    if (clicksToAdd > 0) {
      clickBuffer.current += clicksToAdd;
      onClicksSent(); // Reset parent counter
    }
  }, [clicksToAdd, onClicksSent]);

  // Flush buffer every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (clickBuffer.current > 0 && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'LB_CLICK', count: clickBuffer.current }));
        clickBuffer.current = 0;
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [socket]);

  // Sort and Render Logic
  const sortedCountries = Object.entries(leaderboard)
    .map(([code, data]) => ({ code, ...data }))
    .sort((a, b) => b.score - a.score);

  const getFlagEmoji = (countryCode: string): string => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const getScoreChange = (countryCode: string): number => {
    const current = leaderboard[countryCode]?.score || 0;
    const previous = prevLeaderboard[countryCode]?.score || 0;
    return current - previous;
  };

  const getRegionScoreChange = (countryCode: string, regionCode: string): number => {
    const current = leaderboard[countryCode]?.regions[regionCode] || 0;
    const previous = prevLeaderboard[countryCode]?.regions[regionCode] || 0;
    return current - previous;
  };

  return (
    <>
      {/* Floating Toggle Button - Mobile Optimized */}
      <button 
        onClick={onToggle}
        className="fixed bottom-4 left-4 z-40 bg-slate-900 border border-amber-600 text-amber-500 p-2 sm:p-3 rounded-full shadow-lg hover:bg-slate-800 hover:scale-110 transition-all active:scale-95 flex items-center gap-2 group"
        aria-label="Toggle Leaderboard"
      >
        <span className="group-hover:animate-bounce text-lg sm:text-xl">🏆</span>
        <span className="font-bold text-xs uppercase hidden md:inline">Leaderboard</span>
      </button>

      {/* Drawer - Responsive Width */}
      <div className={`fixed inset-y-0 left-0 w-full sm:w-80 bg-slate-900 border-r border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-3 sm:p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
           <h3 className="text-amber-500 font-bold uppercase tracking-widest text-sm sm:text-base">Global Rankings</h3>
           <button 
             onClick={onToggle} 
             className="text-slate-400 hover:text-white p-2 -mr-2"
             aria-label="Close Leaderboard"
           >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>

        <div className="overflow-y-auto h-full pb-24 sm:pb-20 p-2">
            {sortedCountries.length === 0 ? (
                <div className="text-center text-slate-500 mt-10 text-xs">Waiting for data...</div>
            ) : (
                <div className="space-y-2">
                    {sortedCountries.map((c, index) => {
                        const scoreChange = getScoreChange(c.code);
                        return (
                        <div key={c.code} className="bg-slate-800/50 rounded p-2 sm:p-3 border border-slate-700/50 hover:border-amber-600/50 transition-colors">
                            <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                    <span className={`font-mono font-bold text-xs sm:text-sm w-5 sm:w-6 text-center shrink-0 ${index < 3 ? 'text-yellow-400' : 'text-slate-500'}`}>
                                        #{index + 1}
                                    </span>
                                    <span className="text-xl sm:text-2xl shrink-0">{getFlagEmoji(c.code)}</span>
                                    <span className="font-bold text-slate-200 text-sm sm:text-base truncate">{c.name}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
                                    {scoreChange > 0 && (
                                        <span className="text-green-400 text-[10px] sm:text-xs font-mono animate-pulse">+{scoreChange.toLocaleString()}</span>
                                    )}
                                    <span className="text-amber-500 font-mono font-bold text-sm sm:text-base">{c.score.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Top 3 Regions preview */}
                            <div className="pl-7 sm:pl-9 text-[9px] sm:text-[10px] text-slate-400 space-y-0.5 sm:space-y-1">
                                {Object.entries(c.regions)
                                    .sort(([,a], [,b]) => b - a)
                                    .slice(0, 3)
                                    .map(([regionCode, score]) => {
                                        const regionChange = getRegionScoreChange(c.code, regionCode);
                                        return (
                                            <div key={regionCode} className="flex justify-between items-center">
                                                <span className="truncate">{regionCode}</span>
                                                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                                    {regionChange > 0 && (
                                                        <span className="text-green-400/70 text-[8px] sm:text-[9px]">+{regionChange}</span>
                                                    )}
                                                    <span className="text-slate-300">{score.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default LeaderboardWidget;