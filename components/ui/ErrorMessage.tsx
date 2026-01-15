/**
 * ERROR MESSAGE COMPONENT
 *
 * Displays styled error messages with icon, title, description, and recovery suggestion.
 * Replaces generic toast notifications with user-friendly, actionable feedback.
 *
 * Usage:
 *   <ErrorMessage
 *     title="Invalid email"
 *     description="Enter a valid email format (e.g., your.name@example.com)"
 *     severity="error"
 *     onDismiss={() => setError(null)}
 *   />
 */

import React, { ReactNode } from 'react';
import { X, AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export interface ErrorMessageProps {
  title: string;
  description?: string;
  suggestion?: string;
  helpLink?: string;
  severity?: 'error' | 'warning' | 'info';
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  className?: string;
}

const severityStyles = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-900',
    icon: 'text-red-600',
    title: 'text-red-900 font-semibold',
    button: 'hover:bg-red-100',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: 'text-amber-600',
    title: 'text-amber-900 font-semibold',
    button: 'hover:bg-amber-100',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: 'text-blue-600',
    title: 'text-blue-900 font-semibold',
    button: 'hover:bg-blue-100',
  },
};

const severityIcons = {
  error: <XCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  description,
  suggestion,
  helpLink,
  severity = 'error',
  icon,
  dismissible = true,
  onDismiss,
  actions,
  className,
}) => {
  const styles = severityStyles[severity];
  const defaultIcon = severityIcons[severity];

  return (
    <div
      className={`
        border rounded-lg p-4 flex gap-4
        ${styles.container}
        ${className || ''}
      `}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${styles.icon}`}>{icon || defaultIcon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={styles.title}>{title}</h3>

        {description && <p className="mt-1 text-sm opacity-90">{description}</p>}

        {suggestion && <p className="mt-2 text-sm font-medium">What to do next: {suggestion}</p>}

        {/* Links and actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {helpLink && (
            <a
              href={helpLink}
              className="text-sm font-medium underline hover:opacity-75"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get help →
            </a>
          )}

          {actions &&
            actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="text-sm font-medium underline hover:opacity-75"
              >
                {action.label}
              </button>
            ))}
        </div>
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={onDismiss}
          className={`
            flex-shrink-0 p-1 rounded hover:opacity-75
            ${styles.button}
          `}
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
