import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/SimpleAuthContext';
import { useRouter } from 'next/router';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import ProfileService, { UserProfile } from '../lib/profileService';
import { PageLayout } from '../components/layout/PageLayout';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    } else {
      // Load user profile
      ProfileService.getProfile(user.id).then(setProfile);
    }
  }, [user, router]);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  if (!user) {
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
