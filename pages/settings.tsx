/**
 * Settings Page
 * 
 * User settings and preferences management
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Moon, Sun, Bell, Shield, Trash2, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import UserAvatarMenu from '@/components/navigation/UserAvatarMenu';
import NotificationSystem from '@/components/notifications/NotificationSystem';
import ProfileService, { UserProfile } from '@/lib/profileService';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    // Check current theme
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }

    // Fetch profile
    if (user) {
      ProfileService.getProfile(user.id).then(setProfile).catch(console.error);
    }
  }, [user, loading, router]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    toast.success(`${newMode ? 'Dark' : 'Light'} mode enabled`);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(`Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`);
  };

  const handleDeleteAccount = () => {
    // This would typically show a confirmation modal
    toast.info('Account deletion requires confirmation. Please contact support.');
  };

  if (loading || !user) {
    return null;
  }

  interface SettingItem {
    icon: React.ElementType;
    label: string;
    description: string;
    action: React.ReactNode;
    danger?: boolean;
    onClick?: () => void;
  }

  interface SettingsSection {
    title: string;
    items: SettingItem[];
  }

  const settingsSections: SettingsSection[] = [
    {
      title: 'Appearance',
      items: [
        {
          icon: isDarkMode ? Moon : Sun,
          label: 'Dark Mode',
          description: isDarkMode ? 'Currently using dark theme' : 'Currently using light theme',
          action: (
            <button
              onClick={toggleDarkMode}
              className={cn(
                'relative w-12 h-7 rounded-full transition-colors',
                isDarkMode ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          ),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          label: 'Push Notifications',
          description: 'Receive updates about tastings and reviews',
          action: (
            <button
              onClick={toggleNotifications}
              className={cn(
                'relative w-12 h-7 rounded-full transition-colors',
                notificationsEnabled ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          ),
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: Shield,
          label: 'Privacy Settings',
          description: 'Manage your data and privacy preferences',
          action: <ChevronRight size={20} className="text-zinc-400" />,
          onClick: () => toast.info('Privacy settings coming soon'),
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          icon: Trash2,
          label: 'Delete Account',
          description: 'Permanently delete your account and all data',
          danger: true,
          action: <ChevronRight size={20} className="text-red-400" />,
          onClick: handleDeleteAccount,
        },
      ],
    },
  ];

  return (
    <PageLayout
      title="Settings"
      showBack
      backUrl="/dashboard"
      containerSize="md"
      headerRight={
        <div className="flex items-center gap-3">
          <NotificationSystem userId={user.id} />
          <UserAvatarMenu
            avatarUrl={profile?.avatar_url}
            displayName={profile?.full_name}
            email={user.email}
            size={36}
          />
        </div>
      }
    >
      <div className="space-y-6">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h2>
            <Card>
              <CardContent className="p-0 divide-y divide-zinc-100 dark:divide-zinc-700">
                {section.items.map((item, index) => (
                  <div
                    key={item.label}
                    className={cn(
                      'flex items-center justify-between p-4',
                      item.onClick && 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors',
                      index === 0 && 'rounded-t-lg',
                      index === section.items.length - 1 && 'rounded-b-lg'
                    )}
                    onClick={item.onClick}
                    role={item.onClick ? 'button' : undefined}
                    tabIndex={item.onClick ? 0 : undefined}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          item.danger
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : 'bg-zinc-100 dark:bg-zinc-700'
                        )}
                      >
                        <item.icon
                          size={20}
                          className={cn(
                            item.danger
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-zinc-600 dark:text-zinc-300'
                          )}
                        />
                      </div>
                      <div>
                        <p
                          className={cn(
                            'font-medium',
                            item.danger
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-zinc-900 dark:text-white'
                          )}
                        >
                          {item.label}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {item.action}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Flavatix v1.0.0
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
