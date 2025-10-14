import React from 'react';
import AuthSection from '../components/auth/AuthSection';

const AuthPage = () => {
  return <AuthSection />;
};

export default AuthPage;
// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}
