import React, { useRef, useState, useId } from 'react';
import { cn } from '@/lib/utils';

interface RippleEffect {
  x: number;
  y: number;
  id: number;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  /** Enable ripple effect on click */
  ripple?: boolean;
  /** Rounded pill style */
  pill?: boolean;
  /** Loading text for screen readers */
  loadingText?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ripple = true,
  pill = false,
  loadingText = 'Loading...',
  disabled,
  onClick,
  'aria-label': ariaLabel,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const loadingId = useId();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { x, y, id: Date.now() };
      
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }
    
    onClick?.(e);
  };

  const baseClasses = cn(
    'relative inline-flex items-center justify-center font-semibold overflow-hidden',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    'active:scale-[0.98]',
    pill ? 'rounded-full' : 'rounded-[14px]'
  );
  
  const variantClasses = {
    // Gemini-style primary button - solid rust red
    primary: cn(
      'bg-primary text-white',
      'shadow-sm hover:opacity-90',
      'focus-visible:ring-primary/50'
    ),
    // Gemini-style secondary button - soft gray background
    secondary: cn(
      'bg-gemini-card dark:bg-zinc-800 text-gemini-text-dark dark:text-white',
      'hover:bg-gray-200 dark:hover:bg-zinc-700',
      'focus-visible:ring-zinc-400'
    ),
    // Gemini-style outline button
    outline: cn(
      'bg-transparent border border-gemini-border text-gemini-text-dark dark:text-white',
      'hover:bg-gray-50 dark:hover:bg-zinc-800',
      'focus-visible:ring-primary/30'
    ),
    // Gemini-style ghost button
    ghost: cn(
      'bg-transparent text-primary',
      'hover:bg-gray-50 dark:hover:bg-zinc-800',
      'focus-visible:ring-primary/30'
    ),
    danger: cn(
      'bg-red-500 text-white',
      'shadow-sm hover:bg-red-600',
      'focus-visible:ring-red-500/50'
    ),
    success: cn(
      'bg-gemini-success text-white',
      'shadow-sm hover:opacity-90',
      'focus-visible:ring-green-500/50'
    ),
    gradient: cn(
      'bg-gradient-to-r from-primary to-red-600 text-white',
      'shadow-sm hover:opacity-90',
      'focus-visible:ring-primary/50'
    ),
  };

  const sizeClasses = {
    sm: 'px-3.5 py-2 text-sm min-h-[36px] gap-1.5',
    md: 'px-5 py-2.5 text-base min-h-[44px] gap-2',
    lg: 'px-6 py-3 text-lg min-h-[52px] gap-2.5',
    xl: 'px-8 py-4 text-xl min-h-[60px] gap-3',
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={buttonRef}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClasses,
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-describedby={loading ? loadingId : undefined}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          style={{
            left: r.x,
            top: r.y,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      
      {/* Loading spinner with screen reader text */}
      {loading && (
        <>
          <svg
            className="animate-spin h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span id={loadingId} className="sr-only">{loadingText}</span>
        </>
      )}
      
      {/* Left icon */}
      {!loading && icon && iconPosition === 'left' && (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      
      {/* Button text */}
      <span className="relative z-10">{children}</span>
      
      {/* Right icon */}
      {!loading && icon && iconPosition === 'right' && (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button;
