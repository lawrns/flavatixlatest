import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRequireAuth } from '@/hooks';

const CompetitionPage: React.FC = () => {
  const { user, loading } = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return;
    }
  }, [user]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-8">Competitions</h1>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-line dark:border-zinc-700">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Join Competition</h2>
              <p className="text-text-secondary mb-4">
                Enter a competition code to join an existing tasting competition.
              </p>
              <button
                onClick={() => router.push('/join-tasting')}
                className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Join Competition
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-line dark:border-zinc-700">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Create Competition</h2>
              <p className="text-text-secondary mb-4">
                Start a new tasting competition and invite others to participate.
              </p>
              <button
                onClick={() => router.push('/create-tasting')}
                className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Create Competition
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">My Competitions</h2>
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-line dark:border-zinc-700">
              <p className="text-text-secondary text-center py-8">
                No competitions yet. Join or create one to get started!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionPage;
