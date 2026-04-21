import React, { useEffect, useState } from 'react';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import ProfileService, { UserProfile } from '../lib/profileService';
import { PageLayout } from '../components/layout/PageLayout';
import { useRequireAuth } from '@/hooks';

const ProfilePage: React.FC = () => {
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
      containerSize="md"
    >
      <div className="py-4">
        <ProfileEditForm
          profile={profile}
          onProfileUpdate={handleProfileUpdate}
        />
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
