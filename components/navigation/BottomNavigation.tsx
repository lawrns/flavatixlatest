import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Plus, Sparkles, Star, Wine } from 'lucide-react';
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
      icon: Home,
      testId: 'nav-home'
    },
    {
      path: '/taste',
      label: 'Taste',
      icon: Wine,
      testId: 'nav-taste'
    },
    {
      path: '/quick-tasting',
      label: 'Start',
      icon: Plus,
      testId: 'nav-start'
    },
    {
      path: '/review',
      label: 'Review',
      icon: Star,
      testId: 'nav-review'
    },
    {
      path: '/flavor-wheels',
      label: 'Wheels',
      icon: Sparkles,
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
        'fixed inset-x-0 bottom-0 z-50 pointer-events-none',
        'sm:static sm:pointer-events-auto sm:px-4 sm:pb-4'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <nav
        className={cn(
          'pointer-events-auto mx-auto mb-3 grid h-[76px] w-full max-w-xl grid-cols-5 items-center',
          'sm:mb-0',
          'rounded-pane border border-line bg-bg-surface px-2 shadow-md'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {navigationItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={(e) => handleClick(e, item.path)}
              className={cn(
                'flex h-full flex-col items-center justify-center gap-1 rounded-soft group transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                active
                  ? item.path === '/quick-tasting'
                    ? 'bg-primary text-white'
                    : 'bg-primary/10 text-primary'
                  : 'text-fg-subtle hover:bg-bg-inset hover:text-fg-muted'
              )}
              aria-current={active ? 'page' : undefined}
              data-testid={item.testId}
            >
              <span className="flex items-center justify-center rounded-soft px-2.5 py-1">
                <Icon className="h-5 w-5" aria-hidden="true" />
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
