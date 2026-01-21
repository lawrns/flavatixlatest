import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import { Trophy, Users, Award } from 'lucide-react';

interface TastingParticipant {
  id: string;
  user_id: string;
  tasting_id: string;
  score: number | null;
  rank: number | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

interface CompetitionRankingProps {
  tastingId: string;
  isRankingEnabled: boolean;
  currentUserId: string;
}

const CompetitionRanking: React.FC<CompetitionRankingProps> = ({
  tastingId,
  isRankingEnabled,
  currentUserId,
}) => {
  const [participants, setParticipants] = useState<TastingParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (isRankingEnabled) {
      loadParticipants();
    }
  }, [tastingId, isRankingEnabled]);

  const loadParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('tasting_participants')
        .select(
          `
          *,
          profiles:user_id (
            full_name,
            username,
            avatar_url
          )
        `
        )
        .eq('tasting_id', tastingId)
        .order('rank', { ascending: true })
        .order('score', { ascending: false });

      if (error) {
        throw error;
      }
      setParticipants(data || []);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isRankingEnabled) {
    return null;
  }

  if (loading) {
    return (
      <div className="card p-md">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number | null) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={20} />;
      case 2:
        return <Award className="text-gray-400" size={20} />;
      case 3:
        return <Award className="text-amber-600" size={20} />;
      default:
        return <span className="text-text-secondary font-bold">#{rank || '?'}</span>;
    }
  };

  const getRankColor = (rank: number | null) => {
    switch (rank) {
      case 1:
        return 'text-yellow-600';
      case 2:
        return 'text-gray-500';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <div className="card p-md">
      <div className="flex items-center mb-md">
        <Trophy className="text-primary-600 mr-sm" size={24} />
        <h3 className="text-h4 font-heading font-semibold text-text-primary">
          Competition Rankings
        </h3>
      </div>

      {participants.length === 0 ? (
        <p className="text-text-secondary text-center py-lg">
          No participants yet. Rankings will appear once scoring begins.
        </p>
      ) : (
        <div className="space-y-sm">
          {participants.map((participant, _index) => {
            const displayName =
              participant.profiles?.full_name || participant.profiles?.username || 'Anonymous User';
            const isCurrentUser = participant.user_id === currentUserId;

            return (
              <div
                key={participant.id}
                className={`flex items-center justify-between p-sm rounded-lg ${
                  isCurrentUser
                    ? 'bg-primary-50 border border-primary-200'
                    : 'bg-background-surface'
                }`}
              >
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 mr-sm">
                    {getRankIcon(participant.rank)}
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-sm">
                      <Users size={16} className="text-primary-600" />
                    </div>
                    <div>
                      <span
                        className={`font-body font-medium ${isCurrentUser ? 'text-primary-600' : 'text-text-primary'}`}
                      >
                        {displayName}
                        {isCurrentUser && ' (You)'}
                      </span>
                      {participant.score !== null && (
                        <div className="text-small text-text-secondary">
                          Score: {participant.score}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`text-right ${getRankColor(participant.rank)}`}>
                  {participant.rank ? (
                    <span className="text-body font-bold">#{participant.rank}</span>
                  ) : (
                    <span className="text-small text-text-secondary">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-md text-center">
        <p className="text-small text-text-secondary">
          Rankings update automatically as scores are submitted
        </p>
      </div>
    </div>
  );
};

export default CompetitionRanking;
