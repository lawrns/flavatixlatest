import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================================
// Button Variants — 4 variants × 2 sizes
// Primary · Secondary · Ghost · Danger
// ============================================================================

const buttonVariants = cva(
  cn(
    'relative inline-flex items-center justify-center font-medium overflow-hidden',
    'transition-[color,background-color,opacity,transform] duration-150 ease-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    'active:scale-[0.98]',
    'whitespace-nowrap'
  ),
  {
    variants: {
      variant: {
        primary: cn(
          'bg-primary text-white',
          'hover:opacity-90',
          'focus-visible:ring-primary/50'
        ),
        secondary: cn(
          'bg-gemini-card text-gemini-text-dark dark:text-white',
          'border border-gemini-border',
          'hover:bg-gray-100 dark:hover:bg-zinc-700',
          'focus-visible:ring-zinc-400'
        ),
        ghost: cn(
          'bg-transparent text-primary',
          'hover:bg-primary/5 dark:hover:bg-primary/10',
          'focus-visible:ring-primary/30'
        ),
        danger: cn(
          'bg-signal-danger text-white',
          'hover:opacity-90',
          'focus-visible:ring-signal-danger/50'
        ),
      },
      size: {
        sm: 'px-3 py-1.5 text-sm min-h-[36px] gap-1.5 rounded-sharp',
        lg: 'px-5 py-2.5 text-base min-h-[44px] gap-2 rounded-soft',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'lg',
      fullWidth: false,
    },
  }
);

// ============================================================================
// Button Props
// ============================================================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loadingText?: string;
}

// ============================================================================
// Button Component
// ============================================================================

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'lg',
      fullWidth = false,
      loading = false,
      icon,
      iconPosition = 'left',
      loadingText = 'Loading...',
      disabled,
      children,
      asChild = false,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const loadingId = React.useId();

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, fullWidth }),
          className
        )}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-busy={loading}
        aria-describedby={loading ? loadingId : undefined}
        {...props}
      >
        {loading && (
          <>
            <svg
              className="animate-spin h-4 w-4 mr-2"
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
            <span id={loadingId} className="sr-only">
              {loadingText}
            </span>
          </>
        )}

        {!loading && icon && iconPosition === 'left' && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}

        <span className="relative z-10">{children}</span>

        {!loading && icon && iconPosition === 'right' && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
export default Button;
