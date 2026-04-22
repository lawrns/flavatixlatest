/**
 * Legacy structured review route — redirected to /review/create.
 * /review/create + ReviewForm is the single maintained implementation.
 * Kept as a compatibility stub so existing links still resolve.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function StructuredReviewRedirect() {
  const router = useRouter();
  useEffect(() => {
    const { id, tastingSessionId, ...rest } = router.query;
    const params = new URLSearchParams();
    if (id) {
      params.set('id', String(id));
    }
    if (tastingSessionId) {
      params.set('tastingSessionId', String(tastingSessionId));
    }
    Object.entries(rest).forEach(([k, v]) => v && params.set(k, String(v)));
    const qs = params.toString();
    router.replace(`/review/create${qs ? `?${qs}` : ''}`);
  }, [router]);
  return null;
}

export async function getServerSideProps({ query }: { query: Record<string, string> }) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => params.set(k, v));
  const qs = params.toString();
  return {
    redirect: {
      destination: `/review/create${qs ? `?${qs}` : ''}`,
      permanent: false,
    },
  };
}
