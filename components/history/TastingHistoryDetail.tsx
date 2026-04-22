import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { TastingHistory, getTastingById } from '../../lib/historyService';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TastingHistoryDetailProps {
  tastingId: string;
  onBack: () => void;
  onEdit?: (tasting: TastingHistory) => void;
}

const TastingHistoryDetail: React.FC<TastingHistoryDetailProps> = ({
  tastingId,
  onBack,
  onEdit,
}) => {
  const { user } = useAuth();
  const [tasting, setTasting] = useState<TastingHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasting = async () => {
      if (!user?.id || !tastingId) {
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await getTastingById(tastingId, user.id);

      if (fetchError) {
        setError('Error al cargar los detalles de la cata');
        console.error('Error loading tasting detail:', fetchError);
      } else {
        setTasting(data);
      }

      setLoading(false);
    };

    loadTasting();
  }, [tastingId, user?.id]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      coffee: 'bg-amber-100 text-amber-800 border-amber-200',
      wine: 'bg-purple-100 text-purple-800 border-purple-200',
      tea: 'bg-fg-subtle/10 text-fg-subtle',
      chocolate: 'bg-fg-subtle/10 text-fg-subtle',
      cheese: 'bg-orange-100 text-orange-800 border-orange-200',
      beer: 'bg-blue-100 text-blue-800 border-blue-200',
      spirits: 'bg-red-100 text-red-800 border-red-200',
      default: 'bg-bg-inset text-fg border-line',
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  const getScoreColor = (score: number | null) => {
    if (!score) {
      return 'text-fg-subtle';
    }
    if (score >= 4.5) {
      return 'text-green-600';
    }
    if (score >= 3.5) {
      return 'text-yellow-600';
    }
    if (score >= 2.5) {
      return 'text-orange-600';
    }
    return 'text-red-600';
  };

  const renderFlavorScores = (flavorScores: any) => {
    if (!flavorScores || typeof flavorScores !== 'object') {
      return null;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(flavorScores).map(([flavor, score]) => (
          <div key={flavor} className="bg-bg-hover dark:bg-bg-inset/50 rounded-soft p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-fg-muted dark:text-fg-muted capitalize">
                {flavor.replace('_', ' ')}
              </span>
              <span className={`text-sm font-bold ${getScoreColor(Number(score))}`}>
                {Number(score)}/100
              </span>
            </div>
            <div className="mt-1 bg-line dark:bg-bg-inset rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(Number(score) / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-bg-surface rounded-soft shadow-sm border border-line p-6 animate-pulse">
        <div className="flex items-center mb-6">
          <div className="h-6 bg-line rounded w-20 mr-4"></div>
          <div className="h-8 bg-line rounded w-64"></div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-line rounded w-full"></div>
          <div className="h-4 bg-line rounded w-3/4"></div>
          <div className="h-32 bg-line rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !tasting) {
    return (
      <div className="bg-white dark:bg-bg-surface rounded-soft shadow-sm border border-line p-6">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="flex items-center text-fg-muted hover:text-fg mr-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-soft p-4">
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
            <span className="text-red-800">{error || 'No se pudo cargar la cata'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-bg-surface rounded-soft shadow-sm border border-line">
      {/* Header */}
      <div className="border-b border-line p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="flex items-center text-fg-muted hover:text-fg transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver al historial
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(tasting)}
              className="flex items-center bg-orange-600 text-white px-4 py-2 rounded-soft hover:bg-orange-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar
            </button>
          )}
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-fg mb-2">
              {tasting.session_name || `Sesión de ${tasting.category}`}
            </h1>
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(tasting.category)}`}
              >
                {tasting.category}
              </span>
              <span className="text-sm text-fg-subtle">
                {format(new Date(tasting.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
              </span>
              {tasting.completed_at && (
                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check</span>Completada
                </span>
              )}
            </div>
          </div>

          {tasting.average_score && (
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(tasting.average_score)}`}>
                {tasting.average_score.toFixed(1)}
              </div>
              <div className="text-sm text-fg-subtle">Puntuación media</div>
            </div>
          )}
        </div>
      </div>

      {/* Session Info */}
      <div className="p-6 border-b border-line">
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-fg">{tasting.total_items}</div>
              <div className="text-sm text-fg-subtle">Elementos totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{tasting.completed_items}</div>
              <div className="text-sm text-fg-subtle">Completados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Notes */}
      {tasting.notes && (
        <div className="p-6 border-b border-line">
          <h3 className="text-lg font-semibold text-fg mb-3">Notas de la sesión</h3>
          <div className="bg-bg-hover rounded-soft p-4">
            <p className="text-fg-muted whitespace-pre-wrap">{tasting.notes}</p>
          </div>
        </div>
      )}

      {/* Tasting Items */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-fg mb-4">
          Elementos catados ({tasting.items.length})
        </h3>

        {tasting.items.length === 0 ? (
          <div className="text-center py-8 text-fg-subtle">
            <svg
              className="w-12 h-12 text-fg-muted mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0L9 7v4"
              />
            </svg>
            <p>No hay elementos registrados en esta sesión</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tasting.items.map((item, index) => (
              <div key={item.id} className="border border-line rounded-soft p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-fg mb-1">
                      {index + 1}. {item.item_name}
                    </h4>
                    <div className="text-sm text-fg-subtle">
                      {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </div>
                  </div>
                  {item.overall_score && (
                    <div className="text-right">
                      <div className={`text-xl font-bold ${getScoreColor(item.overall_score)}`}>
                        {item.overall_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-fg-subtle">puntuación</div>
                    </div>
                  )}
                </div>

                {/* Flavor Scores */}
                {item.flavor_scores && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-fg-muted mb-2">Perfil de sabores</h5>
                    {renderFlavorScores(item.flavor_scores)}
                  </div>
                )}

                {/* Item Notes */}
                {item.notes && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-fg-muted mb-2">Notas</h5>
                    <div className="bg-bg-hover rounded p-3">
                      <p className="text-sm text-fg-muted whitespace-pre-wrap">{item.notes}</p>
                    </div>
                  </div>
                )}

                {/* Photo */}
                {item.photo_url && (
                  <div>
                    <h5 className="text-sm font-medium text-fg-muted mb-2">Foto</h5>
                    <Image
                      src={item.photo_url}
                      alt={item.item_name}
                      width={400}
                      height={192}
                      className="w-full max-w-md h-48 object-cover rounded-soft"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TastingHistoryDetail;
