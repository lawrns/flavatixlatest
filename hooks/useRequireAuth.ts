import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/SimpleAuthContext';

export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      void router.replace('/auth');
    }
  }, [auth.loading, auth.user, router]);

  return auth;
}

export default useRequireAuth;
