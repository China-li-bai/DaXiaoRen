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
      <div className="flex items-center justify-between mb-2 font-mono">
        <span className="text-[#4A4A4A] text-xs">
          STEP [{current}/{total}]
        </span>
        <span className="text-[#FFD700] font-bold text-xs">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-2 bg-black border-2 border-[#4A4A4A] rounded-sm overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-3">
        {steps.map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < current;
          const isCurrent = stepNumber === current;
          const isFuture = stepNumber > current;

          return (
            <div
              key={index}
              className={`
                w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-all duration-300 font-mono border-2
                ${isCompleted ? 'bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41]' : ''}
                ${isCurrent ? 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700] animate-pulse' : ''}
                ${isFuture ? 'bg-black border-[#4A4A4A] text-[#4A4A4A]' : ''}
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
