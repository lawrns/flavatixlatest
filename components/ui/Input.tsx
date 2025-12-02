import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show character count */
  showCount?: boolean;
  /** Success state */
  success?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  size = 'md',
  showCount = false,
  success = false,
  className,
  id,
  maxLength,
  onChange,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    onChange?.(e);
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px] rounded-lg',
    md: 'px-4 py-3 text-base min-h-[44px] rounded-xl',
    lg: 'px-5 py-4 text-lg min-h-[52px] rounded-xl',
  };

  const baseClasses = cn(
    'w-full',
    'bg-white dark:bg-zinc-800/80',
    'border-2',
    'text-zinc-900 dark:text-white',
    'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
    'transition-all duration-200 ease-out',
    'focus:outline-none',
    sizeClasses[size]
  );
  
  const stateClasses = error 
    ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
    : success
    ? 'border-green-400 dark:border-green-500 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 focus:border-primary focus:ring-4 focus:ring-primary/10';
  
  const iconClasses = cn(
    leftIcon && (size === 'sm' ? 'pl-9' : size === 'lg' ? 'pl-12' : 'pl-11'),
    rightIcon && (size === 'sm' ? 'pr-9' : size === 'lg' ? 'pr-12' : 'pr-11')
  );
  
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <div className={cn('flex flex-col gap-1.5', widthClasses)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium text-zinc-700 dark:text-zinc-300',
            'flex items-center justify-between'
          )}
        >
          <span>{label}</span>
          {showCount && maxLength && (
            <span className={cn(
              'text-xs tabular-nums',
              charCount >= maxLength ? 'text-red-500' : 'text-zinc-400'
            )}>
              {charCount}/{maxLength}
            </span>
          )}
        </label>
      )}
      
      {/* Input container */}
      <div className="relative group">
        {/* Left icon */}
        {leftIcon && (
          <div className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2',
            'text-zinc-400 dark:text-zinc-500',
            'group-focus-within:text-primary',
            'transition-colors duration-200',
            'pointer-events-none'
          )}>
            {leftIcon}
          </div>
        )}
        
        {/* Input field */}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            baseClasses,
            stateClasses,
            iconClasses,
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          maxLength={maxLength}
          onChange={handleChange}
          {...props}
        />
        
        {/* Right icon or success checkmark */}
        {(rightIcon || success) && (
          <div className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2',
            'pointer-events-none',
            'transition-colors duration-200',
            success ? 'text-green-500' : 'text-zinc-400 dark:text-zinc-500 group-focus-within:text-primary'
          )}>
            {success ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : rightIcon}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <p
          id={`${inputId}-error`}
          className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      
      {/* Helper text */}
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
});

Input.displayName = 'Input';

export default Input;
