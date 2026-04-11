/**
 * Legacy route — redirected to /review/my-reviews.
 * Kept as a compatibility stub so any existing bookmarks or external links still work.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ReviewHistoryRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/review/my-reviews');
  }, [router]);
  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/review/my-reviews',
      permanent: false,
    },
  };
}
