import React from 'react';

interface ShoeProps {
  rotation?: number;
  scale?: number;
  showText?: boolean;
  textRotation?: number;
}

const Shoe: React.FC<ShoeProps> = ({ rotation = 0, scale = 1, showText = true, textRotation = 0 }) => {
  return (
    <div 
      className="relative"
      style={{ 
        transform: `rotate(${rotation}deg) scale(${scale})`,
      }}
    >
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
      
      {showText && (
        <div 
          className="absolute top-0 left-0 -mt-20 -ml-16 text-6xl font-black text-amber-400 animate-bounce"
          style={{ transform: `rotate(${textRotation}deg)` }}
        >
          <span className="drop-shadow-[3px_3px_0_#b45309] stroke-2 stroke-white">
            {['啪!', '打!', 'POW!', 'SMASH!'][Math.floor(Math.random()*4)]}
          </span>
        </div>
      )}
    </div>
  );
};

export default Shoe;
