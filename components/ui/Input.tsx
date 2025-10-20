import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = 'bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white rounded-lg px-3.5 py-3 min-h-[44px] focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500';
  
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '';
  const iconClasses = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <div className={cn('flex flex-col gap-1', widthClasses)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          className={cn(
            baseClasses,
            errorClasses,
            iconClasses,
            widthClasses,
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p
          id={`${inputId}-helper`}
          className="text-sm text-zinc-500 dark:text-zinc-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
