'use client';

import React from 'react';

export interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconName: string;
  title: string;
  description: string;
  iconColorClass: string;
  hoverColorClass?: string;
  selected?: boolean;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  iconName,
  title,
  description,
  iconColorClass,
  hoverColorClass = 'hover:text-primary',
  selected = false,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`tactile-button group text-left p-8 rounded-[32px] flex flex-col gap-4 border transition-all ${
        selected
          ? 'selected ring-2 ring-primary bg-primary-container/10 border-primary'
          : 'bg-white border-surface-variant hover:border-primary/30'
      } ${className}`}
      {...props}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconColorClass}`}>
        <span className="material-symbols-outlined text-[32px] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
          {iconName}
        </span>
      </div>
      <div>
        <h3 className={`font-headline-md text-on-surface transition-colors ${hoverColorClass}`}>
          {title}
        </h3>
        <p className="font-body-md text-on-surface-variant mt-1">
          {description}
        </p>
      </div>
    </button>
  );
};
