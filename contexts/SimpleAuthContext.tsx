import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabase';
import { logger } from '../lib/logger';
import { authLogger } from '../lib/loggers';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          logger.error('Auth', 'Error getting session', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        logger.error('Auth', 'Error in getInitialSession', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.debug('Auth', 'Auth state changed', { event, email: session?.user?.email });

        // Log specific auth events
        if (event === 'SIGNED_IN' && session?.user) {
          authLogger.login(session.user.id, 'session', true);
        } else if (event === 'SIGNED_OUT') {
          authLogger.logout(user?.id || 'unknown');
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          authLogger.tokenRefresh(session.user.id, true);
        } else if (event === 'USER_UPDATED' && session?.user) {
          logger.info('Auth', 'User updated', { userId: session.user.id });
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    try {
      const userId = user?.id || 'unknown';
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('Auth', 'Error signing out', error);
        authLogger.logout(userId);
      } else {
        authLogger.logout(userId);
      }
    } catch (error) {
      logger.error('Auth', 'Error in signOut', error);
    }
  }, [user?.id, supabase.auth]);

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        logger.error('Auth', 'Error refreshing session', error);
        authLogger.tokenRefresh(user?.id || 'unknown', false);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          authLogger.tokenRefresh(session.user.id, true);
        }
      }
    } catch (error) {
      logger.error('Auth', 'Error in refreshSession', error);
      authLogger.tokenRefresh(user?.id || 'unknown', false);
    }
  }, [user?.id, supabase.auth]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    session,
    loading,
    signOut,
    refreshSession,
  }), [user, session, loading, signOut, refreshSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
