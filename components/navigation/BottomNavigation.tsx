import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  currentPath?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPath }) => {
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

  return (
    <footer 
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white dark:bg-zinc-900',
        'border-t border-zinc-200 dark:border-zinc-700/50',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.03)]',
        'safe-area-bottom'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <nav 
        className="flex justify-around items-center px-4 max-w-md mx-auto h-[64px]" 
        role="navigation" 
        aria-label="Main navigation"
      >
        {navigationItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'flex flex-col items-center justify-center h-full min-w-[60px] gap-0.5 group',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                active 
                  ? 'text-primary' 
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
              )}
              aria-current={active ? 'page' : undefined}
              data-testid={item.testId}
            >
              {/* Icon container */}
              <span 
                className={cn(
                  'flex items-center justify-center h-6',
                  'transition-transform duration-200',
                  active && 'scale-110'
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
