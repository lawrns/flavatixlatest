import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RippleEffect {
  x: number;
  y: number;
  id: number;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  /** Enable ripple effect on click */
  ripple?: boolean;
  /** Rounded pill style */
  pill?: boolean;
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
  disabled,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<RippleEffect[]>([]);

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
    'transition-all duration-300 ease-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    'active:scale-[0.98] hover:-translate-y-0.5',
    pill ? 'rounded-full' : 'rounded-xl'
  );
  
  const variantClasses = {
    primary: cn(
      'bg-gradient-to-br from-primary to-orange-600 text-white',
      'shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30',
      'focus-visible:ring-primary/50',
      'before:absolute before:inset-0 before:bg-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity'
    ),
    secondary: cn(
      'bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700',
      'text-zinc-900 dark:text-white',
      'hover:border-primary/50 hover:bg-zinc-50 dark:hover:bg-zinc-700/50',
      'shadow-sm hover:shadow-md',
      'focus-visible:ring-zinc-400'
    ),
    ghost: cn(
      'bg-transparent text-primary',
      'hover:bg-primary/10 active:bg-primary/20',
      'focus-visible:ring-primary/30'
    ),
    danger: cn(
      'bg-gradient-to-br from-red-500 to-red-600 text-white',
      'shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30',
      'focus-visible:ring-red-500/50'
    ),
    success: cn(
      'bg-gradient-to-br from-green-500 to-emerald-600 text-white',
      'shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30',
      'focus-visible:ring-green-500/50'
    ),
    gradient: cn(
      'bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white',
      'shadow-lg hover:shadow-xl',
      'focus-visible:ring-primary/50',
      'bg-[length:200%_auto] hover:bg-right-bottom transition-[background-position] duration-500'
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
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      
      {/* Loading spinner */}
      {loading && (
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
