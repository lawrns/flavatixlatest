import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/SimpleAuthContext';
import { useRouter } from 'next/router';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import ProfileService, { UserProfile } from '../lib/profileService';

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
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-8">Profile</h1>
          <ProfileEditForm 
            profile={profile} 
            onProfileUpdate={handleProfileUpdate} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
