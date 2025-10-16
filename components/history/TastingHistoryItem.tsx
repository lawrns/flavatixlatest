import React, { useState } from 'react';
import { TastingHistory } from '../../lib/historyService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TastingHistoryItemProps {
  tasting: TastingHistory;
  onClick: (tasting: TastingHistory) => void;
  onDelete: (id: string) => void;
}

const TastingHistoryItem: React.FC<TastingHistoryItemProps> = ({ tasting, onClick, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
      locale: es 
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'coffee': 'bg-amber-100 text-amber-800',
      'wine': 'bg-purple-100 text-purple-800',
      'tea': 'bg-green-100 text-green-800',
      'chocolate': 'bg-yellow-100 text-yellow-800',
      'cheese': 'bg-orange-100 text-orange-800',
      'beer': 'bg-blue-100 text-blue-800',
      'spirits': 'bg-red-100 text-red-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    if (score >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se active el onClick del contenedor
    if (isDeleting) return;
    
    setIsDeleting(true);
    onDelete(tasting.id);
  };

  return (
    <div 
      className="group/card bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200/60 p-4 sm:p-6 hover:shadow-lg hover:border-gray-300/60 transition-all duration-300 cursor-pointer relative overflow-hidden backdrop-blur-sm"
      onClick={() => onClick(tasting)}
    >
      {/* Gradiente sutil de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/30 to-transparent opacity-60 pointer-events-none" />
      
      {/* Botón de eliminar */}
      <button
        onClick={handleDeleteClick}
        disabled={isDeleting}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 group flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-white via-white to-gray-50/90 backdrop-blur-xl border border-red-100/80 text-red-500 hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:border-red-400 hover:shadow-red-200/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-white disabled:hover:via-white disabled:hover:to-gray-50/90 disabled:hover:text-red-500 disabled:hover:border-red-100/80 z-20 transform hover:scale-110 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-red-400/60 focus:ring-offset-2 focus:ring-offset-white"
        aria-label="Eliminar cata"
        title="Eliminar cata"
      >
        {isDeleting ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5 transition-all duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>

      {/* Contenido principal */}
      <div className="relative z-10">
        {/* Header con título y puntuación */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 pr-12 sm:pr-16">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-2 truncate group-hover/card:text-orange-600 transition-colors duration-300">
              {tasting.session_name || `Sesión de ${tasting.category}`}
            </h3>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getCategoryColor(tasting.category)} border border-current/20`}>
                {tasting.category}
              </span>
              <span className="text-sm text-gray-500 font-medium">
                {formatDate(tasting.created_at)}
              </span>
            </div>
          </div>
          
          {tasting.average_score && (
            <div className="flex-shrink-0 text-center sm:text-right">
              <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(tasting.average_score)} mb-1`}>
                {tasting.average_score.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">puntuación</div>
            </div>
          )}
        </div>

        {/* Estadísticas y progreso */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <span className="text-lg font-bold text-orange-600">{tasting.completed_items}</span>
              <span className="text-gray-400 font-normal">de</span>
              <span className="text-lg font-bold text-gray-600">{tasting.total_items}</span>
              <span className="text-gray-500 ml-1">elementos</span>
            </div>
            
            {/* Barra de progreso */}
            <div className="hidden sm:flex items-center ml-3">
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
                  style={{ width: `${(tasting.completed_items / tasting.total_items) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 ml-2 font-medium">
                {Math.round((tasting.completed_items / tasting.total_items) * 100)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center text-orange-500 group-hover/card:text-orange-600 transition-colors duration-300">
            <span className="text-sm font-medium mr-2">Ver detalles</span>
            <svg className="w-4 h-4 transform group-hover/card:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Barra de progreso móvil */}
        <div className="sm:hidden mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-medium">Progreso</span>
            <span className="font-medium">{Math.round((tasting.completed_items / tasting.total_items) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
              style={{ width: `${(tasting.completed_items / tasting.total_items) * 100}%` }}
            />
          </div>
        </div>

        {/* Notas */}
        {tasting.notes && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 flex-1">
                {tasting.notes}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TastingHistoryItem;