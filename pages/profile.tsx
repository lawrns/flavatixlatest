import React, { useEffect } from 'react';
import { useAuth } from '../contexts/SimpleAuthContext';
import { useRouter } from 'next/router';
import ProfileEditForm from '../components/profile/ProfileEditForm';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-8">Profile</h1>
          <ProfileEditForm />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
