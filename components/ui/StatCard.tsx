import React from 'react';

interface Props {
  title: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  color?: 'amber' | 'blue' | 'green' | 'red' | 'purple';
}

const StatCard: React.FC<Props> = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  className = '',
  color = 'amber'
}) => {
  const colorClasses = {
    amber: 'from-amber-500 to-orange-500',
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-500',
    red: 'from-red-500 to-pink-500',
    purple: 'from-purple-500 to-pink-500'
  };

  const trendIcon = {
    up: '↑',
    down: '↓',
    neutral: '→'
  };

  return (
    <div
      className={`
        bg-slate-800/70
        backdrop-blur-xl
        border border-white/10
        rounded-2xl
        p-6
        transition-all
        duration-300
        ease-out
        hover:scale-[1.02]
        hover:shadow-2xl
        ${className}
      `}
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="text-3xl">{icon}</span>
          )}
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">
              {title}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent">
                {value}
              </span>
              {trend && trendValue && (
                <span
                  className={`
                    text-sm font-medium
                    ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'}
                  `}
                >
                  {trendIcon[trend]} {trendValue}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className="h-1 rounded-full bg-gradient-to-r opacity-30"
        style={{
          background: `linear-gradient(to right, ${colorClasses[color]})`
        }}
      />
    </div>
  );
};

export default StatCard;