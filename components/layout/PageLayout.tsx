/**
 * PageLayout Component
 * 
 * Standard page wrapper that provides:
 * - Consistent background color
 * - Bottom navigation with safe area padding
 * - Optional sticky header
 * - Consistent container width via Container component
 * 
 * Use this as the root wrapper for all authenticated app pages.
 */

import React from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import BottomNavigation from '../navigation/BottomNavigation';
import Container, { ContainerSize } from './Container';
import UserAvatarMenu from '../navigation/UserAvatarMenu';
import { useAuth } from '@/contexts/SimpleAuthContext';

interface PageLayoutProps {
  children: React.ReactNode;
  /** Page title for header */
  title?: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Show back button */
  showBack?: boolean;
  /** Custom back URL (defaults to router.back()) */
  backUrl?: string;
  /** Right side header content (overrides default avatar menu) */
  headerRight?: React.ReactNode;
  /** Show bottom navigation. Default: true */
  showBottomNav?: boolean;
  /** Container size for content. Default: 'xl' */
  containerSize?: ContainerSize;
  /** Additional className for main content area */
  className?: string;
  /** Additional className for the page wrapper */
  wrapperClassName?: string;
  /** Show user avatar menu in header. Default: true */
  showUserMenu?: boolean;
  /** User avatar URL (optional, will fetch from context if not provided) */
  userAvatarUrl?: string | null;
  /** User display name (optional) */
  userDisplayName?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  showBack = false,
  backUrl,
  headerRight,
  showBottomNav = true,
  containerSize = 'xl',
  className,
  wrapperClassName,
  showUserMenu = true,
  userAvatarUrl,
  userDisplayName,
}) => {
  const router = useRouter();
  const { user } = useAuth();

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen font-sans',
        'bg-bg-surface dark:bg-bg',
        'text-fg dark:text-fg',
        wrapperClassName
      )}
    >
      {/* Header */}
      {(title || showBack || headerRight) && (
        <header className="bg-bg-surface dark:bg-bg border-b border-line dark:border-line/50">
          <Container size={containerSize} className="py-4">
            {/* Back button */}
            {showBack && (
              <button
                onClick={handleBack}
                className={cn(
                  'flex items-center gap-1 mb-4',
                  'text-fg-muted dark:text-fg-subtle',
                  'hover:text-fg dark:hover:text-fg',
                  'transition-colors font-medium text-sm'
                )}
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            )}

            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {title && (
                  <h1 className="text-3xl font-bold text-fg dark:text-fg tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-fg-muted dark:text-fg-subtle mt-1">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Right side actions */}
              <div className="flex-shrink-0 flex items-center gap-2">
                {headerRight ? (
                  headerRight
                ) : showUserMenu && user ? (
                  <>
                    <UserAvatarMenu
                      avatarUrl={userAvatarUrl}
                      displayName={userDisplayName}
                      email={user.email}
                      size={36}
                    />
                  </>
                ) : null}
              </div>
            </div>
          </Container>
        </header>
      )}

      {/* Main content */}
      <main
        className={cn(
          'py-6',
          showBottomNav && 'pb-28 sm:pb-6', // Fixed on mobile, in-flow on larger viewports.
          className
        )}
      >
        <Container size={containerSize}>
          {children}
        </Container>
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

export default PageLayout;
