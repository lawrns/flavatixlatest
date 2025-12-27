import React, { useState, useEffect } from 'react';
import { TastingStats, getUserTastingStats } from '../../lib/historyService';
import { useAuth } from '../../contexts/SimpleAuthContext';

interface TastingHistoryStatsProps {
  className?: string;
}

const TastingHistoryStats: React.FC<TastingHistoryStatsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<TastingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await getUserTastingStats(user.id);

      if (fetchError) {
        setError('Error al cargar las estadísticas');
        console.error('Error loading tasting stats:', fetchError);
      } else {
        setStats(data);
      }

      setLoading(false);
    };

    loadStats();
  }, [user?.id]);

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-800">{error || 'Error al cargar estadísticas'}</span>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'coffee': 'coffee',
      'wine': 'wine_bar',
      'tea': 'local_cafe',
      'chocolate': 'cookie',
      'cheese': 'restaurant',
      'beer': 'sports_bar',
      'spirits': 'local_bar'
    };
    return icons[category.toLowerCase()] || 'restaurant';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-green-600';
    if (streak >= 3) return 'text-yellow-600';
    if (streak >= 1) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {/* Total Tastings */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTastings}</p>
            <p className="text-sm text-gray-600">Catas totales</p>
          </div>
          <span className="material-symbols-outlined text-gray-400">analytics</span>
        </div>
      </div>

      {/* Average Rating */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-2xl font-bold ${getRatingColor(stats.averageScore)}`}>
              {stats.averageScore.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">Puntuación media</p>
          </div>
          <span className="material-symbols-outlined text-gray-400">star</span>
        </div>
      </div>

      {/* Current Streak */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-2xl font-bold ${getStreakColor(stats.currentStreak)}`}>
              {stats.currentStreak}
            </p>
            <p className="text-sm text-gray-600">Racha actual</p>
          </div>
          <span className="material-symbols-outlined text-gray-400">local_fire_department</span>
        </div>
      </div>

      {/* Most Tasted Category */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900 capitalize">
              {stats.mostTastedCategory || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">Categoría favorita</p>
          </div>
          <span className="material-symbols-outlined text-gray-400">
            {stats.mostTastedCategory ? getCategoryIcon(stats.mostTastedCategory) : 'help'}
          </span>
        </div>
      </div>

      {/* Categories Breakdown */}
      {Object.keys(stats.categoriesCount).length > 0 && (
        <div className="col-span-2 md:col-span-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Distribución por categorías</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(stats.categoriesCount)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-gray-600 mr-2">{getCategoryIcon(category)}</span>
                    <span className="text-sm font-medium capitalize">{category}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{count}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default TastingHistoryStats;