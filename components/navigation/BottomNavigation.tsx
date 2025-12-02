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
      path: '/social',
      label: 'Feed',
      icon: 'group',
      activeIcon: 'group',
      testId: 'nav-social'
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
        'bg-white/80 dark:bg-zinc-900/80',
        'backdrop-blur-xl backdrop-saturate-150',
        'border-t border-zinc-200/50 dark:border-zinc-700/50',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.05)]',
        'safe-area-bottom'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <nav 
        className="flex justify-around items-center px-2 py-1.5 max-w-lg mx-auto" 
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
                'relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl',
                'min-h-[56px] min-w-[64px] justify-center',
                'transition-all duration-300 ease-out',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                active 
                  ? 'text-primary' 
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
              )}
              aria-current={active ? 'page' : undefined}
              data-testid={item.testId}
            >
              {/* Active background pill */}
              {active && (
                <span 
                  className={cn(
                    'absolute inset-x-2 top-1 bottom-1 -z-10',
                    'bg-gradient-to-b from-primary/15 to-primary/5',
                    'dark:from-primary/20 dark:to-primary/10',
                    'rounded-xl',
                    'animate-scale-in'
                  )}
                />
              )}
              
              {/* Icon container with bounce effect */}
              <span 
                className={cn(
                  'relative transition-transform duration-300',
                  active && 'scale-110 -translate-y-0.5'
                )}
              >
                <span 
                  className={cn(
                    'material-symbols-outlined text-[22px]',
                    active && 'font-variation-settings: "FILL" 1'
                  )}
                  style={{
                    fontVariationSettings: active ? '"FILL" 1, "wght" 500' : '"FILL" 0, "wght" 400'
                  }}
                  aria-hidden="true"
                >
                  {active ? item.activeIcon : item.icon}
                </span>
                
                {/* Active dot indicator */}
                {active && (
                  <span 
                    className={cn(
                      'absolute -bottom-1 left-1/2 -translate-x-1/2',
                      'w-1 h-1 rounded-full bg-primary',
                      'animate-bounce-in'
                    )}
                  />
                )}
              </span>
              
              {/* Label */}
              <span 
                className={cn(
                  'text-[10px] font-medium tracking-wide',
                  'transition-all duration-300',
                  active ? 'font-semibold opacity-100' : 'opacity-70'
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
