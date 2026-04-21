/**
 * Settings Page
 * 
 * User settings and preferences management
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Moon, Sun, Bell, Shield, Trash2, ChevronRight, Zap, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import ProfileService, { UserProfile } from '@/lib/profileService';
import { getUserPresets, saveUserPresets, ALL_CATEGORIES } from '@/lib/presetService';
import { CategoryPackId } from '@/lib/categoryPacks';
import { CategoryStamp } from '@/components/ui';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [quickPresets, setQuickPresets] = useState<CategoryPackId[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    // Check current theme
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
      // Load quick presets
      setQuickPresets(getUserPresets());
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

  const togglePreset = (category: CategoryPackId) => {
    const isSelected = quickPresets.includes(category);
    let newPresets: CategoryPackId[];

    if (isSelected) {
      // Don't allow removing the last preset
      if (quickPresets.length <= 1) {
        toast.warning('You must have at least one preset');
        return;
      }
      newPresets = quickPresets.filter(p => p !== category);
    } else {
      newPresets = [...quickPresets, category];
    }

    setQuickPresets(newPresets);
    saveUserPresets(newPresets);
    toast.success(`Preset ${isSelected ? 'removed' : 'added'}`);
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
      title: 'Preferences',
      items: [
        {
          icon: isDarkMode ? Moon : Sun,
          label: 'Dark Mode',
          description: isDarkMode ? 'Currently using dark theme' : 'Currently using light theme',
          action: (
            <button
              type="button"
              onClick={toggleDarkMode}
              className={cn(
                'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isDarkMode ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'
              )}
              role="switch"
              aria-checked={isDarkMode}
              aria-label={`Dark mode ${isDarkMode ? 'enabled' : 'disabled'}`}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out',
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          ),
        },
        {
          icon: Bell,
          label: 'Push Notifications',
          description: 'Receive updates about tastings and reviews',
          action: (
            <button
              type="button"
              onClick={toggleNotifications}
              className={cn(
                'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                notificationsEnabled ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'
              )}
              role="switch"
              aria-checked={notificationsEnabled}
              aria-label={`Push notifications ${notificationsEnabled ? 'enabled' : 'disabled'}`}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out',
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          ),
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          icon: FileText,
          label: 'Privacy Policy',
          description: 'View our privacy policy and data practices',
          action: <ChevronRight size={20} className="text-fg-subtle" />,
          onClick: () => router.push('/privacy'),
        },
        {
          icon: FileText,
          label: 'Terms of Service',
          description: 'View our terms of service and user agreement',
          action: <ChevronRight size={20} className="text-fg-subtle" />,
          onClick: () => router.push('/terms'),
        },
        {
          icon: Shield,
          label: 'Privacy Settings',
          description: 'Manage your data and privacy preferences',
          action: <ChevronRight size={20} className="text-fg-subtle" />,
          onClick: () => toast.info('Privacy settings coming soon'),
        },
      ],
    },
    {
      title: 'Account',
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
      containerSize="2xl"
      userAvatarUrl={profile?.avatar_url}
      userDisplayName={profile?.full_name || undefined}
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-line bg-white/90 p-6 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.18)] sm:p-8">
          <p className="text-caption uppercase tracking-[0.24em] text-fg-muted">
            Account controls
          </p>
          <h2 className="mt-2 text-h2 font-semibold tracking-tight text-fg">
            Keep preferences close to the work they affect.
          </h2>
          <p className="mt-3 text-body-sm leading-relaxed text-fg-muted">
            Dark mode, notifications, privacy, and dashboard presets all live here so the
            settings page stays practical rather than decorative.
          </p>

          <div className="mt-6 rounded-[1.5rem] border border-dashed border-line bg-[#fbfaf7] p-4">
            <p className="text-body-sm font-medium text-fg">Dashboard presets</p>
            <p className="mt-2 text-caption leading-relaxed text-fg-muted">
              These chips decide which categories appear first on Home.
            </p>
          </div>

          <div className="mt-6 text-sm text-fg-muted">
            Flavatix v1.0.0
          </div>
        </section>

        <section className="space-y-6">
          {settingsSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-fg-muted">
                {section.title}
              </h2>
              <Card className="rounded-[2rem] border border-line bg-white/90 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.18)]">
                <CardContent className="p-0 divide-y divide-zinc-100 dark:divide-zinc-700">
                  {section.items.map((item, index) => (
                    <div
                      key={item.label}
                      className={cn(
                        'flex items-center justify-between p-4 sm:p-5',
                        item.onClick &&
                          'cursor-pointer transition-colors hover:bg-bg-inset dark:hover:bg-zinc-800/50',
                        index === 0 && 'rounded-t-[2rem]',
                        index === section.items.length - 1 && 'rounded-b-[2rem]'
                      )}
                      onClick={item.onClick}
                      role={item.onClick ? 'button' : undefined}
                      tabIndex={item.onClick ? 0 : undefined}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'flex h-11 w-11 items-center justify-center rounded-2xl',
                            item.danger
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : 'bg-bg-inset dark:bg-zinc-700'
                          )}
                        >
                          <item.icon
                            size={20}
                            className={cn(
                              item.danger
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-fg-muted dark:text-zinc-300'
                            )}
                          />
                        </div>
                        <div>
                          <p
                            className={cn(
                              'font-medium tracking-tight',
                              item.danger
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-zinc-950 dark:text-white'
                            )}
                          >
                            {item.label}
                          </p>
                          <p className="text-sm leading-relaxed text-fg-muted">
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

          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-fg-muted">
              Quick Presets
            </h2>
            <Card className="rounded-[2rem] border border-line bg-white/90 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.18)]">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bg-inset dark:bg-zinc-700">
                    <Zap size={20} className="text-fg-muted dark:text-zinc-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-950 dark:text-white">
                      Dashboard Presets
                    </p>
                    <p className="text-sm leading-relaxed text-fg-muted">
                      Choose which categories appear on your dashboard.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map((category) => {
                    const isSelected = quickPresets.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => togglePreset(category)}
                        className={cn(
                          'transition-transform duration-150 active:scale-[0.99]',
                          isSelected
                            ? 'opacity-100 ring-2 ring-primary ring-offset-2 rounded-full'
                            : 'opacity-60 hover:opacity-90'
                        )}
                      >
                        <CategoryStamp category={category} />
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
