import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

const TastePage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export default TastePage;

export async function getServerSideProps() {
  return { props: {} };
}
