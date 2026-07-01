'use client';

import React, { useEffect, useState } from 'react';

interface ProgressRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  score,
  size = 192,
  strokeWidth = 12,
}) => {
  const [offset, setOffset] = useState(0);
  
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const progressOffset = circumference - (score / 100) * circumference;
    // Short timeout to ensure the animation triggers after mount
    const timeout = setTimeout(() => setOffset(progressOffset), 50);
    return () => clearTimeout(timeout);
  }, [score, circumference]);

  // Initial state is empty ring (full offset)
  const initialOffset = circumference;

  let colorClass = 'text-status-success';
  if (score < 50) colorClass = 'text-status-danger';
  else if (score < 75) colorClass = 'text-status-warning';

  let statusText = 'OPTIMAL';
  if (score < 50) statusText = 'NEEDS WORK';
  else if (score < 75) statusText = 'GOOD';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="text-surface-variant"
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <circle
          className={`${colorClass} transition-all duration-1000 ease-out`}
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset || initialOffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-display-lg text-ink-text">{score}</span>
        <span className="text-caption text-on-surface-variant uppercase mt-1">
          {statusText}
        </span>
      </div>
    </div>
  );
};
