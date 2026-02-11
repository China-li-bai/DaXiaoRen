import React, { useState } from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: string;
  className?: string;
}

const CollapsibleSection: React.FC<Props> = ({
  title,
  children,
  defaultOpen = false,
  icon,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-slate-800/70 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 ease-out ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span className="text-xl">{icon}</span>
          )}
          <h3 className="text-white font-bold text-lg">{title}</h3>
        </div>
        <span
          className={`
            text-slate-400 text-2xl transition-transform duration-300 ease-out
            ${isOpen ? 'rotate-180' : 'rotate-0'}
          `}
        >
          ▼
        </span>
      </button>
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-out
          ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;