import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/SimpleAuthContext';
import ProfileService, { UserProfile } from '../lib/profileService';
import ProfileDisplay from '../components/profile/ProfileDisplay';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import { getUserTastingStats, getLatestTasting, getRecentTastings } from '../lib/historyService';
import SocialFeedWidget from '../components/social/SocialFeedWidget';
import BottomNavigation from '../components/navigation/BottomNavigation';
import NotificationSystem from '../components/notifications/NotificationSystem';
import { cn } from '@/lib/utils';
import { AvatarWithFallback } from '@/components/ui/AvatarWithFallback';

export default function Dashboard() {
   const { user, loading, signOut } = useAuth();
   const [profile, setProfile] = useState<UserProfile | null>(null);
   const [activeTab, setActiveTab] = useState<'home' | 'edit'>('home');
   const [tastingStats, setTastingStats] = useState<any>(null);
   const [latestTasting, setLatestTasting] = useState<any>(null);
   const [recentTastings, setRecentTastings] = useState<any[]>([]);
   const router = useRouter();

  const initializeDashboard = useCallback(async () => {
    try {
      if (!user) return;
      
      // Fetch user profile
      const userProfile = await ProfileService.getProfile(user.id);
      setProfile(userProfile);
      
      // Fetch tasting stats, latest tasting, and recent tastings
      const [stats, latest, recent] = await Promise.all([
        getUserTastingStats(user.id),
        getLatestTasting(user.id),
        getRecentTastings(user.id, 5)
      ]);
      setTastingStats(stats.data);
      setLatestTasting(latest.data);
      setRecentTastings(recent.data || []);
      
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      toast.error('Error loading dashboard');
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }
    
    if (user) {
      initializeDashboard();
    }
  }, [user, loading, router, initializeDashboard]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/auth');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setActiveTab('home');
    toast.success('Profile updated successfully!');
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-500 animate-pulse" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          </div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'min-h-screen font-display',
      'bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30',
      'dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900',
      'text-zinc-900 dark:text-zinc-50'
    )}>
      <div className="flex h-screen flex-col">
        {/* Enhanced Header */}
        <header
          className={cn(
            'sticky top-0 z-40',
            'bg-white/80 dark:bg-zinc-900/80',
            'backdrop-blur-xl backdrop-saturate-150',
            'border-b border-zinc-200/50 dark:border-zinc-700/50',
            'px-4 pt-3 pb-0'
          )}
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍊</span>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                {activeTab === 'home' ? 'Dashboard' : 'Profile'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {user && <NotificationSystem userId={user.id} />}
              <button
                onClick={handleLogout}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg',
                  'text-zinc-600 dark:text-zinc-300',
                  'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                  'transition-colors duration-200'
                )}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation (Home / Edit Profile) */}
          <div className="mt-3 border-t border-zinc-200/50 dark:border-zinc-800/80">
            <div className="flex max-w-4xl mx-auto">
              <button
                onClick={() => setActiveTab('home')}
                className={cn(
                  'relative px-6 py-3 text-sm font-semibold transition-colors',
                  activeTab === 'home'
                    ? 'text-primary'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                )}
              >
                Home
                {activeTab === 'home' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-primary to-orange-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={cn(
                  'relative px-6 py-3 text-sm font-semibold transition-colors',
                  activeTab === 'edit'
                    ? 'text-primary'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                )}
              >
                Edit Profile
                {activeTab === 'edit' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-primary to-orange-500 rounded-full" />
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-24">
           {activeTab === 'home' && (
             <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
               {/* Welcome Hero Section */}
               <div className={cn(
                 'relative overflow-hidden rounded-2xl p-6 sm:p-8 mb-6',
                 'bg-gradient-to-br from-primary/10 via-orange-50 to-amber-50/50',
                 'dark:from-primary/20 dark:via-zinc-800 dark:to-zinc-800',
                 'border border-primary/10 dark:border-primary/20'
               )}>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                 <div className="relative z-10">
                   <p className="text-sm font-medium text-primary mb-1">Welcome back</p>
                   <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                     {profile?.full_name || user?.email?.split('@')[0]}! 👋
                   </h2>
                   <p className="text-zinc-600 dark:text-zinc-300">
                     Ready to discover new flavors today?
                   </p>
                 </div>
               </div>

            {/* Profile Overview */}
            {profile && (
              <div className={cn(
                'rounded-2xl p-5 sm:p-6 mb-6',
                'bg-white dark:bg-zinc-800/80',
                'border border-zinc-200/80 dark:border-zinc-700/50',
                'shadow-sm'
              )}>
                {/* Header with Avatar and Basic Info */}
                <div className="flex items-start space-x-4 mb-6">
                  <div className={cn(
                    'flex-shrink-0 relative',
                    'shadow-lg shadow-primary/20'
                  )}>
                    <AvatarWithFallback
                      src={profile.avatar_url}
                      alt={profile.full_name || 'Profile'}
                      fallback={(profile.full_name || user?.email || '?')[0].toUpperCase()}
                      size={64}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 truncate">
                      {profile.full_name || 'No name set'}
                    </h3>
                    {profile.username && (
                      <p className="text-zinc-600 dark:text-zinc-300 mb-1">@{profile.username}</p>
                    )}
                    <p className="text-zinc-500 text-sm">{user?.email}</p>
                    {profile.preferred_category && (
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 bg-primary/10 text-primary">
                        {profile.preferred_category}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab('edit')}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-2">About</h4>
                    <p className="text-zinc-900 dark:text-zinc-50 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-zinc-50 dark:bg-zinc-700 p-4 text-center rounded-lg">
                    <div className="text-2xl font-bold text-primary">{tastingStats?.totalTastings || profile.tastings_count || 0}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">Tastings</div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-700 p-4 text-center rounded-lg">
                    <div className="text-2xl font-bold text-primary">{profile.reviews_count || 0}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">Reviews</div>
                  </div>

                  <button
                    onClick={() => router.push(`/profile/${profile.username}/followers`)}
                    className="bg-zinc-50 dark:bg-zinc-700 p-4 text-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                  >
                    <div className="text-2xl font-bold text-primary">{profile.followers_count || 0}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">Followers</div>
                  </button>

                  <button
                    onClick={() => router.push(`/profile/${profile.username}/following`)}
                    className="bg-zinc-50 dark:bg-zinc-700 p-4 text-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                  >
                    <div className="text-2xl font-bold text-primary">{profile.following_count || 0}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">Following</div>
                  </button>
                </div>

                {/* Additional Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600 dark:text-zinc-300">Member since</span>
                    <span className="text-zinc-900 dark:text-zinc-50 font-medium">
                      {new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {profile.last_tasted_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-600 dark:text-zinc-300">Last tasting</span>
                      <span className="text-zinc-900 dark:text-zinc-50 font-medium">
                        {new Date(profile.last_tasted_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600 dark:text-zinc-300">Email verified</span>
                    <div className="flex items-center">
                      {profile.email_confirmed ? (
                        <>
                          <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-green-500 font-medium">Verified</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-yellow-500 font-medium">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-4">
              <button
                onClick={() => router.push('/history')}
                className="w-full flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-50:bg-zinc-700 transition-colors"
              >
                <span className="material-symbols-outlined">history</span>
                <div className="text-left">
                  <div className="font-medium">View History</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300">Your past tastings</div>
                </div>
              </button>

              {/* Recent Tastings */}
              {recentTastings.length > 0 ? (
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                      Recent Tastings
                    </h3>
                    <button
                      onClick={() => router.push('/history')}
                      className="text-primary hover:underline text-sm"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentTastings.map((tasting) => (
                      <button
                        key={tasting.id}
                        onClick={() => router.push(`/history`)}
                        className="w-full bg-zinc-50 dark:bg-zinc-700 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-zinc-900 dark:text-zinc-50 font-medium capitalize">
                            {tasting.category?.replace('_', ' ') || 'Tasting'}
                          </span>
                          <span className="text-zinc-500 text-xs">
                            {tasting.created_at && !isNaN(new Date(tasting.created_at).getTime())
                              ? new Date(tasting.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : 'N/A'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                          {tasting.average_score && (
                            <>
                              <span className="text-primary font-semibold">
                                {tasting.average_score.toFixed(1)}/5
                              </span>
                              <span className="text-zinc-400">•</span>
                            </>
                          )}
                          <span>{tasting.items?.length || 0} items</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg text-center">
                  <div className="text-zinc-400 mb-3">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">No Tastings Yet</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">Start your flavor journey today!</p>
                  <button
                    onClick={() => router.push('/taste')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Create Your First Tasting
                  </button>
                </div>
              )}

              {/* Stats Card */}
              {tastingStats && (
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">Your Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{tastingStats.totalTastings}</div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-300">Total Tastings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {tastingStats.averageScore ? tastingStats.averageScore.toFixed(1) : '0.0'}
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-300">Avg Score</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Feed Widget */}
              {user && <SocialFeedWidget userId={user.id} limit={5} />}
            </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <ProfileEditForm
                  profile={profile}
                  onProfileUpdate={handleProfileUpdate}
                />
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
}
// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
