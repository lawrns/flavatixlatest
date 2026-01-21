'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface InspirationBoxProps {
  className?: string;
}

const CONTENT_POOL = {
  inspirational_messages: [
    'Cada sorbo cuenta. Tu próxima cata puede revelar un nuevo mundo de sabores.',
    'Los mejores catadores empezaron con un solo café. Sigue explorando.',
    'Tu paladar es único — confía en lo que sientes y descríbelo con tus propias palabras.',
    'Un día, cada nota de sabor que registres será parte de tu propia historia.',
    'Explorar sabores es explorar culturas. Cada cata es un viaje.',
    'No hay respuestas incorrectas en una cata: cada percepción es válida.',
    'La constancia construye conocimiento — cada registro cuenta.',
    'La curiosidad es el mejor ingrediente de un catador.',
  ],
  did_you_know: [
    '¿Sabías que el café tiene más de 800 compuestos aromáticos, más que el vino?',
    'El mezcal artesanal a menudo se destila en ollas de barro, lo que añade notas terrosas únicas.',
    'El cacao fino puede mostrar notas frutales como cereza y ciruela además de chocolate.',
    'El té verde contiene compuestos umami que lo acercan al perfil del caldo dashi japonés.',
    'Algunos vinos naturales presentan notas de fermentación que recuerdan a sidra o kombucha.',
    'La vainilla natural proviene de una orquídea, y su aroma contiene más de 200 moléculas distintas.',
    'El whisky escocés ahumado obtiene su carácter del secado de la malta con turba.',
    'La canela de Ceilán tiene un perfil más delicado y dulce que la canela cassia común.',
  ],
  tasting_tips: [
    'Consejo: Huele antes de probar — tu nariz capta más matices que tu lengua.',
    'Prueba en pequeños sorbos y deja que el líquido cubra toda la lengua.',
    'Entre catas, limpia tu paladar con agua o pan neutro para evitar interferencias.',
    'Tómate tu tiempo: anotar impresiones rápidas ayuda, pero reflexionar mejora la claridad.',
    'Divide tu evaluación en aroma, sabor y retrogusto para mayor precisión.',
    'Repite la cata en diferentes momentos del día: tu percepción cambia.',
    'Mantén tu cuaderno de cata digital: los patrones aparecen con el tiempo.',
    'Concéntrate primero en categorías grandes (frutal, floral, especiado) antes de buscar detalles.',
  ],
  community_highlights: [
    'Más de 12,000 catadores compartieron notas esta semana.',
    'Tu próxima cata contribuye a la rueda de sabores global.',
    'Únete a la comunidad: cada registro ayuda a mapear nuevos perfiles de sabor.',
    'Catadores de 20 países distintos han registrado catas este mes.',
    'Cada día se descubren nuevos matices gracias a la comunidad.',
    'Los perfiles de sabor compartidos ayudan a productores a mejorar la calidad.',
    'Eres parte de una red creciente de exploradores del sabor.',
    'Tus aportes inspiran a otros a ampliar su paladar.',
  ],
};

const ICONS = {
  inspirational_messages: 'auto_awesome',
  did_you_know: 'lightbulb',
  tasting_tips: 'local_bar',
  community_highlights: 'groups',
};

const ICON_COLORS = {
  inspirational_messages: 'text-orange-500', // primary orange
  did_you_know: 'text-amber-500', // amber
  tasting_tips: 'text-orange-600', // primary orange darker
  community_highlights: 'text-green-600', // green
};

const InspirationBox: React.FC<InspirationBoxProps> = ({ className = '' }) => {
  const [currentContent, setCurrentContent] = useState<{
    text: string;
    category: keyof typeof CONTENT_POOL;
    icon: string;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomContent = () => {
    const categories = Object.keys(CONTENT_POOL) as (keyof typeof CONTENT_POOL)[];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const contentArray = CONTENT_POOL[randomCategory];
    const randomText = contentArray[Math.floor(Math.random() * contentArray.length)];

    return {
      text: randomText,
      category: randomCategory,
      icon: ICONS[randomCategory],
    };
  };

  const startRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set initial content
    setCurrentContent(getRandomContent());
    setIsVisible(true);

    // Start rotation every 25 seconds
    intervalRef.current = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentContent(getRandomContent());
        setIsVisible(true);
      }, 300); // Brief pause for transition
    }, 25000);
  }, []);

  useEffect(() => {
    startRotation();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startRotation]);

  if (!currentContent) {
    return null;
  }

  return (
    <div className={`mx-auto max-w-2xl px-4 ${className}`}>
      <div
        className={`
          mx-auto max-w-lg rounded-xl p-5 text-center
          bg-white dark:bg-zinc-800
          shadow-md
          transition-all duration-500 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        {/* Icon */}
        <div className="mb-3">
          <span
            className={`material-symbols-outlined text-2xl ${ICON_COLORS[currentContent.category]}`}
          >
            {currentContent.icon}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed font-body text-zinc-700 dark:text-zinc-200">
          {currentContent.text}
        </p>

        {/* Category indicator */}
        <div className="mt-3 text-xs uppercase tracking-wide font-medium text-zinc-600 dark:text-zinc-400">
          {currentContent.category.replace(/_/g, ' ')}
        </div>
      </div>
    </div>
  );
};

export default InspirationBox;
