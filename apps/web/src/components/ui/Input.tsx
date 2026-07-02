import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label className="text-label-md text-on-surface-variant ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            bg-surface-container-low border border-surface-variant rounded-xl px-4 py-3
            text-body-lg text-on-surface placeholder:text-on-surface-variant/50
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            transition-all disabled:opacity-50
            ${error ? 'border-error focus:ring-error' : ''}
          `}
          {...props}
        />
        {error && <span className="text-caption text-error ml-1">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
