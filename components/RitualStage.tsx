import React, { useState, useEffect, useRef } from 'react';
import { VillainData, Language, ChantResponse } from '../types';
import { TRANSLATIONS, TOTAL_HITS_REQUIRED } from '../constants';

interface Props {
  lang: Language;
  villain: VillainData;
  chantData: ChantResponse;
  onComplete: () => void;
}

const RitualStage: React.FC<Props> = ({ lang, villain, chantData, onComplete }) => {
  const t = TRANSLATIONS[lang];
  const [hits, setHits] = useState(0);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [shoeRotation, setShoeRotation] = useState(0);
  const [impactEffect, setImpactEffect] = useState<{x: number, y: number, id: number} | null>(null);
  
  // Audio refs (using simple oscillator for demo purposes to avoid external assets)
  // In a real app, use Audio objects with mp3 files.
  
  const handleHit = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent multi-touch spamming too fast
    const now = Date.now();
    if (now - lastHitTime < 100) return; 
    setLastHitTime(now);

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    // Visual effect
    setShoeRotation(Math.random() * 40 - 20); // Random rotation
    setImpactEffect({ x: clientX, y: clientY, id: now });

    // Haptic feedback if available
    if (navigator.vibrate) navigator.vibrate(50);

    const newHits = hits + 1;
    setHits(newHits);

    if (newHits >= TOTAL_HITS_REQUIRED) {
      setTimeout(onComplete, 500);
    }
  };

  // Reset impact effect quickly
  useEffect(() => {
    if (impactEffect) {
      const timer = setTimeout(() => setImpactEffect(null), 200);
      return () => clearTimeout(timer);
    }
  }, [impactEffect]);

  const progress = (hits / TOTAL_HITS_REQUIRED) * 100;
  const isFinished = hits >= TOTAL_HITS_REQUIRED;

  return (
    <div className="flex flex-col items-center justify-between h-full w-full max-w-2xl mx-auto relative select-none">
      
      {/* Chant Display */}
      <div className="bg-black/60 p-4 rounded-lg border border-red-800 text-center mb-4 w-full backdrop-blur-sm">
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
        className="relative w-full h-80 md:h-96 flex items-center justify-center cursor-pointer active:cursor-grabbing group"
        onClick={handleHit}
      >
        {/* Background Aura */}
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-red-900/20 rounded-full blur-3xl transition-opacity duration-300 ${isFinished ? 'opacity-0' : 'opacity-100'}`} />

        {/* The Paper Villain */}
        <div 
          className={`relative transition-all duration-100 ease-in-out transform flex flex-col items-center justify-center
            ${impactEffect ? 'scale-95 translate-y-2' : 'scale-100'}
            ${isFinished ? 'opacity-0 scale-50 filter blur-xl transition-all duration-700' : 'opacity-100'}
          `}
        >
           {/* Simple SVG representation of a "Petty Person" paper cutout */}
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
                {hits > 5 && <path d="M30 45 L 70 55" stroke="red" strokeWidth="1" opacity="0.6" />}
                {hits > 10 && <path d="M25 80 L 75 90" stroke="red" strokeWidth="1" opacity="0.6" />}
                {hits > 15 && <path d="M50 10 L 50 120" stroke="red" strokeWidth="1" opacity="0.6" />}
             </svg>

             {/* Custom Avatar Overlay */}
             {villain.imageUrl && (
               <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[40px] h-[40px] rounded-full overflow-hidden border border-amber-800 opacity-80 mix-blend-multiply pointer-events-none">
                 <img src={villain.imageUrl} alt="Villain" className="w-full h-full object-cover grayscale contrast-125" />
               </div>
             )}
           </div>
        </div>

        {/* The Shoe (Visual only, follows click roughly or just appears on hit) */}
        {impactEffect && (
           <div 
             className="absolute pointer-events-none z-20"
             style={{ 
               left: '50%', 
               top: '50%',
               transform: `translate(-50%, -50%) rotate(${shoeRotation}deg) scale(1.2)`,
             }}
           >
              {/* Shoe SVG */}
              <svg width="120" height="80" viewBox="0 0 100 60">
                <path 
                  d="M10 30 Q 10 50 30 55 L 80 55 Q 95 55 95 40 Q 95 25 80 20 L 40 20 Q 10 10 10 30 Z" 
                  fill="#1e293b" 
                  stroke="#fbbf24" 
                  strokeWidth="2"
                />
                <path d="M15 35 L 35 35" stroke="#fbbf24" strokeWidth="1" />
              </svg>
              {/* Pow Effect */}
              <div className="absolute top-0 left-0 -mt-10 -ml-10 text-4xl font-black text-red-600 animate-ping">
                POW!
              </div>
           </div>
        )}
      </div>

      {/* Progress & Instruction */}
      <div className="w-full text-center mt-6">
        <p className="text-slate-300 text-sm mb-2 uppercase tracking-widest">{t.hitInstruction}</p>
        <div className="w-full bg-slate-700 h-4 rounded-full overflow-hidden border border-slate-600">
          <div 
            className="bg-gradient-to-r from-red-600 to-amber-500 h-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-amber-500 font-mono mt-2">
          {hits} / {TOTAL_HITS_REQUIRED}
        </p>
      </div>

    </div>
  );
};

export default RitualStage;
