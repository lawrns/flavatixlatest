import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FlavorCategory, flavorProfiles, hexToRgb, createWheelSegment } from './flavorWheelData';

interface FlavatixProps {
  category: string;
  selectedFlavors: Record<string, number>;
  onFlavorSelect: (flavors: Record<string, number>) => void;
}

interface MobileFlavorWheelProps extends FlavatixProps {
  isMobile?: boolean;
}

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

// Mobile-optimized Flavor Category Component
const MobileFlavorCategory: React.FC<{
  category: FlavorCategory;
  selectedFlavors: Record<string, number>;
  onFlavorSelect: (flavors: Record<string, number>) => void;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ category, selectedFlavors, onFlavorSelect, isExpanded, onToggle }) => {
  const updateFlavorScore = (flavor: string, score: number) => {
    const newFlavors = { ...selectedFlavors };
    if (score === 0) {
      delete newFlavors[flavor];
    } else {
      newFlavors[flavor] = score;
    }
    onFlavorSelect(newFlavors);
  };

  const getFlavorScore = (flavor: string): number => {
    return selectedFlavors[flavor] || 0;
  };

  const selectedCount = category.flavors.filter(flavor => getFlavorScore(flavor) > 0).length;

  return (
    <div className="border border-border-default rounded-lg overflow-hidden mb-sm">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full p-md flex items-center justify-between bg-surface-secondary hover:bg-surface-tertiary transition-colors"
        style={{ backgroundColor: `${category.color}15` }}
      >
        <div className="flex items-center gap-sm">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <span className="font-heading font-semibold text-text-primary">
            {category.name}
          </span>
          {selectedCount > 0 && (
            <span className="bg-primary-100 text-primary-800 px-xs py-xs rounded-full text-xs font-medium">
              {selectedCount}
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Category Flavors */}
      {isExpanded && (
        <div className="p-md space-y-sm">
          {category.flavors.map((flavor) => {
            const currentScore = getFlavorScore(flavor);
            return (
              <div key={flavor} className="space-y-xs">
                <div className="flex items-center justify-between">
                  <span className="text-body font-medium text-text-primary">{flavor}</span>
                  <span className="text-sm text-text-secondary font-semibold">
                    {currentScore}/5
                  </span>
                </div>
                
                {/* Mobile-optimized rating buttons */}
                <div className="flex gap-xs">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => updateFlavorScore(flavor, currentScore === score ? 0 : score)}
                      className={`
                        flex-1 h-12 rounded-lg border-2 font-bold text-sm transition-all duration-200
                        ${currentScore >= score
                          ? 'border-transparent text-white shadow-lg'
                          : 'border-border-default text-text-secondary hover:border-primary-400'
                        }
                      `}
                      style={{
                        backgroundColor: currentScore >= score ? category.color : 'transparent',
                        opacity: currentScore >= score ? 0.8 + (score / 5) * 0.2 : 1,
                        transform: currentScore >= score ? 'scale(0.98)' : 'scale(1)',
                      }}
                    >
                      {score}
                    </button>
                  ))}
                </div>

                {/* Progress bar */}
                {currentScore > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(currentScore / 5) * 100}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Flavatix: React.FC<FlavatixProps> = ({
  category,
  selectedFlavors,
  onFlavorSelect,
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

  const categories = flavorProfiles[category] || flavorProfiles.coffee;

  // Función para obtener el color de la categoría actual
  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#3b82f6';
  };

  // Función para generar el estilo del círculo según el nivel
  const getCircleStyle = (currentScore: number, buttonLevel: number, categoryName: string) => {
    const categoryColor = getCategoryColor(categoryName);
    const isSelected = currentScore >= buttonLevel;
    const intensity = isSelected ? (buttonLevel / 5) : 0;
    const rgb = hexToRgb(categoryColor);
    
    if (isSelected) {
      // Calcular opacidad y saturación basada en el nivel
      const baseOpacity = 0.4 + (intensity * 0.6); // 0.4 a 1.0
      const glowOpacity = 0.2 + (intensity * 0.3); // 0.2 a 0.5
      const shadowIntensity = 4 + (intensity * 16); // 4px a 20px
      const scaleEffect = 0.98 + (intensity * 0.08); // 0.98 a 1.06
      
      return {
        background: `radial-gradient(circle at 30% 30%, 
          rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseOpacity + 0.2}) 0%, 
          rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseOpacity}) 50%, 
          rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseOpacity - 0.1}) 100%)`,
        borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.8 + intensity * 0.2})`,
        borderWidth: '2px',
        boxShadow: `
          0 0 ${shadowIntensity}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${glowOpacity}),
          inset 0 2px 4px rgba(255, 255, 255, ${0.1 + intensity * 0.2}),
          inset 0 -1px 2px rgba(0, 0, 0, 0.1)
        `,
        transform: `scale(${scaleEffect})`,
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        filter: `saturate(${0.8 + intensity * 0.4}) brightness(${0.9 + intensity * 0.2})`
      };
    } else {
      return {
        background: `radial-gradient(circle at 30% 30%, 
          rgba(255, 255, 255, 0.15) 0%, 
          rgba(255, 255, 255, 0.08) 50%, 
          rgba(255, 255, 255, 0.05) 100%)`,
        borderColor: 'rgba(156, 163, 175, 0.3)',
        borderWidth: '2px',
        boxShadow: `
          inset 0 2px 4px rgba(0, 0, 0, 0.1),
          0 1px 2px rgba(0, 0, 0, 0.05)
        `,
        transform: 'scale(1)',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        filter: 'saturate(0.6) brightness(0.8)'
      };
    }
  };

  // Calcular el ángulo necesario para posicionar una categoría en las 6 en punto (180°)
  const calculateRotationTo6OClock = (categoryIndex: number) => {
    const categoryAngle = categories[categoryIndex].angle;
    // Para posicionar en las 6 en punto, necesitamos rotar 180° - ángulo de la categoría
    const targetAngle = 180 - categoryAngle;
    return targetAngle;
  };

  const updateFlavorScore = (flavor: string, score: number) => {
    const newFlavors = { ...selectedFlavors };
    if (score === 0) {
      delete newFlavors[flavor];
    } else {
      newFlavors[flavor] = score;
    }
    onFlavorSelect(newFlavors);
  };

  const getFlavorScore = (flavor: string): number => {
    return selectedFlavors[flavor] || 0;
  };

  const getCategorySelectedCount = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (!category) return 0;
    return category.flavors.filter(flavor => getFlavorScore(flavor) > 0).length;
  };

  const toggleWheel = () => {
    setIsFlipped(!isFlipped);
    setWheelRotation(prev => prev + 180);
  };

  const handleCategoryClick = (categoryName: string, index: number) => {
    setActiveCategory(activeCategory === categoryName ? null : categoryName);
    
    // Calcular la rotación necesaria para posicionar este botón en las 6 en punto
    const rotationTo6OClock = calculateRotationTo6OClock(index);
    setWheelRotation(rotationTo6OClock);
  };

  const toggleCategoryExpansion = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="card p-md">
        <h3 className="text-h4 font-heading font-semibold text-text-primary mb-md">Flavor Profile</h3>
        
        {/* Mobile Category List */}
        <div className="space-y-sm">
          {categories.map((cat) => (
            <MobileFlavorCategory
              key={cat.name}
              category={cat}
              selectedFlavors={selectedFlavors}
              onFlavorSelect={onFlavorSelect}
              isExpanded={expandedCategories.has(cat.name)}
              onToggle={() => toggleCategoryExpansion(cat.name)}
            />
          ))}
        </div>

        {/* Selected Flavors Summary */}
        {Object.keys(selectedFlavors).length > 0 && (
          <div className="mt-lg bg-surface-secondary rounded-lg p-md">
            <h4 className="text-h5 font-heading font-semibold text-text-primary mb-sm">
              Selected Flavors ({Object.keys(selectedFlavors).length})
            </h4>
            <div className="flex flex-wrap gap-xs">
              {Object.entries(selectedFlavors).map(([flavor, score]) => (
                <span
                  key={flavor}
                  className="inline-flex items-center gap-xs bg-primary-100 text-primary-800 px-sm py-xs rounded-full text-xs font-medium"
                >
                  {flavor}
                  <span className="bg-primary-200 text-primary-900 px-xs rounded-full text-xs font-bold">
                    {score}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout (Original)
  return (
    <div className="card p-md">
      <h3 className="text-h4 font-heading font-semibold text-text-primary mb-md">Flavor Profile</h3>

      {/* Rueda de Sabores Auténtica */}
      <div className="relative max-w-md mx-auto mb-lg">
        {/* Contenedor 3D de la Rueda */}
        <div
          className="relative aspect-square w-full preserve-3d transition-transform duration-700 ease-in-out"
          style={{
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            perspective: '1000px'
          }}
        >
          {/* Lado Frontal - Tasting del Usuario */}
          <div className="absolute inset-0 backface-hidden">
            <div className="relative w-full h-full">
              {/* SVG de la Rueda */}
              <svg
                 viewBox="-150 -150 300 300"
                 className="w-full h-full drop-shadow-2xl"
                 style={{ 
                   filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.25))',
                   transform: `rotate(${wheelRotation}deg)`,
                   transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
                 }}
               >
                 {/* Definiciones de gradientes */}
                 <defs>
                   {categories.map((cat, index) => (
                     <radialGradient key={`gradient-${index}`} id={`gradient-${index}`} cx="0%" cy="0%" r="100%">
                       <stop offset="0%" stopColor={cat.color} stopOpacity="0.9" />
                       <stop offset="70%" stopColor={cat.color} stopOpacity="1" />
                       <stop offset="100%" stopColor={cat.color} stopOpacity="0.8" />
                     </radialGradient>
                   ))}
                   
                   {/* Filtros para efectos */}
                   <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                     <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                     <feMerge> 
                       <feMergeNode in="coloredBlur"/>
                       <feMergeNode in="SourceGraphic"/>
                     </feMerge>
                   </filter>
                   
                   {/* Filtro de sombra interna para profundidad */}
                   <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
                     <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
                     <feOffset dx="2" dy="2" result="offset"/>
                     <feFlood floodColor="rgba(0,0,0,0.3)"/>
                     <feComposite in2="offset" operator="in"/>
                     <feComposite in2="SourceGraphic" operator="over"/>
                   </filter>
                 </defs>

                 {/* Anillo exterior decorativo */}
                 <circle
                   cx="0"
                   cy="0"
                   r="145"
                   fill="none"
                   stroke="rgba(255, 255, 255, 0.2)"
                   strokeWidth="1"
                   className="animate-pulse"
                 />

                 {/* Segmentos de la Rueda */}
                 {categories.map((cat, index) => {
                   const segmentAngle = 360 / categories.length;
                   const startAngle = cat.angle - segmentAngle / 2;
                   const endAngle = cat.angle + segmentAngle / 2;
                   const isSelected = getCategorySelectedCount(cat.name) > 0;
                   const isHovered = hoveredSegment === cat.name;
                   
                   return (
                     <g key={cat.name}>
                       {/* Segmento Principal */}
                       <path
                         d={createWheelSegment(startAngle, endAngle, 140, 45)}
                         fill={`url(#gradient-${index})`}
                         stroke="rgba(255, 255, 255, 0.3)"
                         strokeWidth="2"
                         className={`
                           cursor-pointer transition-all duration-300 ease-in-out
                           ${isHovered ? 'brightness-110' : ''}
                           ${isSelected ? 'brightness-125' : ''}
                         `}
                         style={{
                           filter: isHovered ? 'url(#glow) brightness(1.1) saturate(1.2) url(#innerShadow)' : isSelected ? 'brightness(1.15) saturate(1.1) url(#innerShadow)' : 'url(#innerShadow)',
                           transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                           transformOrigin: 'center'
                         }}
                         onClick={() => handleCategoryClick(cat.name, index)}
                         onMouseEnter={() => setHoveredSegment(cat.name)}
                         onMouseLeave={() => setHoveredSegment(null)}
                       />
                       
                       {/* Líneas divisorias entre segmentos */}
                       <line
                         x1={Math.cos((startAngle * Math.PI) / 180) * 45}
                         y1={Math.sin((startAngle * Math.PI) / 180) * 45}
                         x2={Math.cos((startAngle * Math.PI) / 180) * 140}
                         y2={Math.sin((startAngle * Math.PI) / 180) * 140}
                         stroke="rgba(255, 255, 255, 0.4)"
                         strokeWidth="1"
                         className="pointer-events-none"
                       />
                       
                       {/* Texto del Segmento */}
                       <text
                         x={Math.cos((cat.angle * Math.PI) / 180) * 92}
                         y={Math.sin((cat.angle * Math.PI) / 180) * 92}
                         textAnchor="middle"
                         dominantBaseline="middle"
                         className="fill-white text-sm font-bold pointer-events-none select-none"
                         style={{
                           filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
                           fontSize: '12px'
                         }}
                       >
                         {cat.name}
                       </text>
                     </g>
                   );
                 })}

                 {/* Centro de la Rueda - Eje */}
                 <g>
                   {/* Eje principal */}
                   <circle
                     cx="0"
                     cy="0"
                     r="40"
                     fill="linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(200,200,200,0.8) 100%)"
                     stroke="rgba(255, 255, 255, 0.6)"
                     strokeWidth="3"
                     className="drop-shadow-lg"
                   />
                   
                   {/* Círculo interior animado */}
                   <circle
                     cx="0"
                     cy="0"
                     r="25"
                     fill="rgba(255, 255, 255, 0.1)"
                     className="animate-pulse"
                   />
                   
                   {/* Puntos decorativos del eje */}
                   {[0, 90, 180, 270].map((angle, i) => (
                     <circle
                       key={i}
                       cx={Math.cos((angle * Math.PI) / 180) * 30}
                       cy={Math.sin((angle * Math.PI) / 180) * 30}
                       r="3"
                       fill="rgba(255, 255, 255, 0.7)"
                       className="animate-spin"
                       style={{ animationDuration: '4s', animationDelay: `${i * 0.5}s` }}
                     />
                   ))}
                 </g>
               </svg>
            </div>
          </div>

          {/* Lado Trasero - Información Adicional */}
          <div className="absolute inset-0 backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
            <div className="w-full h-full bg-gradient-to-br from-surface-secondary to-surface-tertiary rounded-full border-4 border-border-primary flex items-center justify-center">
              <div className="text-center p-lg">
                <h4 className="text-h5 font-heading font-semibold text-text-primary mb-sm">Flavor Analysis</h4>
                <p className="text-body-sm text-text-secondary">
                  Total flavors selected: {Object.keys(selectedFlavors).length}
                </p>
                <div className="mt-md">
                  <div className="text-xs text-text-tertiary">
                    Intensity Average: {Object.keys(selectedFlavors).length > 0 
                      ? (Object.values(selectedFlavors).reduce((a, b) => a + b, 0) / Object.keys(selectedFlavors).length).toFixed(1)
                      : '0.0'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de Alternancia */}
        <button
          onClick={toggleWheel}
          className="absolute top-4 right-4 bg-primary-500 hover:bg-primary-600 text-white p-sm rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Sabores de la Categoría Activa */}
      {activeCategory && (
        <div className="mb-lg">
          <h4 className="text-h5 font-heading font-semibold text-text-primary mb-sm">
            {activeCategory} Flavors
          </h4>
          <div className="grid grid-cols-2 gap-sm">
            {categories
              .find(cat => cat.name === activeCategory)
              ?.flavors.map((flavor) => {
                const currentScore = getFlavorScore(flavor);
                return (
                  <div key={flavor} className="bg-surface-secondary rounded-lg p-sm hover:bg-surface-tertiary transition-colors duration-200">
                    <div className="flex items-center justify-between mb-xs">
                      <span className="text-body-sm font-medium text-text-primary">{flavor}</span>
                      <span className="text-xs text-text-secondary font-semibold">
                        {currentScore}/5
                      </span>
                    </div>
                    <div className="flex gap-xs justify-center">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => updateFlavorScore(flavor, currentScore === score ? 0 : score)}
                          className="w-8 h-8 rounded-full border-2 relative overflow-hidden group"
                          style={getCircleStyle(currentScore, score, activeCategory)}
                          onMouseEnter={(e) => {
                            const categoryColor = getCategoryColor(activeCategory);
                            const rgb = hexToRgb(categoryColor);
                            
                            if (currentScore < score) {
                              // Preview del nivel al hacer hover
                              e.currentTarget.style.background = `radial-gradient(circle at 30% 30%, 
                                rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3) 0%, 
                                rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2) 50%, 
                                rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) 100%)`;
                              e.currentTarget.style.borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
                              e.currentTarget.style.transform = 'scale(1.05)';
                            } else {
                              // Efecto de brillo en niveles seleccionados
                              e.currentTarget.style.filter = `saturate(1.2) brightness(1.1)`;
                              e.currentTarget.style.transform = `scale(${1.02 + (score / 5) * 0.08})`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            const originalStyle = getCircleStyle(currentScore, score, activeCategory);
                            Object.assign(e.currentTarget.style, originalStyle);
                          }}
                        >
                          {/* Efecto de brillo interno mejorado */}
                          {currentScore >= score && (
                            <div 
                              className="absolute inset-0 rounded-full opacity-30"
                              style={{
                                background: `linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%, rgba(255,255,255,0.3) 100%)`,
                                animation: 'pulse 2s infinite'
                              }}
                            />
                          )}
                          
                          {/* Número del nivel */}
                          <span 
                            className={`text-xs font-bold relative z-10 transition-colors duration-300 ${
                              currentScore >= score ? 'text-white drop-shadow-sm' : 'text-gray-400'
                            }`}
                          >
                            {score}
                          </span>
                          
                          {/* Efecto de ondas al hacer clic */}
                          <div className="absolute inset-0 rounded-full opacity-0 group-active:opacity-100 group-active:animate-ping bg-white/30" />
                        </button>
                      ))}
                    </div>
                    
                    {/* Barra de progreso visual */}
                    {currentScore > 0 && (
                      <div className="mt-xs">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${(currentScore / 5) * 100}%`,
                              background: `linear-gradient(90deg, ${getCategoryColor(activeCategory)}80 0%, ${getCategoryColor(activeCategory)} 100%)`,
                              boxShadow: `0 0 8px ${getCategoryColor(activeCategory)}40`
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Resumen de Sabores Seleccionados */}
      {Object.keys(selectedFlavors).length > 0 && (
        <div className="bg-surface-secondary rounded-lg p-md">
          <h4 className="text-h5 font-heading font-semibold text-text-primary mb-sm">
            Selected Flavors
          </h4>
          <div className="flex flex-wrap gap-xs">
            {Object.entries(selectedFlavors).map(([flavor, score]) => (
              <span
                key={flavor}
                className="inline-flex items-center gap-xs bg-primary-100 text-primary-800 px-sm py-xs rounded-full text-xs font-medium"
              >
                {flavor}
                <span className="bg-primary-200 text-primary-900 px-xs rounded-full text-xs">
                  {score}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Flavatix;