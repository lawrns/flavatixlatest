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
      href: '/profile',
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
          'transition-colors'
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
            'bg-bg-surface rounded-pane shadow-md',
            'border border-line',
            'overflow-hidden animate-fade-in'
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Info Header with Avatar */}
          <div className="px-4 py-4 bg-bg-inset">
            <div className="flex items-center gap-3">
              <AvatarWithFallback
                src={avatarUrl}
                alt={name}
                fallback={initials}
                size={48}
              />
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-fg truncate">
                  {displayName || 'User'}
                </p>
                {email && (
                  <p className="text-sm text-fg-subtle dark:text-fg-subtle truncate">
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
                  'flex items-center gap-3 px-3 py-2.5 rounded-soft',
                  'text-sm font-medium text-fg-muted',
                  'hover:bg-bg-inset',
                  'transition-colors'
                )}
                role="menuitem"
              >
                <div className="w-8 h-8 rounded-full bg-bg-inset flex items-center justify-center">
                  <item.icon size={16} className="text-fg-muted" />
                </div>
                {item.label}
              </Link>
            ))}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 w-full rounded-soft',
                'text-sm font-medium text-signal-danger',
                'hover:bg-signal-danger-weak',
                'transition-colors'
              )}
              role="menuitem"
            >
              <div className="w-8 h-8 rounded-full bg-signal-danger-weak flex items-center justify-center">
                <LogOut size={16} className="text-signal-danger" />
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
