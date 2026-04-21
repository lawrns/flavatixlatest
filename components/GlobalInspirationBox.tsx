import React from 'react';

interface GlobalInspirationBoxProps {
  children: React.ReactNode;
}

/**
 * Kept as a simple pass-through wrapper so the app shell can stay stable
 * without shipping the old whitespace-detection and dynamic import logic.
 */
const GlobalInspirationBox: React.FC<GlobalInspirationBoxProps> = ({ children }) => {
  return <>{children}</>;
};

export default GlobalInspirationBox;
