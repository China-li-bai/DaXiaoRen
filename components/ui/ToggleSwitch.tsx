import React, { useState } from 'react';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  lang?: 'zh' | 'en';
}

const ToggleSwitch: React.FC<Props> = ({ checked, onChange, label, disabled = false, lang = 'zh' }) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = () => {
    if (disabled || isToggling) return;

    setIsToggling(true);
    onChange(!checked);

    setTimeout(() => {
      setIsToggling(false);
    }, 200);
  };

  return (
    <div className="flex items-center gap-3">
      {label && (
        <span className="text-slate-300 text-sm font-medium">{label}</span>
      )}
      <button
        onClick={handleToggle}
        disabled={disabled || isToggling}
        className={`
          relative w-14 h-8 rounded-full p-1 transition-all duration-300 ease-out
          ${checked ? 'bg-amber-500' : 'bg-slate-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isToggling ? 'scale-95' : ''}
        `}
        style={{
          boxShadow: checked ? '0 0 0 0 rgba(245, 158, 11, 0.3)' : 'none'
        }}
      >
        <div
          className={`
            w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ease-out
            ${checked ? 'translate-x-6' : 'translate-x-0'}
          `}
          style={{
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;