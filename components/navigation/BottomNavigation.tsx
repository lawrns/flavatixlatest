import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

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
      testId: 'nav-home'
    },
    {
      path: '/taste',
      label: 'Taste',
      icon: 'restaurant',
      testId: 'nav-taste'
    },
    {
      path: '/review',
      label: 'Review',
      icon: 'reviews',
      testId: 'nav-review'
    },
    {
      path: '/flavor-wheels',
      label: 'Wheels',
      icon: 'donut_small',
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
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 dark:border-zinc-700 bg-background-light dark:bg-background-dark backdrop-blur-sm">
      <nav className="flex justify-around p-2" role="navigation" aria-label="Main navigation">
        {navigationItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] justify-center
                ${active 
                  ? 'text-primary bg-primary/10' 
                  : 'text-zinc-500 dark:text-zinc-300 hover:text-primary hover:bg-primary/5'
                }
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark
              `}
              aria-current={active ? 'page' : undefined}
              data-testid={item.testId}
            >
              <span 
                className="material-symbols-outlined text-xl"
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span className={`text-xs font-medium ${active ? 'font-bold' : 'font-medium'}`}>
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
