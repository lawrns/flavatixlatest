import { useEffect, useState } from 'react';
import ProfileEditForm from './ProfileEditForm';
import ProfileService, { UserProfile } from '@/lib/profileService';
import { PageLayout } from '@/components/layout/PageLayout';
import { useRequireAuth } from '@/hooks';
import { AvatarWithFallback } from '@/components/ui/AvatarWithFallback';
import { Button, PublicProfileHero, InsightRail } from '@/components/ui';

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
    <PageLayout
      title="Profile"
      showBack
      backUrl="/dashboard"
      archetype="workspace"
      sideRail={
        <InsightRail eyebrow="Taste profile" title="Identity signals">
          <div className="rounded-soft border border-line bg-bg p-4">
            <p className="text-sm font-semibold text-fg">Featured category</p>
            <p className="mt-1 text-sm text-fg-muted">{profile?.preferred_category || 'Not set yet'}</p>
          </div>
          <div className="rounded-soft border border-line bg-bg p-4">
            <p className="text-sm font-semibold text-fg">Public confidence</p>
            <p className="mt-1 text-sm text-fg-muted">Avatar, name, handle, and bio feed social and review attribution.</p>
          </div>
        </InsightRail>
      }
    >
      <PublicProfileHero
        avatar={
          <AvatarWithFallback
            src={profile?.avatar_url}
            alt={profile?.full_name || user.email || 'Profile'}
            fallback={(profile?.full_name || user.email || '?')[0].toUpperCase()}
            size={88}
          />
        }
        name={profile?.full_name || user.email || 'Taster'}
        handle={profile?.username ? `@${profile.username}` : 'No username yet'}
        bio={profile?.bio || 'Add a short tasting bio so reviews and social posts feel authored.'}
        stats={[
          { label: 'Tastings', value: profile?.tastings_count || 0 },
          { label: 'Category', value: profile?.preferred_category || '—' },
          { label: 'Profile', value: profile?.username ? 'Live' : 'Draft' },
        ]}
        actions={
          <Button variant="secondary" onClick={() => window.location.assign('/profile/edit')}>
            Edit profile
          </Button>
        }
      />

      <section className="rounded-pane border border-line bg-bg-surface p-5 shadow-sm sm:p-6">
        <ProfileEditForm profile={profile} onProfileUpdate={handleProfileUpdate} />
      </section>
    </PageLayout>
  );
}
