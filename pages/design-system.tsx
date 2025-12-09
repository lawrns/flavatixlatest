/**
 * Design System Reference Page
 *
 * The single source of truth for all UI components, colors, typography,
 * and interaction patterns in Flavatix.
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { cn } from '@/lib/utils';

// UI Components
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { LoadingState, InlineLoading } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScoreRing, ScoreBadge } from '@/components/ui/ScoreRing';
import { FlavorPill } from '@/components/ui/FlavorPill';
import { AvatarWithFallback } from '@/components/ui/AvatarWithFallback';
import { FormStepper, StepperProgress, StepContent, StepperNavigation, FormStepperProvider } from '@/components/ui/FormStepper';
import Combobox from '@/components/ui/Combobox';

// Icons
import { Sun, Moon, Search, Mail, Lock, Eye, ChevronRight, Heart, Share2, Star, Check, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

// ============================================================================
// NAVIGATION
// ============================================================================

const sections = [
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'inputs', label: 'Form Inputs' },
  { id: 'cards', label: 'Cards' },
  { id: 'modals', label: 'Modals' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'progress', label: 'Progress' },
  { id: 'domain', label: 'Domain Components' },
  { id: 'accessibility', label: 'Accessibility' },
];

// ============================================================================
// SECTION WRAPPER
// ============================================================================

interface SectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, title, description, children }) => (
  <section id={id} className="scroll-mt-24 py-12 border-b border-zinc-200 dark:border-zinc-800 last:border-0">
    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{title}</h2>
    {description && (
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl">{description}</p>
    )}
    {children}
  </section>
);

interface SubSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const SubSection: React.FC<SubSectionProps> = ({ title, children, className }) => (
  <div className={cn('mb-10', className)}>
    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4">{title}</h3>
    {children}
  </div>
);

// ============================================================================
// COLOR SWATCH
// ============================================================================

interface ColorSwatchProps {
  name: string;
  value: string;
  variable?: string;
  tailwind?: string;
  usage?: string;
  textColor?: 'light' | 'dark';
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({
  name,
  value,
  variable,
  tailwind,
  usage,
  textColor = 'light'
}) => (
  <div className="flex flex-col">
    <div
      className={cn(
        'w-full h-20 rounded-xl flex items-end p-3 shadow-sm',
        textColor === 'light' ? 'text-white' : 'text-zinc-900'
      )}
      style={{ backgroundColor: value }}
    >
      <span className="text-xs font-mono opacity-90">{value}</span>
    </div>
    <div className="mt-2">
      <p className="font-medium text-sm text-zinc-900 dark:text-white">{name}</p>
      {variable && <p className="text-xs text-zinc-500 font-mono">{variable}</p>}
      {tailwind && <p className="text-xs text-zinc-400">{tailwind}</p>}
      {usage && <p className="text-xs text-zinc-400 mt-1">{usage}</p>}
    </div>
  </div>
);

// ============================================================================
// COMPONENT SHOWCASE
// ============================================================================

interface ShowcaseProps {
  title: string;
  children: React.ReactNode;
  code?: string;
}

const Showcase: React.FC<ShowcaseProps> = ({ title, children }) => (
  <div className="mb-6">
    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-3">{title}</p>
    <div className="flex flex-wrap items-center gap-4">
      {children}
    </div>
  </div>
);

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function DesignSystemPage() {
  const [isDark, setIsDark] = useState(false);
  const [activeSection, setActiveSection] = useState('colors');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [comboValue, setComboValue] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Dark mode toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileNavOpen(false);
    }
  };

  // Sample steps for FormStepper demo
  const demoSteps = [
    { id: 'step1', title: 'Select Spirit', description: 'Choose your tequila' },
    { id: 'step2', title: 'Tasting Notes', description: 'Record flavors' },
    { id: 'step3', title: 'Rate & Save', description: 'Final score' },
  ];

  return (
    <>
      <Head>
        <title>Design System | Flavatix</title>
        <meta name="description" content="Flavatix Design System - UI components, colors, and patterns" />
      </Head>

      <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Flavatix Design System
                </h1>
                <span className="hidden sm:inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  v1.0
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Dark mode toggle */}
                <button
                  onClick={() => setIsDark(!isDark)}
                  className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                  )}
                </button>

                {/* Mobile nav toggle */}
                <button
                  onClick={() => setMobileNavOpen(!mobileNavOpen)}
                  className="lg:hidden p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Toggle navigation"
                >
                  <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile navigation */}
          {mobileNavOpen && (
            <nav className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <ul className="space-y-2">
                {sections.map(({ id, label }) => (
                  <li key={id}>
                    <button
                      onClick={() => scrollToSection(id)}
                      className={cn(
                        'w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        activeSection === id
                          ? 'bg-primary/10 text-primary'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      )}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Sidebar navigation (desktop) */}
            <aside className="hidden lg:block w-56 shrink-0">
              <nav className="sticky top-24 py-8">
                <ul className="space-y-1">
                  {sections.map(({ id, label }) => (
                    <li key={id}>
                      <button
                        onClick={() => scrollToSection(id)}
                        className={cn(
                          'w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          activeSection === id
                            ? 'bg-primary/10 text-primary'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        )}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0 py-8">

              {/* ================================================================ */}
              {/* COLORS SECTION */}
              {/* ================================================================ */}
              <Section
                id="colors"
                title="Colors"
                description="Brand colors, semantic colors, and flavor profile palette. All colors support dark mode."
              >
                {/* Primary Colors */}
                <SubSection title="Primary Colors - Gemini Rust Red">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    <ColorSwatch name="Primary 50" value="#fef2f0" variable="--color-primary-50" tailwind="bg-primary-50" textColor="dark" />
                    <ColorSwatch name="Primary 100" value="#fde4df" variable="--color-primary-100" tailwind="bg-primary-100" textColor="dark" />
                    <ColorSwatch name="Primary 200" value="#fbc9bf" variable="--color-primary-200" tailwind="bg-primary-200" textColor="dark" />
                    <ColorSwatch name="Primary 300" value="#f7a08f" variable="--color-primary-300" tailwind="bg-primary-300" textColor="dark" />
                    <ColorSwatch name="Primary 400" value="#f0705a" variable="--color-primary-400" tailwind="bg-primary-400" />
                    <ColorSwatch name="Primary 500" value="#C63C22" variable="--color-primary" tailwind="bg-primary" usage="Primary buttons, CTAs" />
                    <ColorSwatch name="Primary 600" value="#b3351e" variable="--color-primary-600" tailwind="bg-primary-600" usage="Hover state" />
                    <ColorSwatch name="Primary 700" value="#962c19" variable="--color-primary-700" tailwind="bg-primary-700" />
                    <ColorSwatch name="Primary 800" value="#7a2415" variable="--color-primary-800" tailwind="bg-primary-800" />
                    <ColorSwatch name="Primary 900" value="#651e11" variable="--color-primary-900" tailwind="bg-primary-900" />
                  </div>
                </SubSection>

                {/* Secondary Colors */}
                <SubSection title="Secondary Colors - Mexican Green">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    <ColorSwatch name="Secondary 50" value="#ecfdf5" variable="--color-secondary-50" tailwind="bg-secondary-50" textColor="dark" />
                    <ColorSwatch name="Secondary 100" value="#d1fae5" variable="--color-secondary-100" tailwind="bg-secondary-100" textColor="dark" />
                    <ColorSwatch name="Secondary 200" value="#a7f3d0" variable="--color-secondary-200" tailwind="bg-secondary-200" textColor="dark" />
                    <ColorSwatch name="Secondary 300" value="#6ee7b7" variable="--color-secondary-300" tailwind="bg-secondary-300" textColor="dark" />
                    <ColorSwatch name="Secondary 400" value="#34d399" variable="--color-secondary-400" tailwind="bg-secondary-400" />
                    <ColorSwatch name="Secondary 500" value="#10b981" variable="--color-secondary" tailwind="bg-secondary" usage="Success states" />
                    <ColorSwatch name="Secondary 600" value="#059669" variable="--color-secondary-600" tailwind="bg-secondary-600" />
                    <ColorSwatch name="Secondary 700" value="#047857" variable="--color-secondary-700" tailwind="bg-secondary-700" />
                    <ColorSwatch name="Secondary 800" value="#065f46" variable="--color-secondary-800" tailwind="bg-secondary-800" />
                    <ColorSwatch name="Secondary 900" value="#064e3b" variable="--color-secondary-900" tailwind="bg-secondary-900" />
                  </div>
                </SubSection>

                {/* Status Colors */}
                <SubSection title="Status Colors">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <ColorSwatch name="Success" value="#10b981" variable="--color-success" tailwind="bg-success" usage="Confirmations, valid" />
                    <ColorSwatch name="Warning" value="#f59e0b" variable="--color-warning" tailwind="bg-warning" usage="Caution, attention" />
                    <ColorSwatch name="Error" value="#ef4444" variable="--color-error" tailwind="bg-error" usage="Errors, destructive" />
                    <ColorSwatch name="Info" value="#3b82f6" variable="--color-info" tailwind="bg-info" usage="Information" />
                  </div>
                </SubSection>

                {/* Brand Colors */}
                <SubSection title="Brand Colors">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <ColorSwatch name="Agave" value="#1F5D4C" variable="--color-brand-agave" tailwind="bg-brand-agave" usage="Heritage, tradition" />
                    <ColorSwatch name="Earth" value="#C65A2E" variable="--color-brand-earth" tailwind="bg-brand-earth" usage="Warmth, richness" />
                    <ColorSwatch name="Gold" value="#D4AF37" variable="--color-brand-gold" tailwind="bg-brand-gold" usage="Premium, awards" />
                  </div>
                </SubSection>

                {/* Neutral Colors */}
                <SubSection title="Neutral Colors">
                  <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-4">
                    <ColorSwatch name="Zinc 50" value="#fafafa" textColor="dark" />
                    <ColorSwatch name="Zinc 100" value="#f4f4f5" textColor="dark" />
                    <ColorSwatch name="Zinc 200" value="#e4e4e7" textColor="dark" />
                    <ColorSwatch name="Zinc 300" value="#d4d4d8" textColor="dark" />
                    <ColorSwatch name="Zinc 400" value="#a1a1aa" textColor="dark" />
                    <ColorSwatch name="Zinc 500" value="#71717a" />
                    <ColorSwatch name="Zinc 600" value="#52525b" />
                    <ColorSwatch name="Zinc 700" value="#3f3f46" />
                    <ColorSwatch name="Zinc 800" value="#27272a" />
                    <ColorSwatch name="Zinc 900" value="#18181b" />
                  </div>
                </SubSection>

                {/* Flavor Profile Colors */}
                <SubSection title="Flavor Profile Colors">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <ColorSwatch name="Fruity" value="#E4572E" tailwind="flavor-fruity" />
                    <ColorSwatch name="Floral" value="#E9A2AD" tailwind="flavor-floral" textColor="dark" />
                    <ColorSwatch name="Vegetal" value="#57A773" tailwind="flavor-vegetal" />
                    <ColorSwatch name="Smoky" value="#6B5B95" tailwind="flavor-smoky" />
                    <ColorSwatch name="Sweet" value="#DFAF2B" tailwind="flavor-sweet" textColor="dark" />
                    <ColorSwatch name="Spicy" value="#B53F3F" tailwind="flavor-spicy" />
                    <ColorSwatch name="Bitter" value="#2F4858" tailwind="flavor-bitter" />
                    <ColorSwatch name="Sour" value="#3B9ED8" tailwind="flavor-sour" />
                    <ColorSwatch name="Roasted" value="#8C5A3A" tailwind="flavor-roasted" />
                    <ColorSwatch name="Nutty" value="#C29F6D" tailwind="flavor-nutty" textColor="dark" />
                    <ColorSwatch name="Mineral" value="#7A8A8C" tailwind="flavor-mineral" />
                    <ColorSwatch name="Earthy" value="#6D7F4B" tailwind="flavor-earthy" />
                  </div>
                </SubSection>

                {/* Background & Surface Colors */}
                <SubSection title="Background & Surface Colors">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">App Background</p>
                      <p className="text-xs text-zinc-500 font-mono">--color-background-app</p>
                      <p className="text-xs text-zinc-400">Light: #FFFFFF / Dark: #18181b</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gemini-card dark:bg-zinc-800">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">Surface / Card</p>
                      <p className="text-xs text-zinc-500 font-mono">--color-background-surface</p>
                      <p className="text-xs text-zinc-400">Light: #F6F6F6 / Dark: #27272a</p>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-700">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">Muted</p>
                      <p className="text-xs text-zinc-500 font-mono">--color-background-muted</p>
                      <p className="text-xs text-zinc-400">Subtle backgrounds</p>
                    </div>
                  </div>
                </SubSection>
              </Section>

              {/* ================================================================ */}
              {/* TYPOGRAPHY SECTION */}
              {/* ================================================================ */}
              <Section
                id="typography"
                title="Typography"
                description="Inter font family with responsive sizing using clamp(). Optimized for readability across all devices."
              >
                {/* Heading Scale */}
                <SubSection title="Heading Scale">
                  <div className="space-y-6 bg-gemini-card dark:bg-zinc-800 rounded-2xl p-6">
                    <div className="border-b border-zinc-200 dark:border-zinc-700 pb-4">
                      <h1 className="text-h1 font-bold text-zinc-900 dark:text-white">Heading 1 - Page Titles</h1>
                      <p className="text-xs text-zinc-500 font-mono mt-1">text-h1 · clamp(2.25rem, 1.9rem + 1.75vw, 3rem) · font-bold</p>
                    </div>
                    <div className="border-b border-zinc-200 dark:border-zinc-700 pb-4">
                      <h2 className="text-h2 font-semibold text-zinc-900 dark:text-white">Heading 2 - Section Headers</h2>
                      <p className="text-xs text-zinc-500 font-mono mt-1">text-h2 · clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem) · font-semibold</p>
                    </div>
                    <div className="border-b border-zinc-200 dark:border-zinc-700 pb-4">
                      <h3 className="text-h3 font-semibold text-zinc-900 dark:text-white">Heading 3 - Subsections</h3>
                      <p className="text-xs text-zinc-500 font-mono mt-1">text-h3 · clamp(1.5rem, 1.3rem + 1vw, 1.875rem) · font-semibold</p>
                    </div>
                    <div className="border-b border-zinc-200 dark:border-zinc-700 pb-4">
                      <h4 className="text-h4 font-medium text-zinc-900 dark:text-white">Heading 4 - Card Titles</h4>
                      <p className="text-xs text-zinc-500 font-mono mt-1">text-h4 · clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem) · font-medium</p>
                    </div>
                    <div className="border-b border-zinc-200 dark:border-zinc-700 pb-4">
                      <h5 className="text-h5 font-medium text-zinc-900 dark:text-white">Heading 5 - Labels</h5>
                      <p className="text-xs text-zinc-500 font-mono mt-1">text-h5 · clamp(1.125rem, 1rem + 0.625vw, 1.25rem) · font-medium</p>
                    </div>
                    <div>
                      <h6 className="text-h6 font-medium text-zinc-900 dark:text-white">Heading 6 - Small Headers</h6>
                      <p className="text-xs text-zinc-500 font-mono mt-1">text-h6 · clamp(1rem, 0.9rem + 0.5vw, 1.125rem) · font-medium</p>
                    </div>
                  </div>
                </SubSection>

                {/* Body Text */}
                <SubSection title="Body Text Scale">
                  <div className="space-y-6 bg-gemini-card dark:bg-zinc-800 rounded-2xl p-6">
                    <div>
                      <p className="text-lg text-zinc-900 dark:text-white">Large body text for hero sections and feature highlights. Used sparingly for emphasis.</p>
                      <p className="text-xs text-zinc-500 font-mono mt-1">text-lg · clamp(1.125rem, 1rem + 0.625vw, 1.25rem)</p>
                    </div>
                    <div>
                      <p className="text-base text-zinc-900 dark:text-white">Default body text for paragraphs and descriptions. This is the standard reading size optimized for comfortable reading across all screen sizes.</p>
                      <p className="text-xs text-zinc-500 font-mono mt-1">text-base · clamp(1rem, 0.9rem + 0.5vw, 1.125rem)</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Small text for captions, helper text, and secondary information. Also used for timestamps.</p>
                      <p className="text-xs text-zinc-500 font-mono mt-1">text-sm · clamp(0.875rem, 0.8rem + 0.375vw, 1rem)</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Extra small text for labels, badges, and metadata.</p>
                      <p className="text-xs text-zinc-500 font-mono mt-1">text-xs · clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)</p>
                    </div>
                  </div>
                </SubSection>

                {/* Domain-Specific Text Patterns */}
                <SubSection title="Domain-Specific Text Patterns">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card variant="gemini" padding="md">
                      <p className="text-xs text-zinc-500 mb-1">Tasting ID</p>
                      <p className="font-mono text-sm text-zinc-900 dark:text-white">TST-2024-001234</p>
                    </Card>
                    <Card variant="gemini" padding="md">
                      <p className="text-xs text-zinc-500 mb-1">Score Display</p>
                      <p className="text-3xl font-bold text-primary tabular-nums">92<span className="text-lg text-zinc-400">/100</span></p>
                    </Card>
                    <Card variant="gemini" padding="md">
                      <p className="text-xs text-zinc-500 mb-1">Spirit Name</p>
                      <p className="text-lg font-semibold text-zinc-900 dark:text-white">Casa Noble Añejo</p>
                      <p className="text-sm text-zinc-500">Jalisco, Mexico</p>
                    </Card>
                    <Card variant="gemini" padding="md">
                      <p className="text-xs text-zinc-500 mb-1">Date/Time</p>
                      <p className="text-sm text-zinc-900 dark:text-white">December 9, 2024</p>
                      <p className="text-xs text-zinc-500">2:30 PM</p>
                    </Card>
                    <Card variant="gemini" padding="md">
                      <p className="text-xs text-zinc-500 mb-1">Price Display</p>
                      <p className="text-xl font-semibold text-zinc-900 dark:text-white">$89<span className="text-sm text-zinc-400">.99</span></p>
                    </Card>
                    <Card variant="gemini" padding="md">
                      <p className="text-xs text-zinc-500 mb-1">Status Label</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Completed
                      </span>
                    </Card>
                  </div>
                </SubSection>

                {/* Font Weights */}
                <SubSection title="Font Weights">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-gemini-card dark:bg-zinc-800 rounded-xl">
                      <p className="font-light text-2xl text-zinc-900 dark:text-white">Aa</p>
                      <p className="text-xs text-zinc-500 mt-2">Light (300)</p>
                    </div>
                    <div className="text-center p-4 bg-gemini-card dark:bg-zinc-800 rounded-xl">
                      <p className="font-normal text-2xl text-zinc-900 dark:text-white">Aa</p>
                      <p className="text-xs text-zinc-500 mt-2">Normal (400)</p>
                    </div>
                    <div className="text-center p-4 bg-gemini-card dark:bg-zinc-800 rounded-xl">
                      <p className="font-medium text-2xl text-zinc-900 dark:text-white">Aa</p>
                      <p className="text-xs text-zinc-500 mt-2">Medium (500)</p>
                    </div>
                    <div className="text-center p-4 bg-gemini-card dark:bg-zinc-800 rounded-xl">
                      <p className="font-semibold text-2xl text-zinc-900 dark:text-white">Aa</p>
                      <p className="text-xs text-zinc-500 mt-2">Semibold (600)</p>
                    </div>
                    <div className="text-center p-4 bg-gemini-card dark:bg-zinc-800 rounded-xl">
                      <p className="font-bold text-2xl text-zinc-900 dark:text-white">Aa</p>
                      <p className="text-xs text-zinc-500 mt-2">Bold (700)</p>
                    </div>
                  </div>
                </SubSection>
              </Section>

              {/* ================================================================ */}
              {/* BUTTONS SECTION */}
              {/* ================================================================ */}
              <Section
                id="buttons"
                title="Buttons"
                description="7 variants, 4 sizes, with loading states, icons, and ripple effects. All buttons meet 44px minimum touch target."
              >
                {/* Button Variants */}
                <SubSection title="Button Variants">
                  <Showcase title="Primary - Main CTAs, form submissions">
                    <Button variant="primary">Primary Button</Button>
                    <Button variant="primary" disabled>Disabled</Button>
                    <Button variant="primary" loading>Loading</Button>
                  </Showcase>

                  <Showcase title="Secondary - Alternative actions">
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="secondary" disabled>Disabled</Button>
                    <Button variant="secondary" loading>Loading</Button>
                  </Showcase>

                  <Showcase title="Outline - Tertiary actions">
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="outline" disabled>Disabled</Button>
                    <Button variant="outline" loading>Loading</Button>
                  </Showcase>

                  <Showcase title="Ghost - Subtle actions, inline">
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="ghost" disabled>Disabled</Button>
                    <Button variant="ghost" loading>Loading</Button>
                  </Showcase>

                  <Showcase title="Danger - Destructive actions">
                    <Button variant="danger">Delete</Button>
                    <Button variant="danger" disabled>Disabled</Button>
                    <Button variant="danger" loading>Loading</Button>
                  </Showcase>

                  <Showcase title="Success - Positive confirmations">
                    <Button variant="success">Confirm</Button>
                    <Button variant="success" disabled>Disabled</Button>
                    <Button variant="success" loading>Loading</Button>
                  </Showcase>

                  <Showcase title="Gradient - Premium CTAs">
                    <Button variant="gradient">Get Started</Button>
                    <Button variant="gradient" disabled>Disabled</Button>
                    <Button variant="gradient" loading>Loading</Button>
                  </Showcase>
                </SubSection>

                {/* Button Sizes */}
                <SubSection title="Button Sizes">
                  <Showcase title="All sizes (sm, md, lg, xl)">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                  </Showcase>
                </SubSection>

                {/* Button with Icons */}
                <SubSection title="Buttons with Icons">
                  <Showcase title="Icon positions">
                    <Button icon={<Search className="w-4 h-4" />} iconPosition="left">Search</Button>
                    <Button icon={<ChevronRight className="w-4 h-4" />} iconPosition="right">Continue</Button>
                    <Button icon={<Heart className="w-4 h-4" />} variant="outline">Like</Button>
                    <Button icon={<Share2 className="w-4 h-4" />} variant="ghost">Share</Button>
                  </Showcase>
                </SubSection>

                {/* Pill Style */}
                <SubSection title="Pill Style Buttons">
                  <Showcase title="Rounded full">
                    <Button pill>Pill Button</Button>
                    <Button pill variant="secondary">Secondary Pill</Button>
                    <Button pill variant="outline" icon={<Star className="w-4 h-4" />}>Rate</Button>
                  </Showcase>
                </SubSection>

                {/* Full Width */}
                <SubSection title="Full Width Buttons">
                  <div className="max-w-md space-y-3">
                    <Button fullWidth>Full Width Primary</Button>
                    <Button fullWidth variant="secondary">Full Width Secondary</Button>
                    <Button fullWidth variant="outline">Full Width Outline</Button>
                  </div>
                </SubSection>
              </Section>

              {/* ================================================================ */}
              {/* FORM INPUTS SECTION */}
              {/* ================================================================ */}
              <Section
                id="inputs"
                title="Form Inputs"
                description="Text inputs and combobox with labels, helper text, and validation states."
              >
                {/* Input Sizes */}
                <SubSection title="Input Sizes">
                  <div className="max-w-md space-y-4">
                    <Input label="Small Input" size="sm" placeholder="Small size" />
                    <Input label="Medium Input (default)" size="md" placeholder="Medium size" />
                    <Input label="Large Input" size="lg" placeholder="Large size" />
                  </div>
                </SubSection>

                {/* Input States */}
                <SubSection title="Input States">
                  <div className="max-w-md space-y-4">
                    <Input
                      label="Default"
                      placeholder="Enter your email"
                      helperText="We'll never share your email"
                    />
                    <Input
                      label="With Left Icon"
                      placeholder="Search..."
                      leftIcon={<Search className="w-5 h-5" />}
                    />
                    <Input
                      label="With Right Icon"
                      placeholder="Enter password"
                      type="password"
                      rightIcon={<Eye className="w-5 h-5" />}
                    />
                    <Input
                      label="Success State"
                      placeholder="Valid email"
                      defaultValue="user@example.com"
                      success
                    />
                    <Input
                      label="Error State"
                      placeholder="Invalid input"
                      defaultValue="invalid"
                      error="Please enter a valid email address"
                    />
                    <Input
                      label="With Character Count"
                      placeholder="Enter tasting notes..."
                      maxLength={200}
                      showCount
                    />
                    <Input
                      label="Disabled"
                      placeholder="Disabled input"
                      disabled
                    />
                  </div>
                </SubSection>

                {/* Combobox */}
                <SubSection title="Combobox">
                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Spirit Type
                      </label>
                      <Combobox
                        options={['Blanco', 'Reposado', 'Añejo', 'Extra Añejo', 'Cristalino', 'Joven']}
                        value={comboValue}
                        onChange={setComboValue}
                        placeholder="Select or type..."
                        allowCustom
                      />
                    </div>
                  </div>
                </SubSection>
              </Section>

              {/* ================================================================ */}
              {/* CARDS SECTION */}
              {/* ================================================================ */}
              <Section
                id="cards"
                title="Cards"
                description="8 card variants with composable header, content, and footer sections."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Default Card */}
                  <Card variant="default">
                    <CardHeader title="Default Card" subtitle="Clean, minimal styling" />
                    <CardContent>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        The default Gemini-style card with soft gray background.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm" variant="ghost">Action</Button>
                    </CardFooter>
                  </Card>

                  {/* Gemini Card */}
                  <Card variant="gemini">
                    <CardHeader title="Gemini Card" subtitle="Explicit Gemini styling" />
                    <CardContent>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Same as default, for explicit naming.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Tasting Card */}
                  <Card variant="tasting">
                    <CardHeader title="Tasting Card" subtitle="With accent bar" />
                    <CardContent>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Features a primary-colored top accent bar for tasting sessions.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Elevated Card */}
                  <Card variant="elevated">
                    <CardHeader title="Elevated Card" subtitle="Prominent shadow" />
                    <CardContent>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Uses larger shadow for visual prominence.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Outlined Card */}
                  <Card variant="outlined">
                    <CardHeader title="Outlined Card" subtitle="Border emphasis" />
                    <CardContent>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Transparent background with 2px border.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Glass Card */}
                  <Card variant="glass">
                    <CardHeader title="Glass Card" subtitle="Frosted glass effect" />
                    <CardContent>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Backdrop blur with semi-transparent background.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Gradient Card */}
                  <Card variant="gradient">
                    <CardHeader title="Gradient Card" subtitle="Subtle gradient" />
                    <CardContent>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Primary-tinted gradient background.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Social Card */}
                  <Card variant="social">
                    <CardHeader title="Social Card" subtitle="For social posts" />
                    <CardContent>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Optimized for social feed items.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Interactive Card */}
                  <Card variant="default" interactive onClick={() => alert('Card clicked!')}>
                    <CardHeader title="Interactive Card" subtitle="Click me!" />
                    <CardContent>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Cards can be made clickable with keyboard support.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Padding Variants */}
                <SubSection title="Padding Variants" className="mt-10">
                  <div className="flex flex-wrap gap-4">
                    <Card variant="default" padding="none" className="w-32">
                      <div className="p-2 text-center">
                        <p className="text-xs text-zinc-500">none</p>
                      </div>
                    </Card>
                    <Card variant="default" padding="sm" className="w-32">
                      <p className="text-xs text-zinc-500 text-center">sm</p>
                    </Card>
                    <Card variant="default" padding="md" className="w-32">
                      <p className="text-xs text-zinc-500 text-center">md</p>
                    </Card>
                    <Card variant="default" padding="lg" className="w-32">
                      <p className="text-xs text-zinc-500 text-center">lg</p>
                    </Card>
                    <Card variant="default" padding="xl" className="w-32">
                      <p className="text-xs text-zinc-500 text-center">xl</p>
                    </Card>
                  </div>
                </SubSection>

                {/* Glow Border */}
                <SubSection title="Glow Border Effect" className="mt-10">
                  <Card variant="default" glowBorder className="max-w-md">
                    <CardHeader title="Highlighted Card" subtitle="With glow ring" />
                    <CardContent>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Use glowBorder for focused or featured content.
                      </p>
                    </CardContent>
                  </Card>
                </SubSection>
              </Section>

              {/* ================================================================ */}
              {/* MODALS SECTION */}
              {/* ================================================================ */}
              <Section
                id="modals"
                title="Modals"
                description="Dialog overlays with focus trapping, keyboard navigation, and multiple sizes."
              >
                <SubSection title="Modal Sizes">
                  <div className="flex flex-wrap gap-4">
                    <Button onClick={() => { setModalSize('sm'); setIsModalOpen(true); }}>
                      Small Modal
                    </Button>
                    <Button variant="secondary" onClick={() => { setModalSize('md'); setIsModalOpen(true); }}>
                      Medium Modal
                    </Button>
                    <Button variant="outline" onClick={() => { setModalSize('lg'); setIsModalOpen(true); }}>
                      Large Modal
                    </Button>
                    <Button variant="ghost" onClick={() => { setModalSize('xl'); setIsModalOpen(true); }}>
                      Extra Large Modal
                    </Button>
                  </div>
                </SubSection>

                <Modal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  title={`${modalSize.toUpperCase()} Modal`}
                  size={modalSize}
                  ariaDescription="Example modal dialog"
                >
                  <ModalBody>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                      This is a {modalSize} modal. It has focus trapping, closes on Escape, and supports overlay click to close.
                    </p>
                    <Input label="Example Input" placeholder="Focus is trapped inside the modal" />
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
                  </ModalFooter>
                </Modal>
              </Section>

              {/* ================================================================ */}
              {/* FEEDBACK SECTION */}
              {/* ================================================================ */}
              <Section
                id="feedback"
                title="Feedback Components"
                description="Loading states, spinners, empty states, and status indicators."
              >
                {/* Loading Spinners */}
                <SubSection title="Loading Spinners">
                  <Showcase title="Sizes">
                    <LoadingSpinner size="sm" />
                    <LoadingSpinner size="md" />
                    <LoadingSpinner size="lg" />
                  </Showcase>
                  <Showcase title="Colors">
                    <LoadingSpinner color="primary" />
                    <div className="p-4 bg-primary rounded-xl">
                      <LoadingSpinner color="white" />
                    </div>
                    <LoadingSpinner color="zinc" />
                  </Showcase>
                  <Showcase title="With Text">
                    <LoadingSpinner text="Loading tastings..." />
                  </Showcase>
                </SubSection>

                {/* Inline Loading */}
                <SubSection title="Inline Loading">
                  <Showcase title="Inline spinners for buttons/text">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <InlineLoading size="sm" />
                      <span>Saving...</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <InlineLoading size="md" />
                      <span>Processing...</span>
                    </div>
                  </Showcase>
                </SubSection>

                {/* Empty States */}
                <SubSection title="Empty States">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card variant="gemini">
                      <EmptyState
                        icon="🍷"
                        title="No tastings yet"
                        description="Start your first tasting session to begin exploring flavors!"
                        action={{ label: 'Start Tasting', onClick: () => {} }}
                        size="sm"
                      />
                    </Card>
                    <Card variant="gemini">
                      <EmptyState
                        icon="search_off"
                        title="No results found"
                        description="Try adjusting your search or filters"
                        size="sm"
                      />
                    </Card>
                  </div>
                </SubSection>

                {/* Alert Variants */}
                <SubSection title="Alert Variants">
                  <div className="space-y-4 max-w-2xl">
                    {/* Info Alert */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">Information</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">This is an informational message with helpful tips.</p>
                      </div>
                    </div>

                    {/* Success Alert */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">Success</p>
                        <p className="text-sm text-green-700 dark:text-green-300">Your tasting has been saved successfully.</p>
                      </div>
                    </div>

                    {/* Warning Alert */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-900 dark:text-amber-100">Warning</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">You have unsaved changes that may be lost.</p>
                      </div>
                    </div>

                    {/* Error Alert */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-red-900 dark:text-red-100">Error</p>
                        <p className="text-sm text-red-700 dark:text-red-300">Failed to save your tasting. Please try again.</p>
                      </div>
                      <button className="text-red-400 hover:text-red-600 dark:hover:text-red-300">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </SubSection>
              </Section>

              {/* ================================================================ */}
              {/* PROGRESS SECTION */}
              {/* ================================================================ */}
              <Section
                id="progress"
                title="Progress Components"
                description="Score rings, badges, and multi-step form indicators."
              >
                {/* Score Rings */}
                <SubSection title="Score Rings">
                  <Showcase title="Sizes">
                    <ScoreRing score={92} size="sm" />
                    <ScoreRing score={85} size="md" />
                    <ScoreRing score={78} size="lg" />
                    <ScoreRing score={95} size="xl" />
                  </Showcase>
                  <Showcase title="Score Ranges (color changes by value)">
                    <ScoreRing score={95} size="md" label="Exceptional" />
                    <ScoreRing score={82} size="md" label="Excellent" />
                    <ScoreRing score={72} size="md" label="Very Good" />
                    <ScoreRing score={55} size="md" label="Average" />
                    <ScoreRing score={35} size="md" label="Poor" />
                  </Showcase>
                </SubSection>

                {/* Score Badges */}
                <SubSection title="Score Badges">
                  <Showcase title="Inline score indicators">
                    <ScoreBadge score={95} />
                    <ScoreBadge score={82} />
                    <ScoreBadge score={68} />
                    <ScoreBadge score={45} size="sm" />
                  </Showcase>
                </SubSection>

                {/* Form Stepper */}
                <SubSection title="Form Stepper">
                  <div className="space-y-8">
                    <div>
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-4">Full Variant (with labels)</p>
                      <Card variant="gemini" className="max-w-2xl">
                        <FormStepperProvider steps={demoSteps} initialStep={1}>
                          <StepperProgress variant="full" showLabels />
                        </FormStepperProvider>
                      </Card>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-4">Numbers Variant</p>
                      <Card variant="gemini" className="max-w-md">
                        <FormStepperProvider steps={demoSteps} initialStep={1}>
                          <StepperProgress variant="numbers" />
                        </FormStepperProvider>
                      </Card>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-4">Dots Variant</p>
                      <Card variant="gemini" className="max-w-xs">
                        <FormStepperProvider steps={demoSteps} initialStep={1}>
                          <StepperProgress variant="dots" />
                        </FormStepperProvider>
                      </Card>
                    </div>
                  </div>
                </SubSection>
              </Section>

              {/* ================================================================ */}
              {/* DOMAIN COMPONENTS SECTION */}
              {/* ================================================================ */}
              <Section
                id="domain"
                title="Domain-Specific Components"
                description="Flavatix-specific UI components for tasting and social features."
              >
                {/* Flavor Pills */}
                <SubSection title="Flavor Pills">
                  <Showcase title="Auto-detected categories">
                    <FlavorPill flavor="Citrus" />
                    <FlavorPill flavor="Vanilla" />
                    <FlavorPill flavor="Oak" />
                    <FlavorPill flavor="Pepper" />
                    <FlavorPill flavor="Honey" />
                    <FlavorPill flavor="Smoke" />
                    <FlavorPill flavor="Rose" />
                    <FlavorPill flavor="Coffee" />
                  </Showcase>
                  <Showcase title="Sizes">
                    <FlavorPill flavor="Agave" size="sm" />
                    <FlavorPill flavor="Agave" size="md" />
                    <FlavorPill flavor="Agave" size="lg" />
                  </Showcase>
                  <Showcase title="With intensity">
                    <FlavorPill flavor="Caramel" intensity={2} />
                    <FlavorPill flavor="Caramel" intensity={4} />
                    <FlavorPill flavor="Caramel" intensity={5} />
                  </Showcase>
                  <Showcase title="Interactive">
                    <FlavorPill flavor="Tropical" onClick={() => alert('Clicked!')} />
                    <FlavorPill flavor="Mint" selected />
                    <FlavorPill flavor="Cherry" removable onRemove={() => alert('Remove!')} />
                  </Showcase>
                </SubSection>

                {/* Avatars */}
                <SubSection title="Avatars">
                  <Showcase title="Sizes">
                    <AvatarWithFallback alt="John Doe" fallback="JD" size={24} />
                    <AvatarWithFallback alt="John Doe" fallback="JD" size={32} />
                    <AvatarWithFallback alt="John Doe" fallback="JD" size={48} />
                    <AvatarWithFallback alt="John Doe" fallback="JD" size={64} />
                    <AvatarWithFallback alt="John Doe" fallback="JD" size={96} />
                  </Showcase>
                  <Showcase title="With image (will show fallback if image fails)">
                    <AvatarWithFallback
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                      alt="User Avatar"
                      fallback="UA"
                      size={48}
                    />
                    <AvatarWithFallback
                      src="invalid-url.jpg"
                      alt="Fallback Demo"
                      fallback="FB"
                      size={48}
                    />
                  </Showcase>
                </SubSection>
              </Section>

              {/* ================================================================ */}
              {/* ACCESSIBILITY SECTION */}
              {/* ================================================================ */}
              <Section
                id="accessibility"
                title="Accessibility"
                description="Touch targets, focus states, and WCAG compliance guidelines."
              >
                {/* Touch Targets */}
                <SubSection title="Touch Targets">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 border-2 border-dashed border-primary rounded-xl flex items-center justify-center text-xs text-primary font-medium">
                        44px
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Minimum touch target size (44×44px) for all interactive elements
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 border-2 border-dashed border-secondary rounded-xl flex items-center justify-center text-xs text-secondary font-medium">
                        48px
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Large touch target (48×48px) for primary actions on mobile
                      </p>
                    </div>
                  </div>
                </SubSection>

                {/* Focus States */}
                <SubSection title="Focus States">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Tab through these elements to see focus rings:
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button>Focusable Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <input
                      type="text"
                      placeholder="Focusable input"
                      className="px-4 py-2 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    />
                  </div>
                </SubSection>

                {/* Color Contrast */}
                <SubSection title="Color Contrast">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                      <p className="text-zinc-900 dark:text-white font-medium">Primary Text</p>
                      <p className="text-xs text-zinc-500 mt-1">WCAG AAA compliant (7:1+)</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                      <p className="text-zinc-600 dark:text-zinc-400">Secondary Text</p>
                      <p className="text-xs text-zinc-500 mt-1">WCAG AA compliant (4.5:1+)</p>
                    </div>
                    <div className="p-4 bg-primary rounded-xl">
                      <p className="text-white font-medium">White on Primary</p>
                      <p className="text-xs text-white/80 mt-1">WCAG AA compliant</p>
                    </div>
                    <div className="p-4 bg-zinc-900 dark:bg-white rounded-xl">
                      <p className="text-white dark:text-zinc-900 font-medium">Inverse Text</p>
                      <p className="text-xs text-white/80 dark:text-zinc-600 mt-1">WCAG AAA compliant</p>
                    </div>
                  </div>
                </SubSection>

                {/* Reduced Motion */}
                <SubSection title="Reduced Motion">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                    All animations respect the <code className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono">prefers-reduced-motion</code> media query.
                    When enabled, transitions and animations are disabled or minimized to prevent vestibular issues.
                  </p>
                </SubSection>

                {/* Keyboard Navigation */}
                <SubSection title="Keyboard Navigation">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center gap-4">
                      <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-sm font-mono">Tab</kbd>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Navigate between interactive elements</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-sm font-mono">Enter / Space</kbd>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Activate buttons and links</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-sm font-mono">Escape</kbd>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Close modals and dropdowns</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-sm font-mono">Arrow Keys</kbd>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Navigate within components (combobox, stepper)</p>
                    </div>
                  </div>
                </SubSection>
              </Section>

              {/* Footer */}
              <div className="py-12 text-center text-sm text-zinc-500">
                <p>Flavatix Design System v1.0</p>
                <p className="mt-1">Built with React, Tailwind CSS, and CSS Custom Properties</p>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
