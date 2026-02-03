import React, { useEffect, useState, useRef } from 'react';
import usePartySocket from 'partykit/react';
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
  const [myCountry, setMyCountry] = useState<string>('');
  
  // Buffer sending clicks to avoid flooding websocket
  const clickBuffer = useRef(0);

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: "global-leaderboard",
    onMessage(event) {
      const msg = JSON.parse(event.data);
      if (msg.type === 'LB_UPDATE') {
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

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={onToggle}
        className="fixed bottom-4 left-4 z-40 bg-slate-900 border border-amber-600 text-amber-500 p-3 rounded-full shadow-lg hover:bg-slate-800 transition-transform active:scale-95 flex items-center gap-2"
      >
        <span>🏆</span>
        <span className="font-bold text-xs uppercase hidden md:inline">Leaderboard</span>
      </button>

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-slate-900 border-r border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
           <h3 className="text-amber-500 font-bold uppercase tracking-widest">Global Rankings</h3>
           <button onClick={onToggle} className="text-slate-400 hover:text-white">&times;</button>
        </div>

        <div className="overflow-y-auto h-full pb-20 p-2">
            {sortedCountries.length === 0 ? (
                <div className="text-center text-slate-500 mt-10 text-xs">Waiting for data...</div>
            ) : (
                <div className="space-y-2">
                    {sortedCountries.map((c, index) => (
                        <div key={c.code} className="bg-slate-800/50 rounded p-3 border border-slate-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-3">
                                    <span className={`font-mono font-bold text-sm w-6 text-center ${index < 3 ? 'text-yellow-400' : 'text-slate-500'}`}>
                                        #{index + 1}
                                    </span>
                                    <span className="font-bold text-slate-200">{c.name}</span>
                                    {/* Flag emoji logic could go here based on code */}
                                    <span className="text-xs text-slate-500 bg-slate-800 px-1 rounded">{c.code}</span>
                                </div>
                                <span className="text-amber-500 font-mono font-bold">{c.score.toLocaleString()}</span>
                            </div>
                            
                            {/* Top 3 Regions preview */}
                            <div className="pl-9 text-[10px] text-slate-400 space-y-1">
                                {Object.entries(c.regions)
                                    .sort(([,a], [,b]) => b - a)
                                    .slice(0, 3)
                                    .map(([regionCode, score]) => (
                                        <div key={regionCode} className="flex justify-between">
                                            <span>{regionCode}</span>
                                            <span>{score.toLocaleString()}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default LeaderboardWidget;