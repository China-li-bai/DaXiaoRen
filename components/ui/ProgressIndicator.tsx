import React from 'react';

interface Props {
  current: number;
  total: number;
  lang: 'zh' | 'en';
}

const ProgressIndicator: React.FC<Props> = ({ current, total, lang }) => {
  const progress = (current / total) * 100;
  const steps = Array.from({ length: total });

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm">
          {lang === 'zh' ? `步骤 ${current} / ${total}` : `Step ${current} / ${total}`}
        </span>
        <span className="text-amber-500 font-bold text-sm">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {steps.map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < current;
          const isCurrent = stepNumber === current;
          const isFuture = stepNumber > current;

          return (
            <div
              key={index}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                ${isCompleted ? 'bg-amber-500 text-white' : ''}
                ${isCurrent ? 'bg-amber-500 text-white ring-4 ring-amber-500/30' : ''}
                ${isFuture ? 'bg-slate-700 text-slate-400' : ''}
              `}
            >
              {isCompleted ? '✓' : stepNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;