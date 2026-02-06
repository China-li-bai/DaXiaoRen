import React, { useState, useEffect, useRef } from 'react';
import usePartySocket from 'partysocket/react';
import { VillainData, Language, ChantResponse } from '../types';
import { TRANSLATIONS, TOTAL_HITS_REQUIRED } from '../constants';
import Villain from './Villain';
import Shoe from './Shoe';
import { getPartyKitHost } from '../config/partykit';

interface Props {
  lang: Language;
  villain: VillainData;
  chantData: ChantResponse;
  onComplete: () => void;
  isAssistMode?: boolean;
  roomId?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  tx: string; // translate x css var
  ty: string; // translate y css var
  color: string;
}

interface RemoteHit {
  id: number;
  timestamp: number;
}

const RitualStage: React.FC<Props> = ({ lang, villain, chantData, onComplete, isAssistMode = false, roomId }) => {
  const t = TRANSLATIONS[lang];
  const [hits, setHits] = useState(0);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [shoeRotation, setShoeRotation] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [impactEffect, setImpactEffect] = useState<{x: number, y: number, id: number, textRotation: number} | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [remoteHits, setRemoteHits] = useState<RemoteHit[]>([]);
  const [leaderboardSent, setLeaderboardSent] = useState(false);

  const currentRoomId = roomId || `room-${villain.name}-${villain.type}`;

  const gameSocket = usePartySocket({
    host: getPartyKitHost(),
    room: currentRoomId,
    onMessage(event) {
      const msg = JSON.parse(event.data);
      if (msg.type === 'HIT_UPDATE') {
        setHits(msg.totalHits);
        if (msg.damage) {
          const remoteHit: RemoteHit = {
            id: Date.now(),
            timestamp: Date.now()
          };
          setRemoteHits(prev => [...prev, remoteHit]);
          setTimeout(() => {
            setRemoteHits(prev => prev.filter(h => h.id !== remoteHit.id));
          }, 1000);
        }
      } else if (msg.type === 'USER_JOINED') {
        setOnlineCount(msg.count);
      } else if (msg.type === 'USER_LEFT') {
        setOnlineCount(msg.count);
      } else if (msg.type === 'SYNC') {
        setHits(msg.state.totalHits);
        setOnlineCount(msg.onlineCount);
        
        // If the room is already completed, trigger completion
        if (msg.state.status === 'COMPLETED' && !isComplete) {
          setIsComplete(true);
          setTimeout(onComplete, 800);
        }
      } else if (msg.type === 'EMOJI_BROADCAST') {
        const emojiHit: RemoteHit = {
          id: Date.now(),
          timestamp: Date.now()
        };
        setRemoteHits(prev => [...prev, emojiHit]);
        setTimeout(() => {
          setRemoteHits(prev => prev.filter(h => h.id !== emojiHit.id));
        }, 2000);
      } else if (msg.type === 'COMPLETION') {
        // When another user completes the ritual, trigger completion
        if (!isComplete) {
          setIsComplete(true);
          setTimeout(onComplete, 800);
        }
      }
    }
  });

  const leaderboardSocket = usePartySocket({
    host: getPartyKitHost(),
    room: 'global-leaderboard',
    onConnect() {
      console.log('✅ RitualStage leaderboard socket connected');
    }
  });

  // Combo System
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  
  // Audio Context Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
        
        // Create a buffer for White Noise (reused for the "Slap" friction sound)
        const bufferSize = audioCtxRef.current.sampleRate * 2; // 2 seconds buffer
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

  // Synthesize a "Slipper Slap" sound
  const playSlipperHit = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const buffer = noiseBufferRef.current;
    if (!ctx || !buffer) return;

    const t = ctx.currentTime;
    
    // Randomize pitch/tone slightly for realism
    const randomDetune = (Math.random() - 0.5) * 200; // +/- 100 cents
    const randomDecay = 0.08 + Math.random() * 0.05;

    // --- Layer 1: The "Crack" (High Freq Noise) ---
    // Simulates the slipper hitting the paper/surface
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1500, t); // Dull the noise slightly
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); // Fast decay

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSrc.start(t);
    noiseSrc.stop(t + 0.1);

    // --- Layer 2: The "Thud" (Body Impact) ---
    // Simulates the force of the hit
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200 + (randomDetune / 5), t); // Start pitch
    osc.frequency.exponentialRampToValueAtTime(40, t + randomDecay); // Pitch drop (Kick drum style)
    
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(1.0, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + randomDecay + 0.05);

    // Distortion to make it sound "dirty" (like hitting a brick)
    const distortion = ctx.createWaveShaper();
    distortion.curve = makeDistortionCurve(400); // 400 is amount
    distortion.oversample = '4x';

    osc.connect(distortion);
    distortion.connect(oscGain);
    oscGain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.2);
  };

  // Utility for distortion curve
  function makeDistortionCurve(amount: number) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  const handleHit = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    // Allow faster hitting (reduced debounce from 100ms to 60ms) for frenzy mode
    if (now - lastHitTime < 60) return; 
    
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
    
    // 1. Play Realistic Slap
    playSlipperHit();

    // 2. Visual Shake
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 150);

    // 3. Visual Impact (Shoe + Text)
    setShoeRotation(Math.random() * 60 - 30); 
    setImpactEffect({ 
      x: clientX, 
      y: clientY, 
      id: now,
      textRotation: Math.random() * 40 - 20 
    });

    // 4. Particles (Add some "paper scraps" or sparks)
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
        color: ['#fff', '#fbbf24', '#ef4444'][Math.floor(Math.random()*3)] // White/Gold/Red
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 1000);

    // 5. Haptic feedback (Stronger pattern)
    if (navigator.vibrate) navigator.vibrate(50);

    const newHits = hits + 1;
    setHits(newHits);

    // 6. Send HIT to PartyKit for real-time sync
    gameSocket.send(JSON.stringify({
      type: 'HIT',
      damage: 1
    }));

    // 7. Send LB_CLICK to leaderboard every 20 hits (performance optimization)
    if (newHits % 20 === 0 && !leaderboardSent) {
      leaderboardSocket.send(JSON.stringify({
        type: 'LB_CLICK',
        villainName: villain.name,
        villainType: villain.type
      }));
      setLeaderboardSent(true);
      setTimeout(() => setLeaderboardSent(false), 5000);
    }

    if (newHits >= TOTAL_HITS_REQUIRED && !isComplete) {
      setIsComplete(true);
      
      // Send COMPLETION message to PartyKit
      gameSocket.send(JSON.stringify({
        type: 'COMPLETION',
        isAssistMode: isAssistMode
      }));
      
      // Only call onComplete if not in assist mode
      if (!isAssistMode) {
        setTimeout(onComplete, 800);
      }
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger hit
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'assist');
    url.searchParams.set('name', villain.name);
    url.searchParams.set('type', villain.type);
    url.searchParams.set('reason', villain.reason);
    
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

  // Reset impact effect quickly
  useEffect(() => {
    if (impactEffect) {
      const timer = setTimeout(() => setImpactEffect(null), 100); // Faster reset for rapid fire
      return () => clearTimeout(timer);
    }
  }, [impactEffect]);
  
  // Reset Combo text fade out
  useEffect(() => {
      if (showCombo) {
          const timer = setTimeout(() => setShowCombo(false), 2000);
          return () => clearTimeout(timer);
      }
  }, [showCombo, combo]);

  // Initialize room on mount
  useEffect(() => {
    gameSocket.send(JSON.stringify({
      type: 'INIT',
      villainName: villain.name,
      villainType: villain.type
    }));
  }, [gameSocket, villain.name, villain.type]);

  const progress = (hits / TOTAL_HITS_REQUIRED) * 100;
  const isFinished = isComplete || hits >= TOTAL_HITS_REQUIRED;

  return (
    <div className="flex flex-col items-center justify-between h-full w-full max-w-2xl mx-auto relative select-none">
      
      {/* Online Count Badge */}
      <div className="absolute top-2 right-2 z-50 bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-full px-3 py-1 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs font-bold text-slate-300">
          {onlineCount} {onlineCount === 1 ? 'Online' : 'Online'}
        </span>
      </div>

      {/* Assist Mode Banner */}
      {isAssistMode && (
        <div className="absolute top-[-40px] z-50 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold animate-bounce shadow-lg border border-red-400">
           {t.assistWelcome}
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
        
        {/* COMBO COUNTER (New Social/Game Feature) */}
        <div className={`absolute top-0 right-0 z-40 transform transition-all duration-200 pointer-events-none ${showCombo ? 'scale-110 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="text-4xl font-black text-yellow-400 italic drop-shadow-[4px_4px_0_rgba(185,28,28,1)] stroke-black" style={{ textShadow: '0 0 10px red' }}>
                {combo} COMBO!
            </div>
        </div>

        {/* The Paper Villain */}
        <Villain 
          villain={villain}
          hits={hits}
          isShaking={isShaking}
          isFinished={isFinished}
          hasImpact={!!impactEffect}
          remoteHitsCount={remoteHits.length}
        />

        {/* The Shoe & Impact (follows click) */}
        {impactEffect && (
           <div 
             className="fixed pointer-events-none z-50"
             style={{ 
               left: impactEffect.x, 
               top: impactEffect.y,
               transform: `translate(-50%, -50%)`,
             }}
           >
              <Shoe 
                rotation={shoeRotation} 
                scale={1.1} 
                showText={true}
                textRotation={impactEffect.textRotation}
              />
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

        {/* SOS Button (Only show if NOT in assist mode and not finished) */}
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