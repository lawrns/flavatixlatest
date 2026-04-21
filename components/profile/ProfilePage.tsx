import { useEffect, useState } from 'react';
import ProfileEditForm from './ProfileEditForm';
import ProfileService, { UserProfile } from '@/lib/profileService';
import { PageLayout } from '@/components/layout/PageLayout';
import { useRequireAuth } from '@/hooks';

export default function ProfilePage() {
  const { user, loading } = useRequireAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    ProfileService.getProfile(user.id).then(setProfile);
  }, [user]);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  if (loading || !user) {
    return null;
  }

  return (
    <PageLayout title="Profile" showBack backUrl="/dashboard" containerSize="2xl">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-pane border border-line bg-bg-surface p-6 shadow-sm">
          <p className="text-caption uppercase tracking-[0.24em] text-fg-muted">
            Profile summary
          </p>
          <h2 className="mt-2 text-h2 font-semibold tracking-tight text-fg">
            Your public face and tasting identity.
          </h2>
          <p className="mt-3 text-body-sm leading-relaxed text-fg-muted">
            Keep your display name, avatar, and bio aligned with the way you want the feed and
            review surfaces to present you.
          </p>
        </section>

        <section className="rounded-pane border border-line bg-bg-surface p-5 shadow-sm sm:p-6">
          <ProfileEditForm profile={profile} onProfileUpdate={handleProfileUpdate} />
        </section>
      </div>
    </PageLayout>
  );
}
