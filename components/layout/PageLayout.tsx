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
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ChevronLeft,
  Compass,
  Home,
  MessageCircle,
  Plus,
  Settings,
  Sparkles,
  Star,
  User,
  Wine,
} from 'lucide-react';
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
  /** Page archetype controls width, shell density, and desktop composition. */
  archetype?: 'workflow' | 'workspace' | 'visualCanvas';
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
  /** Optional side rail shown to the right on desktop. */
  sideRail?: React.ReactNode;
  /** Optional sticky action surface rendered after content. */
  stickyAction?: React.ReactNode;
}

const archetypeConfig: Record<
  NonNullable<PageLayoutProps['archetype']>,
  { container: ContainerSize; main: string; content: string }
> = {
  workflow: {
    container: '4xl',
    main: 'py-4 sm:py-6',
    content: 'space-y-5',
  },
  workspace: {
    container: '7xl',
    main: 'py-4 sm:py-6',
    content: 'space-y-5',
  },
  visualCanvas: {
    container: 'full',
    main: 'py-4 sm:py-6',
    content: 'space-y-6',
  },
};

const desktopNavItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/taste', label: 'Taste', icon: Wine },
  { href: '/review', label: 'Review', icon: Star },
  { href: '/flavor-wheels', label: 'Wheels', icon: Sparkles },
  { href: '/social', label: 'Social', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  showBack = false,
  backUrl,
  headerRight,
  showBottomNav = true,
  containerSize = 'xl',
  archetype = 'workflow',
  className,
  wrapperClassName,
  showUserMenu = true,
  userAvatarUrl,
  userDisplayName,
  sideRail,
  stickyAction,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const shell = archetypeConfig[archetype];
  const resolvedContainerSize = containerSize === 'xl' ? shell.container : containerSize;

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  const isNavActive = (href: string) => {
    if (href === '/dashboard') {
      return router.pathname === '/dashboard' || router.pathname === '/';
    }
    return router.pathname.startsWith(href);
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
      {showBottomNav && user && (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] border-r border-line bg-bg-surface/95 px-3 py-4 shadow-sm backdrop-blur xl:flex xl:flex-col">
          <Link href="/dashboard" className="mb-5 flex items-center gap-3 rounded-soft px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-soft bg-primary text-white">
              <Compass className="h-5 w-5" />
            </span>
            <span className="text-base font-semibold tracking-normal text-fg">Flavatix</span>
          </Link>

          <Link
            href="/quick-tasting"
            className="mb-4 inline-flex min-h-[40px] items-center justify-center gap-2 rounded-soft bg-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            Start tasting
          </Link>

          <nav className="flex flex-1 flex-col gap-1" aria-label="Main navigation">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex min-h-[40px] items-center gap-3 rounded-soft px-3 text-sm font-medium transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-fg-muted hover:bg-bg-inset hover:text-fg'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      {/* Header */}
      {(title || showBack || headerRight) && (
        <header
          className={cn(
            'bg-bg-surface/95 border-b border-line backdrop-blur',
            showBottomNav && user && 'xl:pl-[220px]'
          )}
        >
          <Container size={resolvedContainerSize} className="py-3">
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
                  <h1 className="text-2xl font-semibold leading-tight tracking-normal text-fg sm:text-3xl">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1 text-sm text-fg-muted dark:text-fg-subtle">{subtitle}</p>
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
      <div
        className={cn(
          shell.main,
          showBottomNav && 'pb-28 sm:pb-6', // Fixed on mobile, in-flow on larger viewports.
          showBottomNav && user && 'xl:pl-[220px]',
          className
        )}
      >
        <Container size={resolvedContainerSize} padding={archetype !== 'visualCanvas'}>
          {sideRail ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className={cn('page-stack', shell.content)}>{children}</div>
              <div className="hidden xl:block">{sideRail}</div>
            </div>
          ) : (
            <div className={cn('page-stack', shell.content)}>{children}</div>
          )}
          {stickyAction}
        </Container>
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

export default PageLayout;
