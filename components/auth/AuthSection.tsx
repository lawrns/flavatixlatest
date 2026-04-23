import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { getSupabaseClient } from '../../lib/supabase';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { toast } from '../../lib/toast';
import { logger } from '../../lib/logger';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
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
      <div className="fixed inset-0 -z-10 bg-[#f6f1e9] dark:bg-[#15120f]" />

      <Container size="4xl" className="grid min-h-[100dvh] items-center gap-6 py-4 sm:py-8 lg:grid-cols-[360px_minmax(0,420px)] lg:justify-center">
        <section className="hidden lg:block">
          <div className="rounded-xl border border-black/10 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#211c18]">
            <div className="relative aspect-[0.68] overflow-hidden rounded-lg bg-[#eae0d4] dark:bg-[#17130f]">
              <Image
                src="/generated-images/concepts/flavatix-premium-mobile-workspace.png"
                alt="Flavatix mobile tasting app preview"
                fill
                priority
                sizes="360px"
                className="object-cover object-top"
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {['Capture', 'Compare', 'Share'].map((label) => (
              <div key={label} className="rounded-lg border border-line bg-bg-surface p-3 text-center">
                <p className="text-xs font-semibold text-fg">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-black/10 bg-white/95 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#211c18]/95 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <Image
              src="/logos/flavatix-logo.svg"
              alt="Flavatix Logo"
              width={44}
              height={44}
              className="h-11 w-11"
            />
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="rounded-md border border-line bg-bg px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-fg-muted transition-colors hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            >
              Intro
            </button>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {mode === 'login' ? 'Welcome back' : 'New palate record'}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-normal text-fg">
              {showEmailForm
                ? mode === 'login'
                  ? 'Sign in to Flavatix'
                  : 'Create your account'
                : 'Start with the method you trust'}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              {showEmailForm && mode === 'login'
                ? 'Return to your tastings, wheels, reviews, and profile work.'
                : showEmailForm && mode === 'register'
                  ? 'Create a private tasting identity before sharing anything publicly.'
                  : 'Email is the cleanest way in. Social sign-in is available when configured.'}
            </p>
          </div>

          <div className="mt-7 space-y-4">
            {!showEmailForm ? (
              <>
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-lg bg-primary px-4 text-white font-semibold shadow-sm transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  <Mail className="h-4 w-4" />
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
                    className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-bg px-3 font-medium text-fg ring-1 ring-line transition-colors duration-150 hover:bg-bg-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
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
                    className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-bg px-3 font-medium text-fg ring-1 ring-line transition-colors duration-150 hover:bg-bg-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
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
                      className="min-h-[48px] w-full rounded-lg border border-line bg-bg px-4 text-fg placeholder-fg-muted transition-colors duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgba(183,86,51,0.16)] focus:outline-none"
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
                    className="min-h-[48px] w-full rounded-lg border border-line bg-bg px-4 text-fg placeholder-fg-muted transition-colors duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgba(183,86,51,0.16)] focus:outline-none"
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
                    className="min-h-[48px] w-full rounded-lg border border-line bg-bg px-4 text-fg placeholder-fg-muted transition-colors duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgba(183,86,51,0.16)] focus:outline-none"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-[52px] w-full rounded-lg bg-primary px-4 font-semibold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
                {mode === 'register' && (
                  <div className="rounded-lg border border-line bg-bg p-3 text-xs leading-relaxed text-fg-muted">
                    <div className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>Use at least 8 characters with uppercase, lowercase, a number, and a symbol.</span>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to options
                  </button>
                </div>
              </form>
            )}
            <div className="border-t border-line pt-2 text-center">
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setShowEmailForm(true);
                  setFormData({ email: '', password: '' });
                }}
                className="mt-4 min-h-[44px] text-sm font-medium text-fg-muted transition-colors hover:text-primary"
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default AuthSection;
