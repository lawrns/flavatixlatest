import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    // TODO(auth): Add error handling for getSession failure. Currently fails silently.
    // Should catch errors, log to Sentry, and potentially show user-facing error state.
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // TODO(auth): Handle signOut errors. Currently unhandled promise rejection if fails.
    // Should catch error, show toast, and potentially retry or guide user to clear cookies.
    await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    signOut,
  };
};