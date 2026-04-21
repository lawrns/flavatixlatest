import React from 'react';

interface NotificationSystemProps {
  userId: string;
}

/**
 * Notifications are not surfaced in the current UI.
 * Keep the component as a lightweight no-op so existing imports stay stable
 * without pulling the old modal, icon, and data-fetching bundle back in.
 */
export const NotificationSystem: React.FC<NotificationSystemProps> = () => {
  return null;
};

export default NotificationSystem;
