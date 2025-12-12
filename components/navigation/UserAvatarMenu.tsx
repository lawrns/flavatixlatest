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
            'absolute right-0 mt-2 w-56 z-50',
            'bg-white dark:bg-zinc-800 rounded-xl shadow-lg',
            'border border-gray-200 dark:border-zinc-700',
            'py-2 animate-fade-in'
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {displayName || 'User'}
            </p>
            {email && (
              <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                {email}
              </p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={item.onClick}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5',
                  'text-sm text-gray-700 dark:text-zinc-200',
                  'hover:bg-gray-100 dark:hover:bg-zinc-700',
                  'transition-colors'
                )}
                role="menuitem"
              >
                <item.icon size={18} className="text-gray-500 dark:text-zinc-400" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 dark:border-zinc-700 pt-1">
            <button
              onClick={handleLogout}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 w-full',
                'text-sm text-red-600 dark:text-red-400',
                'hover:bg-red-50 dark:hover:bg-red-900/20',
                'transition-colors'
              )}
              role="menuitem"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatarMenu;
