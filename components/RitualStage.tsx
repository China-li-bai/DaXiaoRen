import React, { useState, useEffect, useRef } from 'react';
import { VillainData, Language, ChantResponse } from '../types';
import { TRANSLATIONS, TOTAL_HITS_REQUIRED } from '../constants';

interface Props {
  lang: Language;
  villain: VillainData;
  chantData: ChantResponse;
  onComplete: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  tx: string; // translate x css var
  ty: string; // translate y css var
  color: string;
}

// Chinese Pentatonic Scale (Gong, Shang, Jue, Zhi, Yu)
// Frequencies selected to sound pleasant and resonant (C Major Pentatonic based)
// Lower octave for depth, Higher octave for sparkle
const PENTATONIC_SCALE = [
  196.00, // G3 (Zhi - Low)
  261.63, // C4 (Gong - Middle)
  293.66, // D4 (Shang)
  329.63, // E4 (Jue)
  392.00, // G4 (Zhi)
  440.00, // A4 (Yu)
  523.25, // C5 (Gong - High)
];

const RitualStage: React.FC<Props> = ({ lang, villain, chantData, onComplete }) => {
  const t = TRANSLATIONS[lang];
  const [hits, setHits] = useState(0);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [shoeRotation, setShoeRotation] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [impactEffect, setImpactEffect] = useState<{x: number, y: number, id: number, textRotation: number} | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Audio Context Ref (initialized lazily)
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playCosmicEcho = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const t = ctx.currentTime;
    
    // Pick a random note from the Pentatonic scale
    const baseFreq = PENTATONIC_SCALE[Math.floor(Math.random() * PENTATONIC_SCALE.length)];

    // We create a "Singing Bowl" / "Cosmic Bell" effect
    // 1. Main Tone (Fundamental)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, t);

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(0.3, t + 0.05); // Soft attack
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 3.0); // Very long release (Echo)

    // 2. Overtone (Harmonic) - Creates the metallic/glassy timbre
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    // Using 1.5 (Perfect Fifth) or slightly detuned for beat frequency
    osc2.frequency.setValueAtTime(baseFreq * 1.5, t); 

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.1, t + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 2.5); // Slightly shorter release

    // 3. Stereo Panning (Randomly place the sound in space)
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(Math.random() * 2 - 1, t); // Random value between -1 (Left) and 1 (Right)

    // Connect Nodes
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(panner);
    gain2.connect(panner);
    panner.connect(ctx.destination);

    // Start and Stop
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 4.0); // Allow tail to fade
    osc2.stop(t + 4.0);
  };

  const handleHit = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent multi-touch spamming too fast
    const now = Date.now();
    if (now - lastHitTime < 100) return; 
    setLastHitTime(now);

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    // 1. Play Cosmic Sound
    playCosmicEcho();

    // 2. Visual Shake
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 200);

    // 3. Visual Impact (Shoe + Text)
    setShoeRotation(Math.random() * 60 - 30); // Random rotation -30 to 30
    setImpactEffect({ 
      x: clientX, 
      y: clientY, 
      id: now,
      textRotation: Math.random() * 40 - 20 
    });

    // 4. Particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 100;
      const tx = Math.cos(angle) * dist + 'px';
      const ty = Math.sin(angle) * dist + 'px';
      newParticles.push({
        id: Math.random(),
        x: clientX,
        y: clientY,
        tx,
        ty,
        // Colors: Gold, White, Cyan (Cosmic/Spiritual colors) instead of Red/Orange
        color: ['#fbbf24', '#ffffff', '#22d3ee', '#f87171'][Math.floor(Math.random()*4)]
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    // Clean up particles after animation (duration matched to CSS)
    setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 1500);


    // 5. Haptic feedback
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

    const newHits = hits + 1;
    setHits(newHits);

    if (newHits >= TOTAL_HITS_REQUIRED) {
      setTimeout(onComplete, 1000); // Slightly longer delay to relish the victory
    }
  };

  // Reset impact effect quickly
  useEffect(() => {
    if (impactEffect) {
      const timer = setTimeout(() => setImpactEffect(null), 150);
      return () => clearTimeout(timer);
    }
  }, [impactEffect]);

  const progress = (hits / TOTAL_HITS_REQUIRED) * 100;
  const isFinished = hits >= TOTAL_HITS_REQUIRED;

  return (
    <div className="flex flex-col items-center justify-between h-full w-full max-w-2xl mx-auto relative select-none">
      
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
      <div className="bg-black/60 p-4 rounded-lg border border-red-800 text-center mb-4 w-full backdrop-blur-sm z-30">
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

        {/* The Paper Villain */}
        <div 
          className={`relative transition-all duration-75 ease-in-out transform flex flex-col items-center justify-center
            ${isShaking ? 'shake-hard' : ''}
            ${impactEffect ? 'scale-95' : 'scale-100'}
            ${isFinished ? 'opacity-0 scale-50 filter blur-xl transition-all duration-700' : 'opacity-100'}
          `}
        >
           {/* SVG representation of a "Petty Person" paper cutout */}
           <div className="relative">
             <svg width="200" height="260" viewBox="0 0 100 130" className="drop-shadow-2xl">
                <path 
                  d="M50 5 C 40 5, 35 15, 35 25 C 35 35, 40 40, 30 45 L 20 50 L 30 55 C 25 70, 25 90, 30 110 L 25 125 L 45 120 L 50 125 L 55 120 L 75 125 L 70 110 C 75 90, 75 70, 70 55 L 80 50 L 70 45 C 60 40, 65 35, 65 25 C 65 15, 60 5, 50 5 Z" 
                  fill="#fde68a" 
                  stroke="#b45309" 
                  strokeWidth="2"
                />
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
                <text x="50" y="70" textAnchor="middle" fontSize="8" fill="#991b1b" fontFamily="serif" fontWeight="bold">
                  {villain.name.substring(0, 10)}
                </text>
                
                {/* Damage overlays based on hits */}
                {hits > 3 && <path d="M30 45 L 50 55" stroke="red" strokeWidth="2" opacity="0.7" />}
                {hits > 6 && <path d="M70 40 L 40 50" stroke="red" strokeWidth="2" opacity="0.7" />}
                {hits > 10 && <path d="M25 80 L 75 90" stroke="red" strokeWidth="2" opacity="0.8" />}
                {hits > 15 && <path d="M50 10 L 50 120" stroke="red" strokeWidth="3" opacity="0.9" />}
             </svg>

             {/* Custom Avatar Overlay */}
             {villain.imageUrl && (
               <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[40px] h-[40px] rounded-full overflow-hidden border border-amber-800 opacity-80 mix-blend-multiply pointer-events-none">
                 <img src={villain.imageUrl} alt="Villain" className="w-full h-full object-cover grayscale contrast-125" />
               </div>
             )}
           </div>
        </div>

        {/* The Shoe & Impact (follows click) */}
        {impactEffect && (
           <div 
             className="fixed pointer-events-none z-50"
             style={{ 
               left: impactEffect.x, 
               top: impactEffect.y,
               transform: `translate(-50%, -50%) rotate(${shoeRotation}deg) scale(1.2)`,
             }}
           >
              {/* Shoe SVG */}
              <svg width="120" height="80" viewBox="0 0 100 60" className="drop-shadow-lg">
                <path 
                  d="M10 30 Q 10 50 30 55 L 80 55 Q 95 55 95 40 Q 95 25 80 20 L 40 20 Q 10 10 10 30 Z" 
                  fill="#1e293b" 
                  stroke="#fbbf24" 
                  strokeWidth="2"
                />
                <path d="M15 35 L 35 35" stroke="#fbbf24" strokeWidth="1" />
              </svg>
              
              {/* Pow Effect Text */}
              <div 
                className="absolute top-0 left-0 -mt-16 -ml-16 text-5xl font-black text-amber-300 animate-bounce"
                style={{ transform: `rotate(${impactEffect.textRotation}deg)` }}
              >
                <span className="drop-shadow-[2px_2px_0_rgba(180,83,9,1)]">BANG!</span>
              </div>
           </div>
        )}
      </div>

      {/* Progress & Instruction */}
      <div className="w-full text-center mt-6 z-30">
        <p className="text-slate-300 text-sm mb-2 uppercase tracking-widest animate-pulse">{t.hitInstruction}</p>
        <div className="w-full bg-slate-700 h-6 rounded-full overflow-hidden border-2 border-slate-600 shadow-inner relative">
           <div className="absolute inset-0 flex items-center justify-center z-10 text-[10px] font-bold text-white mix-blend-difference">
             {hits} / {TOTAL_HITS_REQUIRED}
           </div>
          <div 
            className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 h-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

    </div>
  );
};

export default RitualStage;