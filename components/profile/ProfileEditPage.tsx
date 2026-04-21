import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from '@/lib/toast';
import { useAuth } from '@/contexts/SimpleAuthContext';
import PageLayout from '@/components/layout/PageLayout';
import ProfileEditForm from './ProfileEditForm';
import ProfileService, { UserProfile } from '@/lib/profileService';
import UserAvatarMenu from '@/components/navigation/UserAvatarMenu';
import NotificationSystem from '@/components/notifications/NotificationSystem';

export default function ProfileEditPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      ProfileService.getProfile(user.id).then(setProfile).catch(console.error);
    }
  }, [user, loading, router]);

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    toast.success('Profile updated successfully!');
    router.push('/dashboard');
  };

  if (loading || !user) {
    return null;
  }

  return (
    <PageLayout
      title="Edit Profile"
      showBack
      backUrl="/dashboard"
      containerSize="2xl"
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
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-pane border border-line bg-bg-surface p-6 shadow-sm">
          <p className="text-caption uppercase tracking-[0.24em] text-fg-muted">
            Edit surface
          </p>
          <h2 className="mt-2 text-h2 font-semibold tracking-tight text-fg">
            Adjust the details people see first.
          </h2>
          <p className="mt-3 text-body-sm leading-relaxed text-fg-muted">
            Keep the account identity clean and current. These fields feed the avatar menu,
            social surfaces, and review attribution.
          </p>
        </section>

        <section className="rounded-pane border border-line bg-bg-surface p-5 shadow-sm sm:p-6">
          <ProfileEditForm profile={profile} onProfileUpdate={handleProfileUpdate} />
        </section>
      </div>
    </PageLayout>
  );
}
