import React from 'react';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'amber' | 'blue' | 'green' | 'red' | 'purple';
}

const IOSSwitch: React.FC<Props> = ({ 
  checked, 
  onChange, 
  disabled = false, 
  size = 'medium',
  color = 'amber'
}) => {
  const sizeClasses = {
    small: 'w-10 h-6',
    medium: 'w-12 h-7',
    large: 'w-14 h-8'
  };

  const thumbSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const thumbTranslateClasses = {
    small: checked ? 'translate-x-5' : 'translate-x-1',
    medium: checked ? 'translate-x-6' : 'translate-x-1',
    large: checked ? 'translate-x-7' : 'translate-x-1'
  };

  const colorClasses = {
    amber: checked ? 'bg-amber-500' : 'bg-slate-600',
    blue: checked ? 'bg-blue-500' : 'bg-slate-600',
    green: checked ? 'bg-green-500' : 'bg-slate-600',
    red: checked ? 'bg-red-500' : 'bg-slate-600',
    purple: checked ? 'bg-purple-500' : 'bg-slate-600'
  };

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex flex-shrink-0 cursor-pointer rounded-full
        border-2 border-transparent
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-500
        ${sizeClasses[size]}
        ${colorClasses[color]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
      `}
      role="switch"
      aria-checked={checked}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block rounded-full bg-white shadow-lg
          transform transition-transform duration-200 ease-in-out
          ${thumbSizeClasses[size]}
          ${thumbTranslateClasses[size]}
        `}
      />
    </button>
  );
};

export default IOSSwitch;
