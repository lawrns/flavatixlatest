import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';
import {
  ChevronLeft,
  Trophy,
  Users,
  Target,
  BarChart3,
  Award,
  Eye,
  UsersRound,
  Smartphone,
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import BottomNavigation from '@/components/navigation/BottomNavigation';

const CompetitionIndexPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-light pb-40">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back
          </button>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-2">
            Competition Mode
          </h1>
          <p className="text-lg text-text-secondary font-body">
            Create competitions with answer keys and participant rankings
          </p>
        </div>

        {/* Options */}
        <div className="grid gap-6">
          {/* Create New Competition */}
          <button
            onClick={() => router.push('/taste/create/competition/new')}
            className="bg-white dark:bg-zinc-800 rounded-xl p-8 border-2 border-gray-200 dark:border-zinc-700 hover:border-primary hover:shadow-lg transition-all group text-left"
          >
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                <Trophy size={32} className="text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display font-semibold text-text-primary mb-2">
                  Create New Competition
                </h2>
                <p className="text-text-secondary mb-4">
                  Set up items with answer keys, define parameters, and configure scoring.
                  Participants will be ranked based on their accuracy.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    Answer Keys
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    Participant Ranking
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                    Multiple Choice & More
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Join Competition */}
          <button
            onClick={() => router.push('/join-tasting')}
            className="bg-white dark:bg-zinc-800 rounded-xl p-8 border-2 border-gray-200 dark:border-zinc-700 hover:border-primary hover:shadow-lg transition-all group text-left"
          >
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors flex-shrink-0">
                <Users size={32} className="text-secondary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display font-semibold text-text-primary mb-2">
                  Join Competition
                </h2>
                <p className="text-text-secondary">
                  Enter a competition code to participate. Submit your answers and see how you rank
                  against other participants.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Features Section */}
        <div className="mt-12 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-8">
          <h3 className="text-2xl font-display font-semibold text-text-primary mb-6">
            Competition Mode Features
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-display font-semibold text-text-primary mb-2 flex items-center gap-2">
                <Target size={20} className="text-primary" />
                Answer Keys
              </h4>
              <p className="text-sm font-body text-text-secondary">
                Define correct answers for each parameter. Supports multiple choice, true/false,
                exact match, contains text, and numeric ranges.
              </p>
            </div>

            <div>
              <h4 className="font-display font-semibold text-text-primary mb-2 flex items-center gap-2">
                <BarChart3 size={20} className="text-primary" />
                Automatic Scoring
              </h4>
              <p className="text-sm font-body text-text-secondary">
                Participants are automatically scored based on accuracy. Configure point values for
                each parameter.
              </p>
            </div>

            <div>
              <h4 className="font-display font-semibold text-text-primary mb-2 flex items-center gap-2">
                <Award size={20} className="text-primary" />
                Leaderboards
              </h4>
              <p className="text-sm font-body text-text-secondary">
                Real-time ranking of participants. Choose from total points, accuracy percentage, or
                weighted scoring.
              </p>
            </div>

            <div>
              <h4 className="font-display font-semibold text-text-primary mb-2 flex items-center gap-2">
                <Eye size={20} className="text-primary" />
                Blind Tasting
              </h4>
              <p className="text-sm font-body text-text-secondary">
                Hide item names during tasting to eliminate bias. Perfect for objective evaluation.
              </p>
            </div>

            <div>
              <h4 className="font-display font-semibold text-text-primary mb-2 flex items-center gap-2">
                <UsersRound size={20} className="text-primary" />
                Multi-User Support
              </h4>
              <p className="text-sm font-body text-text-secondary">
                Invite unlimited participants with a simple join code. Real-time synchronization
                across devices.
              </p>
            </div>

            <div>
              <h4 className="font-display font-semibold text-text-primary mb-2 flex items-center gap-2">
                <Smartphone size={20} className="text-primary" />
                Mobile Friendly
              </h4>
              <p className="text-sm font-body text-text-secondary">
                Optimized for mobile devices. Participants can join and submit answers from any
                device.
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-8 bg-white dark:bg-zinc-800 rounded-xl p-8 border border-gray-200 dark:border-zinc-700">
          <h3 className="text-xl font-display font-semibold text-text-primary mb-4">Perfect For</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-primary text-xl flex-shrink-0 font-body">•</span>
              <span className="font-body text-text-secondary">
                <strong className="font-display text-text-primary">Coffee Cuppings:</strong> Blind
                tastings with origin identification and quality scoring
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary text-xl flex-shrink-0 font-body">•</span>
              <span className="font-body text-text-secondary">
                <strong className="font-display text-text-primary">Wine Competitions:</strong>{' '}
                Varietal identification and flavor profile matching
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary text-xl flex-shrink-0 font-body">•</span>
              <span className="font-body text-text-secondary">
                <strong className="font-display text-text-primary">Educational Sessions:</strong>{' '}
                Teach students to identify key characteristics
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary text-xl flex-shrink-0 font-body">•</span>
              <span className="font-body text-text-secondary">
                <strong className="font-display text-text-primary">Team Building:</strong> Friendly
                competitions with scoring and rankings
              </span>
            </li>
          </ul>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CompetitionIndexPage;

export async function getServerSideProps() {
  return { props: {} };
}
