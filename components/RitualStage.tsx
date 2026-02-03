import React, { useState, useEffect, useRef } from 'react';
import { VillainData, Language, ChantResponse } from '../types';
import { TRANSLATIONS, TOTAL_HITS_REQUIRED } from '../constants';
import { subscribeToRitual, broadcastHit, completeRitualSession } from '../services/ritualService';

interface Props {
  lang: Language;
  villain: VillainData;
  chantData: ChantResponse;
  onComplete: () => void;
  isAssistMode?: boolean;
  ritualId?: string | null;
  onTap?: () => void; // New prop for leaderboard tracking
}

interface Particle {
  id: number;
  x: number;
  y: number;
  tx: string; // translate x css var
  ty: string; // translate y css var
  color: string;
}

const RitualStage: React.FC<Props> = ({ lang, villain, chantData, onComplete, isAssistMode = false, ritualId, onTap }) => {
  const t = TRANSLATIONS[lang];
  const [hits, setHits] = useState(0);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [shoeRotation, setShoeRotation] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [impactEffect, setImpactEffect] = useState<{x: number, y: number, id: number, textRotation: number} | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  
  // Realtime & Social
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [friendJoined, setFriendJoined] = useState(false);
  const channelRef = useRef<any>(null);

  // Audio Context Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  // Setup Realtime Subscription
  useEffect(() => {
    if (ritualId) {
        console.log("Subscribing to Ritual:", ritualId);
        const channel = subscribeToRitual(
            ritualId,
            (payload) => {
                // When we receive a hit from someone else
                triggerRemoteHitEffect();
                setHits(prev => prev + 1); // Increment local counter
            },
            () => {
                setFriendJoined(true);
                setTimeout(() => setFriendJoined(false), 3000); // Hide banner after 3s
            }
        );
        channelRef.current = channel;

        return () => {
            if (channelRef.current) channelRef.current.unsubscribe();
        };
    }
  }, [ritualId]);

  // Handle completion (sync to DB)
  useEffect(() => {
    if (hits >= TOTAL_HITS_REQUIRED) {
        if (ritualId && !isAssistMode) {
            // Only host marks as complete in DB to avoid race conditions
            completeRitualSession(ritualId); 
        }
        setTimeout(onComplete, 800);
    }
  }, [hits, ritualId, isAssistMode]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
        
        // Create a buffer for White Noise
        const bufferSize = audioCtxRef.current.sampleRate * 2;
        const buffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        noiseBufferRef.current = buffer;
      }
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSlipperHit = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const buffer = noiseBufferRef.current;
    if (!ctx || !buffer) return;

    const t = ctx.currentTime;
    // --- Audio Synthesis Code ---
    const randomDetune = (Math.random() - 0.5) * 200;
    const randomDecay = 0.08 + Math.random() * 0.05;

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1500, t);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSrc.start(t);
    noiseSrc.stop(t + 0.1);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200 + (randomDetune / 5), t);
    osc.frequency.exponentialRampToValueAtTime(40, t + randomDecay);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(1.0, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + randomDecay + 0.05);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  };

  // Called when receiving a broadcast event
  const triggerRemoteHitEffect = () => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 150);
      playSlipperHit();
      // Add random remote particles
      const newParticles: Particle[] = [];
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      for (let i = 0; i < 4; i++) {
         const angle = Math.random() * Math.PI * 2;
         const dist = 60 + Math.random() * 80;
         newParticles.push({
            id: Math.random(),
            x: centerX + (Math.random() * 100 - 50),
            y: centerY + (Math.random() * 100 - 50),
            tx: Math.cos(angle) * dist + 'px',
            ty: Math.sin(angle) * dist + 'px',
            color: '#ef4444' // Red for friend hits
         });
      }
      setParticles(prev => [...prev, ...newParticles]);
      setTimeout(() => {
         setParticles(prev => prev.filter(p => !newParticles.includes(p)));
      }, 1000);
  };

  const handleHit = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    if (now - lastHitTime < 60) return; 
    
    // Notify Leaderboard Widget (if callback exists)
    if (onTap) onTap();

    // Combo Logic
    if (now - lastHitTime < 1000) {
        setCombo(prev => prev + 1);
        setShowCombo(true);
    } else {
        setCombo(1);
        setShowCombo(true);
    }
    setLastHitTime(now);

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    playSlipperHit();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 150);

    setShoeRotation(Math.random() * 60 - 30); 
    setImpactEffect({ x: clientX, y: clientY, id: now, textRotation: Math.random() * 40 - 20 });

    const newParticles: Particle[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 80;
      newParticles.push({
        id: Math.random(),
        x: clientX,
        y: clientY,
        tx: Math.cos(angle) * dist + 'px',
        ty: Math.sin(angle) * dist + 'px',
        color: ['#fff', '#fbbf24', '#ef4444'][Math.floor(Math.random()*3)]
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 1000);

    if (navigator.vibrate) navigator.vibrate(50);

    setHits(prev => prev + 1);

    // BROADCAST TO OTHERS
    if (ritualId && channelRef.current) {
        broadcastHit(channelRef.current, !isAssistMode);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    const url = new URL(window.location.href);
    
    // Use the Ritual ID if available
    if (ritualId) {
        url.search = `?ritual_id=${ritualId}`;
    } else {
        // Fallback for local
        url.searchParams.set('mode', 'assist');
        url.searchParams.set('name', villain.name);
    }
    
    const shareData = {
      title: t.shareTitle,
      text: t.shareMessage.replace('{name}', villain.name),
      url: url.toString(),
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text + " " + shareData.url);
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset effects
  useEffect(() => {
    if (impactEffect) {
      const timer = setTimeout(() => setImpactEffect(null), 100);
      return () => clearTimeout(timer);
    }
  }, [impactEffect]);
  
  useEffect(() => {
      if (showCombo) {
          const timer = setTimeout(() => setShowCombo(false), 2000);
          return () => clearTimeout(timer);
      }
  }, [showCombo, combo]);

  const progress = (hits / TOTAL_HITS_REQUIRED) * 100;
  const isFinished = hits >= TOTAL_HITS_REQUIRED;

  return (
    <div className="flex flex-col items-center justify-between h-full w-full max-w-2xl mx-auto relative select-none">
      
      {/* Assist Mode Banner */}
      {isAssistMode && (
        <div className="absolute top-[-40px] z-50 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold animate-bounce shadow-lg border border-red-400">
           {t.assistWelcome}
        </div>
      )}
      
      {/* Friend Joined Notification */}
      {friendJoined && (
        <div className="absolute top-20 z-50 bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold animate-fade-in-up shadow-xl flex items-center gap-2">
            <span>⚡</span> {lang === 'zh' ? '好友加入战场！' : 'Friend Joined the Fight!'}
        </div>
      )}

      {/* Particles Rendering */}
      {particles.map(p => (
        <div 
            key={p.id}
            className="fixed w-2 h-2 rounded-full pointer-events-none z-50 particle"
            style={{
                left: p.x,
                top: p.y,
                backgroundColor: p.color,
                '--tx': p.tx,
                '--ty': p.ty
            } as React.CSSProperties}
        />
      ))}

      {/* Chant Display */}
      <div className="bg-black/60 p-4 rounded-lg border border-red-800 text-center mb-4 w-full backdrop-blur-sm z-30 transition-all duration-300">
        {chantData.chantLines.map((line, idx) => (
          <p 
            key={idx} 
            className={`text-lg md:text-xl font-bold ${idx % 2 === 0 ? 'text-amber-400' : 'text-red-400'}`}
          >
            {line}
          </p>
        ))}
      </div>

      {/* Main Action Area */}
      <div 
        className="relative w-full h-80 md:h-96 flex items-center justify-center cursor-pointer active:cursor-grabbing group z-20"
        onClick={handleHit}
      >
        {/* Background Aura */}
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-red-900/20 rounded-full blur-3xl transition-opacity duration-300 ${isFinished ? 'opacity-0' : 'opacity-100'}`} />
        
        {/* COMBO COUNTER */}
        <div className={`absolute top-0 right-0 z-40 transform transition-all duration-200 pointer-events-none ${showCombo ? 'scale-110 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="text-4xl font-black text-yellow-400 italic drop-shadow-[4px_4px_0_rgba(185,28,28,1)] stroke-black" style={{ textShadow: '0 0 10px red' }}>
                {combo} COMBO!
            </div>
        </div>

        {/* The Paper Villain */}
        <div 
          className={`relative transition-all duration-75 ease-in-out transform flex flex-col items-center justify-center
            ${isShaking ? 'shake-hard' : ''}
            ${impactEffect ? 'scale-90' : 'scale-100'}
            ${isFinished ? 'opacity-0 scale-50 filter blur-xl transition-all duration-700' : 'opacity-100'}
          `}
        >
           {/* SVG representation of a "Petty Person" paper cutout */}
           <div className="relative">
             <svg width="200" height="260" viewBox="0 0 100 130" className="drop-shadow-2xl">
                {/* Paper Body */}
                <path 
                  d="M50 5 C 40 5, 35 15, 35 25 C 35 35, 40 40, 30 45 L 20 50 L 30 55 C 25 70, 25 90, 30 110 L 25 125 L 45 120 L 50 125 L 55 120 L 75 125 L 70 110 C 75 90, 75 70, 70 55 L 80 50 L 70 45 C 60 40, 65 35, 65 25 C 65 15, 60 5, 50 5 Z" 
                  fill="#fde68a" 
                  stroke="#b45309" 
                  strokeWidth="2"
                />
                
                {/* Talisman Markings (Decorations) */}
                <path d="M50 10 L 50 115" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />

                {/* Eyes - Only show if no custom avatar */}
                {!villain.imageUrl && (
                  <>
                    <circle cx="43" cy="20" r="2" fill="#78350f" />
                    <circle cx="57" cy="20" r="2" fill="#78350f" />
                    {/* Frown */}
                    <path d="M45 30 Q 50 25 55 30" stroke="#78350f" strokeWidth="1" fill="none" />
                  </>
                )}

                {/* Name written on body */}
                <text x="50" y="65" textAnchor="middle" fontSize="9" fill="#991b1b" fontFamily="serif" fontWeight="bold" className="uppercase">
                  {villain.name.substring(0, 12)}
                </text>
                
                {/* Damage overlays based on hits */}
                {hits > 3 && <path d="M35 45 L 55 55" stroke="red" strokeWidth="2" opacity="0.6" />}
                {hits > 7 && <path d="M75 35 L 45 55" stroke="red" strokeWidth="2" opacity="0.7" />}
                {hits > 12 && <path d="M25 85 L 75 95" stroke="red" strokeWidth="3" opacity="0.8" />}
                {hits > 16 && <path d="M50 15 L 50 120" stroke="red" strokeWidth="4" opacity="0.9" />}
             </svg>

             {/* Custom Avatar Overlay */}
             {villain.imageUrl && (
               <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[40px] h-[40px] rounded-full overflow-hidden border-2 border-amber-900 opacity-90 mix-blend-multiply pointer-events-none">
                 <img src={villain.imageUrl} alt="Villain" className="w-full h-full object-cover grayscale contrast-125" />
               </div>
             )}
           </div>
        </div>

        {/* The Shoe & Impact */}
        {impactEffect && (
           <div 
             className="fixed pointer-events-none z-50"
             style={{ 
               left: impactEffect.x, 
               top: impactEffect.y,
               transform: `translate(-50%, -50%) rotate(${shoeRotation}deg) scale(1.1)`,
             }}
           >
              {/* Shoe SVG */}
              <svg width="140" height="90" viewBox="0 0 100 60" className="drop-shadow-2xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                <path 
                  d="M5 30 Q 5 55 25 58 L 85 58 Q 98 58 98 40 Q 98 22 85 22 L 35 22 Q 5 22 5 30 Z" 
                  fill="#1e293b" 
                  stroke="#fbbf24" 
                  strokeWidth="2"
                />
                <path d="M20 23 C 20 5, 50 5, 50 23" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
                <path d="M20 23 C 20 5, 50 5, 50 23" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeDasharray="2,4" />
              </svg>
              
              <div 
                className="absolute top-0 left-0 -mt-20 -ml-16 text-6xl font-black text-amber-400 animate-bounce"
                style={{ transform: `rotate(${impactEffect.textRotation}deg)` }}
              >
                <span className="drop-shadow-[3px_3px_0_#b45309] stroke-2 stroke-white">
                    {['啪!', '打!', 'POW!', 'SMASH!'][Math.floor(Math.random()*4)]}
                </span>
              </div>
           </div>
        )}
      </div>

      {/* Progress & Instruction & Share */}
      <div className="w-full text-center mt-6 z-30 flex flex-col gap-4">
        <div>
            <p className="text-slate-300 text-sm mb-2 uppercase tracking-widest animate-pulse font-bold">
                {isAssistMode ? t.assistAction.replace('{name}', villain.name) : t.hitInstruction}
            </p>
            <div className="w-full bg-slate-800 h-6 rounded-full overflow-hidden border border-slate-600 shadow-inner relative">
            <div className="absolute inset-0 flex items-center justify-center z-10 text-[10px] font-bold text-white tracking-widest mix-blend-overlay">
                {hits} / {TOTAL_HITS_REQUIRED}
            </div>
            <div 
                className="bg-gradient-to-r from-amber-600 to-red-600 h-full transition-all duration-75 ease-out"
                style={{ width: `${progress}%` }}
            />
            </div>
        </div>

        {/* SOS Button */}
        {!isAssistMode && !isFinished && (
            <div className="relative">
                <button 
                    onClick={handleShare}
                    className="w-full py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-500 rounded text-xs text-amber-500 font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                    <span>📣</span> {t.shareTitle}
                </button>
                {showShareTooltip && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap">
                        {t.copied}
                    </div>
                )}
            </div>
        )}
      </div>

    </div>
  );
};

export default RitualStage;