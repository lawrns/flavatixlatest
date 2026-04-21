import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from '@/lib/toast';
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

    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
      setQuickPresets(getUserPresets());
    }

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
    toast.info('Account deletion requires confirmation. Please contact support.');
  };

  const togglePreset = (category: CategoryPackId) => {
    const isSelected = quickPresets.includes(category);
    let newPresets: CategoryPackId[];

    if (isSelected) {
      if (quickPresets.length <= 1) {
        toast.warning('You must have at least one preset');
        return;
      }
      newPresets = quickPresets.filter((p) => p !== category);
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
                isDarkMode ? 'bg-primary' : 'bg-line-strong'
              )}
              role="switch"
              aria-checked={isDarkMode}
              aria-label={`Dark mode ${isDarkMode ? 'enabled' : 'disabled'}`}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-fg-inverse shadow-md transition duration-200 ease-in-out',
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
                notificationsEnabled ? 'bg-primary' : 'bg-line-strong'
              )}
              role="switch"
              aria-checked={notificationsEnabled}
              aria-label={`Push notifications ${notificationsEnabled ? 'enabled' : 'disabled'}`}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-fg-inverse shadow-md transition duration-200 ease-in-out',
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
          action: <ChevronRight size={20} className="text-signal-danger" />,
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
        <section className="rounded-pane border border-line bg-bg-surface p-6 shadow-sm sm:p-8">
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

          <div className="mt-6 rounded-soft border border-dashed border-line bg-bg-inset p-4">
            <p className="text-body-sm font-medium text-fg">Dashboard presets</p>
            <p className="mt-2 text-caption leading-relaxed text-fg-muted">
              These chips decide which categories appear first on Home.
            </p>
          </div>

          <div className="mt-6 text-sm text-fg-muted">Flavatix v1.0.0</div>
        </section>

        <section className="space-y-6">
          {settingsSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-fg-muted">
                {section.title}
              </h2>
              <Card className="rounded-pane border border-line bg-bg-surface shadow-sm">
                <CardContent className="p-0 divide-y divide-line">
                  {section.items.map((item, index) => (
                    <div
                      key={item.label}
                      className={cn(
                        'flex items-center justify-between p-4 sm:p-5',
                        item.onClick &&
                          'cursor-pointer transition-colors hover:bg-bg-inset',
                        index === 0 && 'rounded-t-pane',
                        index === section.items.length - 1 && 'rounded-b-pane'
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
                              ? 'bg-signal-danger-weak'
                              : 'bg-bg-inset'
                          )}
                        >
                          <item.icon
                            size={20}
                            className={cn(
                              item.danger
                                ? 'text-signal-danger'
                                : 'text-fg-muted'
                            )}
                          />
                        </div>
                        <div>
                          <p
                            className={cn(
                              'font-medium tracking-tight',
                              item.danger
                                ? 'text-signal-danger'
                                : 'text-fg'
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
            <Card className="rounded-pane border border-line bg-bg-surface shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bg-inset">
                    <Zap size={20} className="text-fg-muted" />
                  </div>
                  <div>
                    <p className="font-semibold text-fg">
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
