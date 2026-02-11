import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const GlassCard: React.FC<Props> = ({ children, className = '', onClick, hover = false }) => {
  const baseClasses = `
    bg-slate-800/70
    backdrop-blur-xl
    border border-white/10
    rounded-2xl
    shadow-2xl
    transition-all
    duration-300
    ease-out
  `;

  const hoverClasses = hover ? `
    hover:bg-slate-700/80
    hover:scale-[1.02]
    hover:shadow-amber-500/20
    cursor-pointer
  ` : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;