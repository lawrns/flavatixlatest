import React from 'react';

/**
 * Minimalist SVG Illustrations for Flavatix
 * Jony Ive aesthetic: clean, scalable, elegant
 * Used for onboarding, empty states, and UI elements
 */

export const SVGIllustrations = {
  // ONBOARDING ILLUSTRATIONS

  /**
   * Discover: Elegant tasting glass with subtle highlights
   */
  Discover: () => (
    <svg viewBox="0 0 200 280" className="w-full h-full">
      {/* Glass shape */}
      <path
        d="M 50 80 L 70 180 Q 70 200 80 210 L 120 210 Q 130 200 130 180 L 150 80 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary"
      />
      {/* Wine/liquid inside */}
      <path
        d="M 60 140 Q 60 160 70 180 Q 70 195 80 205 L 120 205 Q 130 195 130 180 Q 140 160 140 140 Z"
        fill="currentColor"
        opacity="0.15"
        className="text-primary"
      />
      {/* Highlight shimmer */}
      <ellipse cx="70" cy="100" rx="8" ry="20" fill="currentColor" opacity="0.3" className="text-primary" />
      {/* Base */}
      <rect x="65" y="210" width="70" height="6" rx="3" fill="currentColor" className="text-primary" />
    </svg>
  ),

  /**
   * Taste: Flavor wheel with minimal segments
   */
  Taste: () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Outer circle */}
      <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
      {/* Middle circle */}
      <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" className="text-primary" />
      {/* Inner circle */}
      <circle cx="100" cy="100" r="20" fill="currentColor" opacity="0.15" className="text-primary" />
      {/* Dividing lines (minimalist) */}
      <line x1="100" y1="30" x2="100" y2="170" stroke="currentColor" strokeWidth="1" opacity="0.3" className="text-primary" />
      <line x1="30" y1="100" x2="170" y2="100" stroke="currentColor" strokeWidth="1" opacity="0.3" className="text-primary" />
      {/* Diagonal dividers */}
      <line x1="55" y1="55" x2="145" y2="145" stroke="currentColor" strokeWidth="1" opacity="0.2" className="text-primary" />
      <line x1="145" y1="55" x2="55" y2="145" stroke="currentColor" strokeWidth="1" opacity="0.2" className="text-primary" />
    </svg>
  ),

  /**
   * Connect: Hands toasting - minimalist
   */
  Connect: () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Left hand/glass */}
      <path
        d="M 50 120 L 60 60 L 70 65 L 60 130 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-primary"
      />
      {/* Left glass */}
      <path
        d="M 60 60 L 75 100 L 70 120 L 50 120 Z"
        fill="currentColor"
        opacity="0.1"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-primary"
      />
      {/* Right hand/glass */}
      <path
        d="M 150 120 L 140 60 L 130 65 L 140 130 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-primary"
      />
      {/* Right glass */}
      <path
        d="M 140 60 L 125 100 L 130 120 L 150 120 Z"
        fill="currentColor"
        opacity="0.1"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-primary"
      />
      {/* Celebration sparkles */}
      <circle cx="100" cy="40" r="3" fill="currentColor" className="text-orange-500" />
      <circle cx="85" cy="50" r="2" fill="currentColor" opacity="0.6" className="text-orange-500" />
      <circle cx="115" cy="50" r="2" fill="currentColor" opacity="0.6" className="text-orange-500" />
    </svg>
  ),

  /**
   * Ready: Flavatix brand icon - geometric vessel
   */
  Ready: () => (
    <svg viewBox="0 0 200 240" className="w-full h-full">
      {/* Main vessel shape */}
      <path
        d="M 60 80 L 50 180 Q 50 210 70 220 L 130 220 Q 150 210 150 180 L 140 80 Q 140 60 120 60 L 80 60 Q 60 60 60 80 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-primary"
      />
      {/* Rim */}
      <path d="M 60 80 Q 60 70 70 70 L 130 70 Q 140 70 140 80" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
      {/* Gradient fill suggestion */}
      <path
        d="M 60 140 Q 60 160 70 180 Q 70 205 100 215 Q 130 205 130 180 Q 140 160 140 140 Z"
        fill="currentColor"
        opacity="0.08"
        className="text-primary"
      />
      {/* Decorative stars */}
      <g fill="currentColor" opacity="0.5" className="text-orange-500">
        <circle cx="45" cy="100" r="2" />
        <circle cx="155" cy="120" r="2" />
        <circle cx="40" cy="160" r="1.5" />
      </g>
    </svg>
  ),

  // EMPTY STATE ICONS

  /**
   * Empty Tastings: Patient waiting glass
   */
  EmptyTastings: () => (
    <svg viewBox="0 0 160 200" className="w-full h-full">
      {/* Glass body */}
      <path
        d="M 50 60 L 65 150 Q 65 165 75 170 L 85 170 Q 95 165 95 150 L 110 60 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-zinc-300 dark:text-zinc-600"
      />
      {/* Glass rim */}
      <path d="M 50 60 Q 50 50 60 50 L 100 50 Q 110 50 110 60" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-300 dark:text-zinc-600" />
      {/* Waiting gesture - arm */}
      <path d="M 95 90 Q 110 85 120 95" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-300 dark:text-zinc-600" />
      {/* Simple face - dot eyes */}
      <circle cx="72" cy="65" r="1.5" fill="currentColor" className="text-zinc-400 dark:text-zinc-500" />
    </svg>
  ),

  /**
   * Empty Flavor Wheel: Minimalist wheel outline
   */
  EmptyFlavorWheel: () => (
    <svg viewBox="0 0 160 160" className="w-full h-full">
      {/* Outer circle */}
      <circle cx="80" cy="80" r="60" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-300 dark:text-zinc-600" />
      {/* Middle ring */}
      <circle cx="80" cy="80" r="38" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" className="text-zinc-300 dark:text-zinc-600" />
      {/* Inner circle */}
      <circle cx="80" cy="80" r="15" fill="currentColor" opacity="0.08" className="text-zinc-400 dark:text-zinc-600" />
      {/* Minimal dividers */}
      <line x1="80" y1="20" x2="80" y2="140" stroke="currentColor" strokeWidth="1" opacity="0.2" className="text-zinc-300 dark:text-zinc-600" />
      <line x1="20" y1="80" x2="140" y2="80" stroke="currentColor" strokeWidth="1" opacity="0.2" className="text-zinc-300 dark:text-zinc-600" />
    </svg>
  ),

  /**
   * Empty Social: Reaching glass with hearts
   */
  EmptySocial: () => (
    <svg viewBox="0 0 160 200" className="w-full h-full">
      {/* Glass reaching out */}
      <path
        d="M 50 80 L 65 150 Q 65 165 75 170 L 85 170 Q 95 165 95 150 L 105 80 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-zinc-300 dark:text-zinc-600"
      />
      {/* Motion lines */}
      <path d="M 100 100 L 125 90" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" className="text-zinc-300 dark:text-zinc-600" />
      <path d="M 100 120 L 130 125" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" className="text-zinc-300 dark:text-zinc-600" />
      {/* Floating hearts */}
      <g fill="currentColor" opacity="0.5" className="text-red-300 dark:text-red-400">
        <path d="M 125 70 Q 125 60 130 60 Q 135 60 135 65 Q 135 70 130 75 Q 125 70 125 70" />
        <path d="M 110 50 Q 110 42 115 42 Q 120 42 120 47 Q 120 52 115 56 Q 110 52 110 50" />
      </g>
    </svg>
  ),

  /**
   * Empty Competition: Trophy outline with doubt
   */
  EmptyCompetition: () => (
    <svg viewBox="0 0 160 200" className="w-full h-full">
      {/* Trophy body */}
      <path
        d="M 50 60 L 55 100 Q 55 115 65 120 L 95 120 Q 105 115 105 100 L 110 60 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-zinc-300 dark:text-zinc-600"
      />
      {/* Trophy handles */}
      <path d="M 55 80 Q 40 85 40 100" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-300 dark:text-zinc-600" />
      <path d="M 105 80 Q 120 85 120 100" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-300 dark:text-zinc-600" />
      {/* Base */}
      <rect x="45" y="120" width="70" height="4" rx="2" fill="currentColor" className="text-zinc-300 dark:text-zinc-600" />
      {/* Question mark doubt */}
      <text x="80" y="85" fontSize="20" textAnchor="middle" fill="currentColor" opacity="0.4" className="text-zinc-400 dark:text-zinc-500">
        ?
      </text>
    </svg>
  ),

  /**
   * Empty Search: Magnifying glass with confusion
   */
  EmptySearch: () => (
    <svg viewBox="0 0 160 200" className="w-full h-full">
      {/* Magnifying glass */}
      <circle cx="70" cy="70" r="35" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-300 dark:text-zinc-600" />
      {/* Magnifying glass handle */}
      <line x1="100" y1="100" x2="125" y2="125" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-300 dark:text-zinc-600" />
      {/* Glass interior detail */}
      <circle cx="70" cy="70" r="20" fill="currentColor" opacity="0.05" className="text-zinc-400 dark:text-zinc-600" />
      {/* Confused dots (eyes) */}
      <circle cx="65" cy="65" r="1.5" fill="currentColor" className="text-zinc-400 dark:text-zinc-500" />
      <circle cx="75" cy="65" r="1.5" fill="currentColor" className="text-zinc-400 dark:text-zinc-500" />
      {/* Confused expression */}
      <path d="M 65 75 Q 70 77 75 75" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" className="text-zinc-400 dark:text-zinc-500" />
    </svg>
  ),
};

export default SVGIllustrations;
