import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Medal, Award, ChevronLeft, Crown } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  score: number;
  rank: number;
  user_email: string;
  user_name: string | null;
  created_at: string;
}

interface CompetitionLeaderboardProps {
  sessionId: string;
}

export const CompetitionLeaderboard: React.FC<CompetitionLeaderboardProps> = ({ sessionId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sessionName, setSessionName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [sessionId]);

  const loadLeaderboard = async () => {
    try {
      // Get session info
      const { data: sessionData } = await supabase
        .from('quick_tastings')
        .select('session_name')
        .eq('id', sessionId)
        .single();

      if (sessionData) {
        setSessionName((sessionData as any).session_name);
      }

      // Get participants with scores
      const { data: participants, error } = await supabase
        .from('tasting_participants')
        .select(`
          id,
          user_id,
          score,
          created_at
        `)
        .eq('tasting_id', sessionId)
        .not('score', 'is', null)
        .order('score', { ascending: false });

      if (error) throw error;

      // Get user profiles
      const userIds = participants?.map((p: any) => p.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      // Get user emails from auth.users (using service role)
      const { data: users } = await supabase.auth.admin.listUsers();

      // Combine data and assign ranks
      const entries: LeaderboardEntry[] = (participants || []).map((p: any, index: number) => {
        const profile = (profiles as any)?.find((pr: any) => pr.user_id === p.user_id);
        const authUser = users?.users.find((u: any) => u.id === p.user_id);
        
        return {
          id: p.id,
          user_id: p.user_id,
          score: p.score || 0,
          rank: index + 1,
          user_email: authUser?.email || 'Unknown',
          user_name: profile?.full_name || null,
          created_at: p.created_at
        };
      });

      setLeaderboard(entries);

      // Find current user's rank
      const currentUserEntry = entries.find(e => e.user_id === user?.id);
      if (currentUserEntry) {
        setUserRank(currentUserEntry.rank);
      }

    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} className="text-yellow-500" />;
      case 2:
        return <Medal size={24} className="text-gray-400" />;
      case 3:
        return <Award size={24} className="text-orange-600" />;
      default:
        return <span className="text-h3 font-bold text-text-secondary">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 border-yellow-500';
      case 2:
        return 'bg-gray-100 border-gray-400';
      case 3:
        return 'bg-orange-100 border-orange-600';
      default:
        return 'bg-background-light border-border-default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-sm mx-auto"></div>
          <p className="text-text-secondary">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-border-default p-md">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/my-tastings')}
            className="flex items-center text-text-secondary hover:text-text-primary mb-sm"
          >
            <ChevronLeft size={20} className="mr-xs" />
            Back to My Tastings
          </button>
          <div className="flex items-center gap-md">
            <Trophy size={32} className="text-primary" />
            <div>
              <h1 className="text-h2 font-heading font-bold text-text-primary">
                Leaderboard
              </h1>
              <p className="text-small text-text-secondary">
                {sessionName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-4xl mx-auto p-md">
        {leaderboard.length === 0 ? (
          <div className="card p-xl text-center">
            <Trophy size={48} className="mx-auto mb-md text-text-secondary opacity-50" />
            <p className="text-body text-text-secondary">
              No participants have completed this competition yet.
            </p>
          </div>
        ) : (
          <div className="space-y-md">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-md mb-lg">
                {/* 2nd Place */}
                <div className="flex flex-col items-center pt-8">
                  <div className={`w-full card p-md text-center border-2 ${getRankBadgeColor(2)}`}>
                    <Medal size={32} className="mx-auto mb-sm text-gray-400" />
                    <p className="text-small font-semibold text-text-primary truncate">
                      {leaderboard[1].user_name || leaderboard[1].user_email.split('@')[0]}
                    </p>
                    <p className="text-h2 font-bold text-primary mt-xs">
                      {leaderboard[1].score}%
                    </p>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                  <div className={`w-full card p-lg text-center border-2 ${getRankBadgeColor(1)}`}>
                    <Crown size={40} className="mx-auto mb-sm text-yellow-500" />
                    <p className="text-body font-semibold text-text-primary truncate">
                      {leaderboard[0].user_name || leaderboard[0].user_email.split('@')[0]}
                    </p>
                    <p className="text-h1 font-bold text-primary mt-xs">
                      {leaderboard[0].score}%
                    </p>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center pt-8">
                  <div className={`w-full card p-md text-center border-2 ${getRankBadgeColor(3)}`}>
                    <Award size={32} className="mx-auto mb-sm text-orange-600" />
                    <p className="text-small font-semibold text-text-primary truncate">
                      {leaderboard[2].user_name || leaderboard[2].user_email.split('@')[0]}
                    </p>
                    <p className="text-h2 font-bold text-primary mt-xs">
                      {leaderboard[2].score}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="card">
              <div className="p-md border-b border-border-default">
                <h2 className="text-h3 font-heading font-semibold text-text-primary">
                  All Participants
                </h2>
              </div>
              <div className="divide-y divide-border-default">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-md flex items-center justify-between ${
                      entry.user_id === user?.id ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-md flex-1">
                      <div className="w-12 flex items-center justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="flex-1">
                        <p className="text-body font-semibold text-text-primary">
                          {entry.user_name || entry.user_email.split('@')[0]}
                          {entry.user_id === user?.id && (
                            <span className="ml-sm text-xs text-primary font-normal">(You)</span>
                          )}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-h3 font-bold text-primary">
                        {entry.score}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User's Rank Summary */}
            {userRank && (
              <div className="card p-md bg-primary/5 border-2 border-primary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <Trophy size={24} className="text-primary" />
                    <div>
                      <p className="text-small font-semibold text-text-primary">Your Rank</p>
                      <p className="text-xs text-text-secondary">
                        {userRank === 1 ? '🎉 Champion!' : userRank <= 3 ? '🏆 Podium finish!' : 'Keep practicing!'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-h2 font-bold text-primary">#{userRank}</p>
                    <p className="text-xs text-text-secondary">of {leaderboard.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

