import { UserProfile } from '../../lib/profileService';
import { getUserTastingStats } from '../../lib/historyService';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { AvatarWithFallback } from '../ui/AvatarWithFallback';

interface ProfileDisplayProps {
  profile: UserProfile | null;
  authEmail?: string;
}

export default function ProfileDisplay({ profile, authEmail }: ProfileDisplayProps) {
  const { user } = useAuth();
  const [realTimeTastingsCount, setRealTimeTastingsCount] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Obtener el conteo real de tastings
  useEffect(() => {
    const fetchRealTastingsCount = async () => {
      if (!profile || !user) {
        return;
      }

      setIsLoadingStats(true);
      try {
        const result = await getUserTastingStats(user.id);
        if (result.data) {
          setRealTimeTastingsCount(result.data.totalTastings);
        } else {
          // En caso de error, usar el valor de la base de datos
          setRealTimeTastingsCount(profile.tastings_count);
        }
      } catch (error) {
        console.error('Error fetching real tastings count:', error);
        // En caso de error, usar el valor de la base de datos
        setRealTimeTastingsCount(profile.tastings_count);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchRealTastingsCount();
  }, [profile, user]);

  if (!profile) {
    return (
      <div className="card p-md">
        <div className="text-center text-text-secondary font-body">
          <div className="w-16 h-16 bg-background-muted rounded-full mx-auto mb-sm animate-pulse"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) {
      return '?';
    }
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category?: string) => {
    const colors: { [key: string]: string } = {
      Coffee: 'bg-[#8C5A3A] text-white',
      Wine: 'bg-[#B53F3F] text-white',
      Beer: 'bg-[#DFAF2B] text-[#2C1810]',
      Spirits: 'bg-[#6B5B95] text-white',
      Mezcal: 'bg-[#C65A2E] text-white',
      Perfume: 'bg-[#E9A2AD] text-[#2C1810]',
      'Olive Oil': 'bg-[#57A773] text-white',
      Snacks: 'bg-[#E4572E] text-white',
      Other: 'bg-[#8B8B8B] text-white',
    };
    return colors[category || ''] || 'bg-[#F4E3CC] text-[#2C1810]';
  };

  return (
    <div className="card p-md">
      {/* Header with Avatar and Basic Info */}
      <div className="flex items-start space-x-sm mb-md">
        <div className="flex-shrink-0 relative">
          <AvatarWithFallback
            src={profile.avatar_url}
            alt={profile.full_name || 'Profile'}
            fallback={getInitials(profile.full_name)}
            size={64}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-h4 font-heading font-semibold text-text-primary truncate">
            {profile.full_name || 'No name set'}
          </h2>
          {profile.username && (
            <p className="text-text-secondary text-small font-body mb-xs">@{profile.username}</p>
          )}
          <p className="text-text-muted text-small font-body">{authEmail}</p>
          {profile.preferred_category && (
            <span
              className={`inline-block px-3 py-1 rounded-full text-caption font-body font-medium mt-xs ${getCategoryColor(profile.preferred_category)}`}
            >
              {profile.preferred_category}
            </span>
          )}
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="mb-md">
          <h3 className="text-small font-body font-medium text-text-secondary mb-xs">About</h3>
          <p className="text-body font-body text-text-primary leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-sm mb-md">
        <div className="bg-[#FEF3E7] rounded-xl p-sm text-center">
          <div className="text-h2 font-heading font-bold text-[#1F5D4C]">
            {isLoadingStats ? (
              <span className="animate-pulse text-[#1F5D4C]/50">-</span>
            ) : realTimeTastingsCount !== null ? (
              realTimeTastingsCount
            ) : (
              profile.tastings_count
            )}
          </div>
          <div className="text-small font-body text-text-secondary">Tastings</div>
        </div>

        <div className="bg-[#FEF3E7] rounded-xl p-sm text-center">
          <div className="text-h2 font-heading font-bold text-[#1F5D4C]">
            {profile.reviews_count}
          </div>
          <div className="text-small font-body text-text-secondary">Reviews</div>
        </div>

        <div className="bg-[#F7F3EA] rounded-xl p-sm text-center">
          {(profile.followers_count || 0) === 0 ? (
            <div className="text-small font-body text-text-muted">No followers yet</div>
          ) : (
            <div className="text-h2 font-heading font-bold text-[#C65A2E]">
              {profile.followers_count}
            </div>
          )}
          <div className="text-small font-body text-text-secondary">Followers</div>
        </div>

        <div className="bg-[#F7F3EA] rounded-xl p-4 text-center">
          {(profile.following_count || 0) === 0 ? (
            <div className="text-small font-body text-text-muted">Not following anyone</div>
          ) : (
            <div className="text-h2 font-heading font-bold text-[#C65A2E]">
              {profile.following_count}
            </div>
          )}
          <div className="text-small font-body text-text-secondary">Following</div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-3 text-small font-body">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary font-body">Member since</span>
          <span className="text-text-primary font-body font-medium">
            {formatDate(profile.created_at)}
          </span>
        </div>

        {profile.last_tasted_at && (
          <div className="flex justify-between items-center">
            <span className="text-text-secondary font-body">Last tasting</span>
            <span className="text-text-primary font-body font-medium">
              {formatDate(profile.last_tasted_at)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-text-secondary font-body">Email verified</span>
          <div className="flex items-center">
            {profile.email_confirmed ? (
              <>
                <svg
                  className="w-4 h-4 text-[#22C55E] mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-success font-body font-medium">Verified</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 text-[#F59E0B] mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-warning font-body font-medium">Pending</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
