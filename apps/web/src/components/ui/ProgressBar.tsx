'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  colorClass?: string;
  bgColorClass?: string;
  heightClass?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  colorClass = 'bg-primary',
  bgColorClass = 'bg-surface-variant',
  heightClass = 'h-3',
  className = '',
}) => {
  // Ensure progress is bounded between 0 and 100
  const boundedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full rounded-full overflow-hidden ${bgColorClass} ${heightClass} ${className}`}>
      <div
        className={`h-full rounded-full progress-bar-fill ${colorClass}`}
        style={{ width: `${boundedProgress}%` }}
      />
    </div>
  );
};
