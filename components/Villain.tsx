import React from 'react';
import { VillainData } from '../types';
import Shoe from './Shoe';

interface VillainProps {
  villain: VillainData;
  hits: number;
  isShaking: boolean;
  isFinished: boolean;
  hasImpact?: boolean;
  remoteHitsCount?: number;
}

const Villain: React.FC<VillainProps> = ({ villain, hits, isShaking, isFinished, hasImpact = false, remoteHitsCount = 0 }) => {
  return (
    <div 
      className={`relative transition-all duration-75 ease-in-out transform flex flex-col items-center justify-center
        ${isShaking ? 'shake-hard' : ''}
        ${hasImpact ? 'scale-90' : 'scale-100'}
        ${isFinished ? 'opacity-0 scale-50 filter blur-xl transition-all duration-700' : 'opacity-100'}
      `}
    >
      <div className="relative">
        <svg width="200" height="260" viewBox="0 0 100 130" className="drop-shadow-2xl">
          <path 
            d="M50 5 C 40 5, 35 15, 35 25 C 35 35, 40 40, 30 45 L 20 50 L 30 55 C 25 70, 25 90, 30 110 L 25 125 L 45 120 L 50 125 L 55 120 L 75 125 L 70 110 C 75 90, 75 70, 70 55 L 80 50 L 70 45 C 60 40, 65 35, 65 25 C 65 15, 60 5, 50 5 Z" 
            fill="#fde68a" 
            stroke="#b45309" 
            strokeWidth="2"
          />
          
          <path d="M50 10 L 50 115" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />

          {!villain.imageUrl && (
            <>
              <circle cx="43" cy="20" r="2" fill="#78350f" />
              <circle cx="57" cy="20" r="2" fill="#78350f" />
              <path d="M45 30 Q 50 25 55 30" stroke="#78350f" strokeWidth="1" fill="none" />
            </>
          )}

          <text x="50" y="65" textAnchor="middle" fontSize="9" fill="#991b1b" fontFamily="serif" fontWeight="bold" className="uppercase">
            {villain.name.substring(0, 12)}
          </text>
          
          {hits > 3 && <path d="M35 45 L 55 55" stroke="red" strokeWidth="2" opacity="0.6" />}
          {hits > 7 && <path d="M75 35 L 45 55" stroke="red" strokeWidth="2" opacity="0.7" />}
          {hits > 12 && <path d="M25 85 L 75 95" stroke="red" strokeWidth="3" opacity="0.8" />}
          {hits > 16 && <path d="M50 15 L 50 120" stroke="red" strokeWidth="4" opacity="0.9" />}
        </svg>

        {villain.imageUrl && (
          <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[40px] h-[40px] rounded-full overflow-hidden border-2 border-amber-900 opacity-90 mix-blend-multiply pointer-events-none">
            <img src={villain.imageUrl} alt="Villain" className="w-full h-full object-cover grayscale contrast-125" />
          </div>
        )}

        {/* Remote Hit Shoes - Fixed on Villain */}
        {remoteHitsCount > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 animate-bounce">
            <Shoe rotation={Math.random() * 60 - 30} scale={1.1} showText={false} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Villain;
