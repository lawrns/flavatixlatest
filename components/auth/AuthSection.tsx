import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getSupabaseClient } from '../../lib/supabase';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { toast } from '../../lib/toast';
import { z } from 'zod';
import Container from '../layout/Container';

const AuthSection = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState<{ full_name?: string; email: string; password: string }>({ email: '', password: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { user } = useAuth();

  useEffect(() => {
    // Set mounted immediately to avoid blocking the UI
    setMounted(true);
    console.log('AuthSection mounted, Supabase config:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
    });
  }, []);

  useEffect(() => {
    if (user && router.pathname !== '/dashboard') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const emailSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    full_name: mode === 'register' ? z.string().min(2, 'Full name must be at least 2 characters') : z.string().optional(),
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Starting authentication...', { mode, email: formData.email });
      const validatedData = emailSchema.parse(formData);
      console.log('Data validated successfully');

      if (mode === 'register') {
        console.log('Attempting to sign up...');
        const { data, error } = await supabase.auth.signUp({
          email: validatedData.email,
          password: validatedData.password,
          options: {
            data: {
              full_name: validatedData.full_name,
            }
          }
        });

        if (error) {
          console.error('Signup error:', error);
          throw error;
        }

        console.log('Signup successful:', data);
        toast.success('Check your email for the confirmation link!');
        setMode('login');
      } else {
        console.log('Attempting to sign in...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: validatedData.email,
          password: validatedData.password,
        });

        if (error) {
          console.error('Signin error:', error);
          throw error;
        }

        console.log('Signin successful:', data);
        toast.success('Welcome back!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
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
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Social auth error:', error);
      toast.error(error.message || 'Social authentication failed');
    }
  };

  // Removed mounted check to prevent indefinite loading

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </Head>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">
          <div className="relative h-64 w-full">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558221525-4b07c87c713b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-background-light from-0%" />
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/logos/flavatix-logo.svg"
                alt="Flavatix Logo"
                className="h-24 w-24"
              />
            </div>
          </div>
          <Container size="md" className="py-8 text-center">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Flavatix</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-300">The one place for all your tasting needs</p>
          </Container>

          <Container size="md" className="space-y-4">
            {!showEmailForm ? (
              <>
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary px-4 py-3 text-white font-bold hover:bg-orange-600 transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M2.99 5.5A1.5 1.5 0 0 1 4.5 4h11a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 15.5 16h-11A1.5 1.5 0 0 1 2.99 14.5v-9Zm1.5-1a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-11Z" fillRule="evenodd" />
                    <path d="M5.618 7.031a.5.5 0 0 1 .707-.022l3.675 2.94a.5.5 0 0 1 0 .782l-3.675 2.94a.5.5 0 0 1-.685-.728L8.835 10 5.64 7.736a.5.5 0 0 1-.022-.705Z" />
                  </svg>
                  <span>{mode === 'login' ? 'Sign in with Email' : 'Create account with Email'}</span>
                </button>
                <div className="flex items-center gap-4">
                  <hr className="flex-1 border-zinc-200 dark:border-zinc-700 dark:border-zinc-700" />
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">or</span>
                  <hr className="flex-1 border-zinc-200 dark:border-zinc-700 dark:border-zinc-700" />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleSocialAuth('google')}
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-white dark:bg-zinc-800 dark:bg-zinc-800 px-4 py-3 font-bold text-zinc-900 dark:text-zinc-50 dark:text-zinc-50 ring-1 ring-zinc-200 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.35 11.1H12.18V13.83H18.68C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5.03 16.25 5.03 12C5.03 7.75 8.36 4.73 12.19 4.73C14.02 4.73 15.64 5.33 16.89 6.48L19.06 4.45C17.02 2.61 14.71 1.73 12.19 1.73C6.73 1.73 2.5 6.22 2.5 12C2.5 17.78 6.73 22.27 12.19 22.27C17.65 22.27 21.5 18.25 21.5 12.33C21.5 11.77 21.43 11.43 21.35 11.1Z" fill="#4285F4" />
                    </svg>
                    <span>Google</span>
                  </button>
                  <button
                    onClick={() => handleSocialAuth('apple')}
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-white dark:bg-zinc-800 dark:bg-zinc-800 px-4 py-3 font-bold text-zinc-900 dark:text-zinc-50 dark:text-zinc-50 ring-1 ring-zinc-200 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2.5a5.556 5.556 0 0 0-2.327.498 5.485 5.485 0 0 0-1.879 1.344c-1.332 1.306-1.579 3.32-1.579 5.158 0 1.838.247 3.852 1.579 5.158a5.485 5.485 0 0 0 1.879 1.344A5.556 5.556 0 0 0 10 17.5a5.717 5.717 0 0 0 2.215-.47c.563-.223.94-.486 1.393-1.07.453-.585.62-1.32.62-2.189 0-1.637-1.127-2.32-2.33-2.32h-1.488v-2.134h3.76c.118-.002.217-.058.217-.176 0-1.423-.97-2.733-2.5-3.138A5.54 5.54 0 0 0 10 2.5Zm-1.116 1.435a3.111 3.111 0 0 1 2.332 0c.93.308 1.421 1.116 1.421 2.015 0 .9-.508 1.708-1.42 2.015a3.111 3.111 0 0 1-2.332 0c-.913-.307-1.421-1.116-1.421-2.015 0-.9.508-1.708 1.42-2.015Z" />
                    </svg>
                    <span>Apple</span>
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 dark:text-zinc-200 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name || ''}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 dark:text-zinc-50 focus:border-primary focus:outline-none"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 dark:text-zinc-200 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 dark:text-zinc-50 focus:border-primary focus:outline-none"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200 dark:text-zinc-200 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 dark:text-zinc-50 focus:border-primary focus:outline-none"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3 px-4 rounded-md font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="w-full text-primary hover:underline text-sm"
                >
                  ← Back to options
                </button>
              </form>
            )}
            <div className="pt-4 text-center">
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setShowEmailForm(false);
                  setFormData({ email: '', password: '' });
                }}
                className="text-sm font-medium text-primary hover:underline"
              >
                {mode === 'login' ? 'Create new account' : 'Already have an account? Log in'}
              </button>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default AuthSection;