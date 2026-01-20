import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  TastingHistory,
  HistoryFilters,
  getUserTastingHistory,
  deleteTasting,
} from '../../lib/historyService';
import TastingHistoryItem from './TastingHistoryItem';
import { useAuth } from '../../contexts/SimpleAuthContext';

interface TastingHistoryListProps {
  filters?: HistoryFilters;
  onTastingClick: (tasting: TastingHistory) => void;
  onTastingsLoaded?: (hasItems: boolean) => void;
  limit?: number;
}

const TastingHistoryList: React.FC<TastingHistoryListProps> = ({
  filters,
  onTastingClick,
  onTastingsLoaded,
  limit = 20,
}) => {
  const { user } = useAuth();
  const [tastings, setTastings] = useState<TastingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // Virtualization ref
  const parentRef = useRef<HTMLDivElement>(null);

  const handleDeleteTasting = async (tastingId: string) => {
    if (!user?.id) {
      return;
    }

    try {
      const { success, error: deleteError } = await deleteTasting(tastingId, user.id);

      if (success) {
        // Actualizar estado local removiendo la cata eliminada
        setTastings((prev) => prev.filter((t) => t.id !== tastingId));

        // Mostrar notificación de éxito (usando alert por simplicidad)
        // Eliminación exitosa sin mensaje
      } else {
        console.error('Error deleting tasting:', deleteError);
        alert('Error al eliminar la cata. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Unexpected error deleting tasting:', error);
      alert('Error inesperado al eliminar la cata.');
    }
  };

  const refreshTastings = () => {
    loadTastings(true);
  };

  const loadTastings = async (reset: boolean = false) => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    setError(null);

    const currentOffset = reset ? 0 : offset;
    const { data, error: fetchError } = await getUserTastingHistory(
      user.id,
      filters,
      limit,
      currentOffset
    );

    if (fetchError) {
      setError('Error al cargar el historial de catas');
      console.error('Error loading tasting history:', fetchError);
    } else if (data) {
      if (reset) {
        setTastings(data);
        setOffset(limit);
      } else {
        setTastings((prev) => [...prev, ...data]);
        setOffset((prev) => prev + limit);
      }
      setHasMore(data.length === limit);

      // Notify parent component about tastings availability
      if (onTastingsLoaded) {
        onTastingsLoaded(data.length > 0);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadTastings(true);
  }, [user?.id, filters]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadTastings(false);
    }
  }, [loading, hasMore]);

  // Virtualizer setup - estimated row height of 120px for tasting items
  const virtualizer = useVirtualizer({
    count: tastings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  // Check if user scrolled near the bottom to load more
  const handleScroll = useCallback(() => {
    if (!parentRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    // Load more when within 200px of the bottom
    if (scrollHeight - scrollTop - clientHeight < 200) {
      loadMore();
    }
  }, [loading, hasMore, loadMore]);

  useEffect(() => {
    const scrollElement = parentRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  if (loading && tastings.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="flex gap-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-red-400 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-red-800">{error}</span>
        </div>
        <button
          onClick={() => loadTastings(true)}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (tastings.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay catas registradas</h3>
        <p className="text-gray-500 mb-4">
          {filters?.category || filters?.dateFrom || filters?.dateTo
            ? 'No se encontraron catas con los filtros aplicados.'
            : 'Aún no has realizado ninguna cata. ¡Comienza tu primera sesión!'}
        </p>
        <button
          onClick={() => (window.location.href = '/quick-tasting')}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Comenzar nueva cata
        </button>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ height: '600px', maxHeight: 'calc(100vh - 200px)' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const tasting = tastings[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="pb-4">
                <TastingHistoryItem
                  tasting={tasting}
                  onClick={onTastingClick}
                  onDelete={handleDeleteTasting}
                />
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="text-center pt-4 pb-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TastingHistoryList;
