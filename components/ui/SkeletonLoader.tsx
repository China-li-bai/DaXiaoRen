import React from 'react';

interface Props {
  className?: string;
  count?: number;
}

const SkeletonLoader: React.FC<Props> = ({ className = '', count = 1 }) => {
  const skeletons = Array.from({ length: count });

  return (
    <div className={`space-y-4 ${className}`}>
      {skeletons.map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-slate-700/50 rounded-lg"
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        >
          <div className="h-4 bg-slate-600/30 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-600/20 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;