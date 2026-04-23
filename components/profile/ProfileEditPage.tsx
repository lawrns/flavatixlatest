import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from '@/lib/toast';
import { useAuth } from '@/contexts/SimpleAuthContext';
import PageLayout from '@/components/layout/PageLayout';
import ProfileEditForm from './ProfileEditForm';
import ProfileService, { UserProfile } from '@/lib/profileService';
import UserAvatarMenu from '@/components/navigation/UserAvatarMenu';
import NotificationSystem from '@/components/notifications/NotificationSystem';
import { HeroPanel, InsightRail } from '@/components/ui/PremiumPrimitives';

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
      archetype="workspace"
      sideRail={
        <InsightRail eyebrow="Live preview" title="Public identity">
          <div className="rounded-soft border border-line bg-bg p-4">
            <p className="text-sm font-semibold text-fg">{profile?.full_name || user.email}</p>
            <p className="mt-1 text-sm text-fg-muted">{profile?.username ? `@${profile.username}` : 'Choose a username'}</p>
          </div>
        </InsightRail>
      }
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
      <HeroPanel
        eyebrow="Edit surface"
        title="Adjust the details people see first."
        description="Keep account identity clean and current. These fields feed the avatar menu, social surfaces, and review attribution."
      />

      <section className="rounded-pane border border-line bg-bg-surface p-5 shadow-sm sm:p-6">
        <ProfileEditForm profile={profile} onProfileUpdate={handleProfileUpdate} />
      </section>
    </PageLayout>
  );
}
