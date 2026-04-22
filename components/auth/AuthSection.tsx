import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { getSupabaseClient } from '../../lib/supabase';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { toast } from '../../lib/toast';
import { logger } from '../../lib/logger';
import { z } from 'zod';
import Container from '../layout/Container';
import OnboardingCarousel from '../ui/OnboardingCarousel';
import LoadingSpinner from '../ui/LoadingSpinner';

const AuthSection = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState<{ full_name?: string; email: string; password: string }>(
    { email: '', password: '' }
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { user } = useAuth();

  // Onboarding cards with optimized WebP images from onboarding subfolder
  const onboardingCards = [
    {
      id: 1,
      image: '/generated-images/onboarding/onboarding-discover.webp',
      headline: 'Discover Your Next Favorite',
      description: 'Explore flavors across coffee, wine, spirits, and more',
    },
    {
      id: 2,
      image: '/generated-images/onboarding/onboarding-taste.webp',
      headline: 'Master Your Palate',
      description: 'Capture nuanced flavor profiles and develop your taste',
    },
    {
      id: 3,
      image: '/generated-images/onboarding/onboarding-connect.webp',
      headline: 'Share & Compete',
      description: 'Connect with fellow tasters, join tastings, and compete',
    },
    {
      id: 4,
      image: '/generated-images/onboarding/onboarding-ready.webp',
      headline: 'Ready to Transform Your Palate?',
      description: 'The one place for all your tasting needs',
      ctaVariant: 'split' as const,
    },
  ];

  useEffect(() => {
    const hasSeenOnboarding =
      typeof window !== 'undefined' &&
      window.localStorage.getItem('flavatix:onboarding-seen') === 'true';

    setShowOnboarding(!hasSeenOnboarding);

    // Returning users go straight to the email sign-in form
    if (hasSeenOnboarding) {
      setShowEmailForm(true);
    }

    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Auth', 'AuthSection mounted, Supabase config', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      });
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const forceEmailForm =
      router.query.showEmail === 'true' ||
      router.query.showEmail === '1' ||
      router.query.email === '1';
    const skipOnboarding =
      router.query.skipOnboarding === 'true' ||
      router.query.onboarding === 'false';

    if (forceEmailForm) {
      setShowEmailForm(true);
    }

    if (skipOnboarding) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('flavatix:onboarding-seen', 'true');
      }
      setShowOnboarding(false);
    }
  }, [router.isReady, router.query]);

  const handleOnboardingComplete = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('flavatix:onboarding-seen', 'true');
    }
    setShowOnboarding(false);
  }, []);

  useEffect(() => {
    if (user) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('flavatix:onboarding-seen', 'true');
      }
      setShowOnboarding(false);
      if (router.pathname !== '/dashboard') {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  // Enhanced password policy (OWASP compliant)
  const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character (!@#$%^&*)')
    .refine((val) => !['password', '12345678', 'qwerty'].some((weak) => val.toLowerCase().includes(weak)), {
      message: 'Password is too common. Please use a stronger password.',
    });

  const emailSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: mode === 'register' ? passwordSchema : z.string().min(1, 'Password is required'),
    full_name:
      mode === 'register'
        ? z.string().min(2, 'Full name must be at least 2 characters')
        : z.string().optional(),
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('Auth', 'Starting authentication', { mode });
      }
      const validatedData = emailSchema.parse(formData);

      if (mode === 'register') {
        const { data: _data, error } = await supabase.auth.signUp({
          email: validatedData.email,
          password: validatedData.password,
          options: {
            data: {
              full_name: validatedData.full_name,
            },
          },
        });

        if (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Signup error:', error);
          }
          throw error;
        }

        toast.success('Check your email for the confirmation link!');
        setMode('login');
      } else {
        const { data: _data2, error } = await supabase.auth.signInWithPassword({
          email: validatedData.email,
          password: validatedData.password,
        });

        if (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Signin error:', error);
          }
          throw error;
        }

        toast.success('Welcome back!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Auth error:', error);
      }
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Social auth error:', error);
      }
      toast.error(error.message || 'Social authentication failed');
    }
  };

  if (showOnboarding === null) {
    return (
      <div className="font-sans text-fg fixed inset-0 flex items-center justify-center overflow-hidden bg-bg">
        <LoadingSpinner text="Preparing your experience..." />
      </div>
    );
  }

  // Show onboarding carousel first, then form
  if (showOnboarding) {
    return (
      <div className="font-sans text-fg fixed inset-0 overflow-hidden">
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
          />
        </Head>
        <OnboardingCarousel cards={onboardingCards} onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="font-sans text-fg">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <div className="fixed inset-0 -z-10 bg-bg" />

      <div className="flex min-h-screen flex-col items-center justify-center py-8 sm:py-12">
        {/* Centered Card */}
        <Container size="md" className="surface-page p-8 sm:p-12">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Image
              src="/logos/flavatix-logo.svg"
              alt="Flavatix Logo"
              width={64}
              height={64}
              className="h-14 w-14 sm:h-16 sm:w-16 mx-auto"
            />
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-fg tracking-tight">
              {showEmailForm
                ? mode === 'login'
                  ? 'Welcome Back'
                  : 'Create Account'
                : 'Get Started'}
            </h1>
            <p className="mt-2 text-sm text-fg-muted">
              {showEmailForm && mode === 'login'
                ? 'Sign in to continue your tasting journey.'
                : showEmailForm && mode === 'register'
                  ? 'Join to track your palate and build flavor wheels.'
                  : 'The one place for all your tasting needs.'}
            </p>
          </div>

          {/* Form Content */}
          <div className="space-y-4">
            {!showEmailForm ? (
              <>
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="flex w-full items-center justify-center gap-3 rounded-soft bg-primary px-4 py-3 text-white font-bold transition-colors duration-150 hover:bg-primary/90"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      clipRule="evenodd"
                      d="M2.99 5.5A1.5 1.5 0 0 1 4.5 4h11a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 15.5 16h-11A1.5 1.5 0 0 1 2.99 14.5v-9Zm1.5-1a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-11Z"
                      fillRule="evenodd"
                    />
                    <path d="M5.618 7.031a.5.5 0 0 1 .707-.022l3.675 2.94a.5.5 0 0 1 0 .782l-3.675 2.94a.5.5 0 0 1-.685-.728L8.835 10 5.64 7.736a.5.5 0 0 1-.022-.705Z" />
                  </svg>
                  <span>Continue with Email</span>
                </button>
                <div className="flex items-center gap-3">
                  <hr className="flex-1 border-line" />
                  <span className="text-xs text-fg-muted">or</span>
                  <hr className="flex-1 border-line" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSocialAuth('google')}
                    className="flex items-center justify-center gap-2 rounded-soft bg-bg-surface dark:bg-bg-surface px-3 py-2.5 font-medium text-fg ring-1 ring-line transition-colors duration-150 hover:bg-bg-hover"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21.35 11.1H12.18V13.83H18.68C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5.03 16.25 5.03 12C5.03 7.75 8.36 4.73 12.19 4.73C14.02 4.73 15.64 5.33 16.89 6.48L19.06 4.45C17.02 2.61 14.71 1.73 12.19 1.73C6.73 1.73 2.5 6.22 2.5 12C2.5 17.78 6.73 22.27 12.19 22.27C17.65 22.27 21.5 18.25 21.5 12.33C21.5 11.77 21.43 11.43 21.35 11.1Z"
                        fill="#4285F4"
                      />
                    </svg>
                    <span className="text-sm">Google</span>
                  </button>
                  <button
                    onClick={() => handleSocialAuth('apple')}
                    className="flex items-center justify-center gap-2 rounded-soft bg-bg-surface dark:bg-bg-surface px-3 py-2.5 font-medium text-fg ring-1 ring-line transition-colors duration-150 hover:bg-bg-hover"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2.5a5.556 5.556 0 0 0-2.327.498 5.485 5.485 0 0 0-1.879 1.344c-1.332 1.306-1.579 3.32-1.579 5.158 0 1.838.247 3.852 1.579 5.158a5.485 5.485 0 0 0 1.879 1.344A5.556 5.556 0 0 0 10 17.5a5.717 5.717 0 0 0 2.215-.47c.563-.223.94-.486 1.393-1.07.453-.585.62-1.32.62-2.189 0-1.637-1.127-2.32-2.33-2.32h-1.488v-2.134h3.76c.118-.002.217-.058.217-.176 0-1.423-.97-2.733-2.5-3.138A5.54 5.54 0 0 0 10 2.5Zm-1.116 1.435a3.111 3.111 0 0 1 2.332 0c.93.308 1.421 1.116 1.421 2.015 0 .9-.508 1.708-1.42 2.015a3.111 3.111 0 0 1-2.332 0c-.913-.307-1.421-1.116-1.421-2.015 0-.9.508-1.708 1.42-2.015Z" />
                    </svg>
                    <span className="text-sm">Apple</span>
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label htmlFor="auth-full-name" className="block text-sm font-medium text-fg-muted mb-2">
                      Full Name
                    </label>
                    <input
                      id="auth-full-name"
                      type="text"
                      autoComplete="name"
                      value={formData.full_name || ''}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="w-full px-4 py-2.5 border border-line rounded-soft bg-bg-surface dark:bg-bg-surface text-fg placeholder-fg-muted transition-colors duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-weak)] focus:outline-none"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="auth-email" className="block text-sm font-medium text-fg-muted mb-2">
                    Email Address
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    spellCheck={false}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2.5 border border-line rounded-soft bg-bg-surface dark:bg-bg-surface text-fg placeholder-fg-muted transition-colors duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-weak)] focus:outline-none"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="auth-password" className="block text-sm font-medium text-fg-muted mb-2">
                    Password
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-2.5 border border-line rounded-soft bg-bg-surface dark:bg-bg-surface text-fg placeholder-fg-muted transition-colors duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-weak)] focus:outline-none"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3 px-4 rounded-soft font-semibold transition-colors duration-150 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="w-full text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  >
                    ← Back to options
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOnboarding(true)}
                    className="w-full text-fg-muted hover:text-fg text-xs font-medium transition-colors"
                  >
                    Back to intro
                  </button>
                </div>
              </form>
            )}
            <div className="pt-2 text-center border-t border-line">
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setShowEmailForm(false);
                  setFormData({ email: '', password: '' });
                }}
                className="mt-4 text-sm font-medium text-fg-muted hover:text-primary transition-colors"
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AuthSection;
