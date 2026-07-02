import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label className="text-label-md text-on-surface-variant ml-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            appearance-none bg-surface-container-low border border-surface-variant rounded-xl px-4 py-3
            text-body-lg text-on-surface cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            transition-all disabled:opacity-50
            ${error ? 'border-error focus:ring-error' : ''}
          `}
          {...props}
        >
          <option value="" disabled hidden>Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom arrow indicator */}
        <div className="relative">
          <span className="material-symbols-outlined absolute right-4 -top-10 pointer-events-none text-on-surface-variant">
            expand_more
          </span>
        </div>
        {error && <span className="text-caption text-error ml-1">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
