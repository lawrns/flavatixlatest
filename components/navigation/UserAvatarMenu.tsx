/**
 * UserAvatarMenu Component
 * 
 * A round avatar button in the header that opens a dropdown menu
 * with links to profile, settings, and logout.
 */
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { User, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { AvatarWithFallback } from '@/components/ui/AvatarWithFallback';

interface UserAvatarMenuProps {
  /** User's avatar URL */
  avatarUrl?: string | null;
  /** User's display name */
  displayName?: string;
  /** User's email (fallback for display name) */
  email?: string;
  /** Size of the avatar in pixels */
  size?: number;
  /** Additional className */
  className?: string;
}

export const UserAvatarMenu: React.FC<UserAvatarMenuProps> = ({
  avatarUrl,
  displayName,
  email,
  size = 40,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { signOut } = useAuth();

  // Get initials for fallback
  const name = displayName || email?.split('@')[0] || 'U';
  const initials = name.charAt(0).toUpperCase();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut();
    router.push('/auth');
  };

  const menuItems = [
    {
      label: 'Profile',
      icon: User,
      href: '/dashboard',
      onClick: () => setIsOpen(false),
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      onClick: () => setIsOpen(false),
    },
  ];

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'transition-transform hover:scale-105 active:scale-95'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <AvatarWithFallback
          src={avatarUrl}
          alt={name}
          fallback={initials}
          size={size}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-64 z-50',
            'bg-white dark:bg-zinc-800 rounded-[22px] shadow-xl',
            'border border-zinc-200 dark:border-zinc-700',
            'overflow-hidden animate-fade-in'
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Info Header with Avatar */}
          <div className="px-4 py-4 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5">
            <div className="flex items-center gap-3">
              <AvatarWithFallback
                src={avatarUrl}
                alt={name}
                fallback={initials}
                size={48}
              />
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-zinc-900 dark:text-white truncate">
                  {displayName || 'User'}
                </p>
                {email && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                    {email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={item.onClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-[14px]',
                  'text-sm font-medium text-zinc-700 dark:text-zinc-200',
                  'hover:bg-zinc-100 dark:hover:bg-zinc-700',
                  'transition-colors'
                )}
                role="menuitem"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                  <item.icon size={16} className="text-zinc-600 dark:text-zinc-300" />
                </div>
                {item.label}
              </Link>
            ))}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 w-full rounded-[14px]',
                'text-sm font-medium text-red-600 dark:text-red-400',
                'hover:bg-red-50 dark:hover:bg-red-900/20',
                'transition-colors'
              )}
              role="menuitem"
            >
              <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <LogOut size={16} className="text-red-500 dark:text-red-400" />
              </div>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatarMenu;
