import { useState, useEffect } from 'react';
import ProfileService, { UserProfile, ProfileUpdateData } from '../../lib/profileService';
import { toast } from 'react-toastify';
import AvatarUpload from '../AvatarUpload';

interface ProfileEditFormProps {
  profile: UserProfile | null;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const CATEGORY_OPTIONS = [
  'Coffee',
  'Wine',
  'Beer',
  'Spirits',
  'Mezcal',
  'Perfume',
  'Olive Oil',
  'Snacks',
  'Other',
];

export default function ProfileEditForm({ profile, onProfileUpdate }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<ProfileUpdateData>({
    full_name: '',
    username: '',
    bio: '',
    preferred_category: '',
    avatar_url: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        preferred_category: profile.preferred_category || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username === profile?.username) {
      setUsernameAvailable(null);
      return;
    }

    if (username.length < 3) {
      setUsernameAvailable(false);
      return;
    }

    setCheckingUsername(true);
    const available = await ProfileService.isUsernameAvailable(username, profile?.user_id);
    setUsernameAvailable(available);
    setCheckingUsername(false);
  };

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'username') {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleAvatarUpload = async (avatarUrl: string) => {
    // Update local form state
    setFormData((prev) => ({ ...prev, avatar_url: avatarUrl }));

    // Auto-save avatar to profile immediately (don't require clicking Update Profile)
    if (profile) {
      const success = await ProfileService.updateProfile(profile.user_id, {
        avatar_url: avatarUrl,
      });
      if (success) {
        // Fetch updated profile to sync state
        const updatedProfile = await ProfileService.getProfile(profile.user_id);
        if (updatedProfile) {
          onProfileUpdate(updatedProfile);
        }
      }
    }
  };

  const handleAvatarError = (error: string) => {
    toast.error(`Avatar upload failed: ${error}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      toast.error('Profile not loaded');
      return;
    }

    if (formData.username && usernameAvailable === false) {
      toast.error('Please choose an available username');
      return;
    }

    setIsLoading(true);

    const success = await ProfileService.updateProfile(profile.user_id, formData);

    if (success) {
      // Fetch updated profile
      const updatedProfile = await ProfileService.getProfile(profile.user_id);
      if (updatedProfile) {
        onProfileUpdate(updatedProfile);
      }
    }

    setIsLoading(false);
  };

  const getUsernameStatus = () => {
    if (!formData.username || formData.username === profile?.username) {
      return null;
    }
    if (checkingUsername) {
      return 'checking';
    }
    if (formData.username.length < 3) {
      return 'too-short';
    }
    return usernameAvailable ? 'available' : 'taken';
  };

  const usernameStatus = getUsernameStatus();

  return (
    <div className="card p-6">
      <h3 className="text-h3 font-heading font-semibold text-text-primary dark:text-zinc-100 mb-6">
        Edit Profile
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label
            htmlFor="full_name"
            className="block text-small font-body font-medium text-text-secondary dark:text-zinc-300 mb-2"
          >
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:outline-none transition-colors min-h-[44px] text-body font-body text-text-primary dark:text-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 border-border focus:border-primary touch-manipulation"
            placeholder="Enter your full name"
            aria-describedby="full_name-help"
          />
          <p id="full_name-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This will be displayed on your profile
          </p>
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="block text-small font-body font-medium text-text-secondary dark:text-zinc-300 mb-2"
          >
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:outline-none transition-colors min-h-[44px] text-body font-body text-text-primary dark:text-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 touch-manipulation ${
                usernameStatus === 'available'
                  ? 'border-success focus:border-success'
                  : usernameStatus === 'taken' || usernameStatus === 'too-short'
                    ? 'border-error focus:border-error'
                    : 'border-border focus:border-primary'
              }`}
              placeholder="Choose a unique username"
              aria-describedby="username-help username-status"
              aria-invalid={usernameStatus === 'taken' || usernameStatus === 'too-short'}
            />
            {usernameStatus && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {usernameStatus === 'checking' && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                )}
                {usernameStatus === 'available' && (
                  <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {(usernameStatus === 'taken' || usernameStatus === 'too-short') && (
                  <svg className="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            )}
          </div>
          <p id="username-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Choose a unique username for your profile
          </p>
          {usernameStatus === 'too-short' && (
            <p
              id="username-status"
              className="text-small font-body text-error dark:text-red-400 mt-1"
              role="alert"
            >
              Username must be at least 3 characters
            </p>
          )}
          {usernameStatus === 'taken' && (
            <p
              id="username-status"
              className="text-small font-body text-error dark:text-red-400 mt-1"
              role="alert"
            >
              Username is already taken
            </p>
          )}
          {usernameStatus === 'available' && (
            <p
              id="username-status"
              className="text-small font-body text-success dark:text-green-400 mt-1"
            >
              Username is available
            </p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-small font-body font-medium text-text-secondary dark:text-zinc-300 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:outline-none transition-colors min-h-[44px] text-body font-body text-text-primary dark:text-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 border-border focus:border-primary resize-none"
            placeholder="Tell us about yourself..."
            rows={3}
            maxLength={200}
          />
          <div className="text-right text-small font-body text-text-muted dark:text-zinc-400 mt-1">
            {formData.bio?.length || 0}/200
          </div>
        </div>

        {/* Preferred Category */}
        <div>
          <label className="block text-small font-body font-medium text-text-secondary dark:text-zinc-300 mb-2">
            Preferred Category
          </label>
          <select
            value={formData.preferred_category}
            onChange={(e) => handleInputChange('preferred_category', e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:outline-none transition-colors min-h-[44px] text-body font-body text-text-primary dark:text-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 border-border focus:border-primary"
          >
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Avatar Upload */}
        <div className="relative">
          <label className="block text-small font-body font-medium text-text-secondary dark:text-zinc-300 mb-2">
            Profile Picture
          </label>
          <AvatarUpload
            userId={profile?.user_id || ''}
            currentAvatarUrl={formData.avatar_url}
            displayName={formData.full_name || profile?.full_name}
            onUploadSuccess={handleAvatarUpload}
            onUploadError={handleAvatarError}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (!!formData.username && usernameAvailable === false)}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Updating...
            </div>
          ) : (
            'Update Profile'
          )}
        </button>
      </form>
    </div>
  );
}
