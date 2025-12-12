/**
 * Profile Edit Page
 * 
 * Allows users to edit their profile information
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/SimpleAuthContext';
import PageLayout from '@/components/layout/PageLayout';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
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
      <ProfileEditForm
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </PageLayout>
  );
}
