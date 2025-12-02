/**
 * AppShell Component
 * 
 * Provides consistent layout structure for app pages including:
 * - Header with navigation
 * - Main content area with responsive padding
 * - Optional sidebar
 * - Bottom navigation for mobile
 */
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import BottomNavigation from '../navigation/BottomNavigation';

interface AppShellProps {
  children: React.ReactNode;
  /** Page title shown in header */
  title?: string;
  /** Show back button */
  showBack?: boolean;
  /** Custom back URL (defaults to router.back()) */
  backUrl?: string;
  /** Header right content (actions, buttons) */
  headerRight?: React.ReactNode;
  /** Show bottom navigation */
  showBottomNav?: boolean;
  /** Show header */
  showHeader?: boolean;
  /** Maximum content width */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Additional class for main content */
  className?: string;
  /** Padding variant */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

const paddingClasses = {
  none: '',
  sm: 'px-3 py-2',
  md: 'px-4 py-4',
  lg: 'px-6 py-6',
};

export const AppShell: React.FC<AppShellProps> = ({
  children,
  title,
  showBack = false,
  backUrl,
  headerRight,
  showBottomNav = true,
  showHeader = true,
  maxWidth = 'xl',
  className,
  padding = 'md',
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-background-app flex flex-col">
      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-40 bg-background-surface border-b border-border-subtle">
          <div className={cn('mx-auto', maxWidthClasses[maxWidth])}>
            <div className="flex items-center justify-between h-14 px-4">
              {/* Left: Back button or Logo */}
              <div className="flex items-center gap-3">
                {showBack ? (
                  <button
                    onClick={handleBack}
                    className="p-2 -ml-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Go back"
                  >
                    <svg
                      className="w-5 h-5 text-text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                ) : (
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">🍊</span>
                    <span className="font-heading font-semibold text-text-primary hidden sm:inline">
                      Flavatix
                    </span>
                  </Link>
                )}
                
                {title && (
                  <h1 className="text-lg font-heading font-semibold text-text-primary truncate">
                    {title}
                  </h1>
                )}
              </div>

              {/* Right: Actions */}
              {headerRight && (
                <div className="flex items-center gap-2">
                  {headerRight}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main
        className={cn(
          'flex-1',
          maxWidthClasses[maxWidth],
          'mx-auto w-full',
          paddingClasses[padding],
          showBottomNav && 'pb-20', // Account for bottom nav
          className
        )}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

/**
 * AppShell.Content - For pages that need custom padding control
 */
export const AppShellContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('space-y-4', className)}>{children}</div>
);

/**
 * AppShell.Section - For content sections with consistent spacing
 */
export const AppShellSection: React.FC<{
  children: React.ReactNode;
  title?: string;
  className?: string;
}> = ({ children, title, className }) => (
  <section className={cn('space-y-3', className)}>
    {title && (
      <h2 className="text-lg font-heading font-semibold text-text-primary">
        {title}
      </h2>
    )}
    {children}
  </section>
);

export default AppShell;
