import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPath, onNavigate }) => {
  const router = useRouter();
  const activePath = currentPath || router.pathname;

  const navigationItems = [
    {
      path: '/dashboard',
      label: 'Home',
      icon: 'home',
      activeIcon: 'home',
      testId: 'nav-home'
    },
    {
      path: '/taste',
      label: 'Taste',
      icon: 'restaurant',
      activeIcon: 'restaurant',
      testId: 'nav-taste'
    },
    {
      path: '/review',
      label: 'Review',
      icon: 'rate_review',
      activeIcon: 'rate_review',
      testId: 'nav-review'
    },
    {
      path: '/flavor-wheels',
      label: 'Wheels',
      icon: 'donut_small',
      activeIcon: 'donut_small',
      testId: 'nav-wheels'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return activePath === '/dashboard' || activePath === '/';
    }
    return activePath.startsWith(path);
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path);
    }
  };

  return (
    <footer
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 pointer-events-none'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <nav
        className={cn(
          'pointer-events-auto mx-auto mb-3 grid h-[72px] w-full max-w-xl grid-cols-4 items-center',
          'rounded-full border border-line/70 bg-white/92 px-2 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.28)]',
          'backdrop-blur-xl dark:border-zinc-700/70 dark:bg-zinc-900/92'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {navigationItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={(e) => handleClick(e, item.path)}
              className={cn(
                'flex h-full flex-col items-center justify-center gap-1 rounded-full group transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-fg-subtle dark:text-fg-subtle hover:bg-bg-inset hover:text-fg-muted dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
              )}
              aria-current={active ? 'page' : undefined}
              data-testid={item.testId}
            >
              {/* Icon container */}
              <span
                className={cn(
                  'flex items-center justify-center rounded-full px-2.5 py-1 transition-transform duration-200',
                  active && 'translate-y-[-1px] scale-105'
                )}
              >
                <span
                  className={cn(
                    'material-symbols-outlined text-[24px] leading-none',
                    active && 'font-variation-settings: "FILL" 1'
                  )}
                  style={{
                    fontVariationSettings: active ? '"FILL" 1, "wght" 500' : '"FILL" 0, "wght" 400'
                  }}
                  aria-hidden="true"
                >
                  {active ? item.activeIcon : item.icon}
                </span>
              </span>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] font-medium leading-tight',
                  'transition-colors duration-200',
                  active ? 'font-semibold' : ''
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
};

export default BottomNavigation;
