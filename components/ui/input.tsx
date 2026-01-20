import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text */
  label?: string
  /** Error message */
  error?: string
  /** Helper text shown below input */
  helperText?: string
  /** Icon displayed on the left side */
  leftIcon?: React.ReactNode
  /** Icon displayed on the right side */
  rightIcon?: React.ReactNode
  /** Makes input full width */
  fullWidth?: boolean
  /** Size variant */
  inputSize?: 'sm' | 'md' | 'lg'
  /** Show character count */
  showCount?: boolean
  /** Success state */
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      inputSize = 'md',
      showCount = false,
      success = false,
      id,
      maxLength,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    const [charCount, setCharCount] = React.useState(0)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

    // Size variants following Gemini design system
    const sizeClasses = {
      sm: 'h-9 px-3 py-2 text-sm rounded-[14px]',
      md: 'h-11 px-4 py-3 text-base rounded-[14px]',
      lg: 'h-[52px] px-5 py-4 text-lg rounded-[14px]',
    }

    // Icon padding adjustments
    const iconPadding = {
      sm: { left: 'pl-9', right: 'pr-9' },
      md: { left: 'pl-11', right: 'pr-11' },
      lg: { left: 'pl-12', right: 'pr-12' },
    }

    // State-based styling
    const stateClasses = error
      ? 'border-red-400 dark:border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/10'
      : success
      ? 'border-green-400 dark:border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/10'
      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 focus-visible:border-primary focus-visible:ring-primary/10'

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {/* Label with optional character count */}
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
              <span
                className={cn(
                  'text-xs tabular-nums',
                  charCount >= maxLength ? 'text-red-500' : 'text-zinc-400'
                )}
              >
                {charCount}/{maxLength}
              </span>
            )}
          </label>
        )}

        {/* Input container with icons */}
        <div className="relative group">
          {/* Left icon */}
          {leftIcon && (
            <div
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2',
                'text-zinc-400 dark:text-zinc-500',
                'group-focus-within:text-primary',
                'transition-colors duration-200',
                'pointer-events-none'
              )}
            >
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            id={inputId}
            type={type}
            className={cn(
              'flex w-full border-2 bg-white',
              'text-zinc-900 dark:text-white',
              'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
              'ring-offset-white dark:ring-offset-zinc-950',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'focus-visible:outline-none focus-visible:ring-4',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:bg-zinc-800/80',
              'transition-[border-color,box-shadow] duration-200 ease-out',
              sizeClasses[inputSize],
              stateClasses,
              leftIcon && iconPadding[inputSize].left,
              (rightIcon || success) && iconPadding[inputSize].right,
              className
            )}
            ref={ref}
            maxLength={maxLength}
            onChange={handleChange}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />

          {/* Right icon or success checkmark */}
          {(rightIcon || success) && (
            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'pointer-events-none',
                'transition-colors duration-200',
                success
                  ? 'text-green-500'
                  : 'text-zinc-400 dark:text-zinc-500 group-focus-within:text-primary'
              )}
            >
              {success ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                rightIcon
              )}
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
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
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
    )
  }
)
Input.displayName = "Input"

export { Input }
