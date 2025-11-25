/**
 * PageHeader Component
 * 
 * Consistent page header with optional back navigation.
 * Provides a standardized header pattern across all pages.
 */

import React from 'react';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Show back button */
  showBack?: boolean;
  /** Custom back URL (defaults to router.back()) */
  backUrl?: string;
  /** Custom back label */
  backLabel?: string;
  /** Right-side actions */
  actions?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Title size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Sticky header */
  sticky?: boolean;
  /** Custom back handler */
  onBack?: () => void;
  /** Breadcrumbs */
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  backUrl,
  backLabel = 'Back',
  actions,
  className,
  size = 'md',
  sticky = false,
  onBack,
  breadcrumbs,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  const titleSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <header
      className={cn(
        'w-full bg-background-app dark:bg-zinc-900',
        sticky && 'sticky top-0 z-40 backdrop-blur-sm bg-background-app/95 dark:bg-zinc-900/95',
        className
      )}
    >
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <svg
                      className="w-4 h-4 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="hover:text-primary transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {/* Back button */}
            {showBack && (
              <button
                onClick={handleBack}
                className={cn(
                  'flex items-center gap-1 text-zinc-600 dark:text-zinc-400',
                  'hover:text-primary transition-colors',
                  'min-h-[44px] min-w-[44px] -ml-2 px-2 rounded-lg',
                  'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
                aria-label={backLabel}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="hidden sm:inline">{backLabel}</span>
              </button>
            )}

            {/* Title and subtitle */}
            <div className="min-w-0">
              <h1
                className={cn(
                  'font-bold text-zinc-900 dark:text-white truncate',
                  titleSizes[size]
                )}
              >
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// ============================================================================
// SIMPLE BACK BUTTON
// ============================================================================

interface BackButtonProps {
  href?: string;
  label?: string;
  onClick?: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  href,
  label = 'Back',
  onClick,
  className,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400',
        'hover:text-primary transition-colors',
        'min-h-[44px] px-3 py-2 rounded-lg',
        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
        className
      )}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
};

// ============================================================================
// PAGE CONTAINER
// ============================================================================

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  maxWidth = 'xl',
  padding = true,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageHeader;
