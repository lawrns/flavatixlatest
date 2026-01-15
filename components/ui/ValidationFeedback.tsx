/**
 * VALIDATION FEEDBACK COMPONENT
 *
 * Real-time form validation feedback with:
 * - Field-level error messages
 * - Password strength indicator
 * - Success confirmations
 * - Required field indicators
 *
 * Usage:
 *   <ValidationFeedback
 *     error="Email is required"
 *     success={isValid}
 *     required
 *   />
 */

import React from 'react';
import { CheckCircle2, AlertCircle, Zap } from 'lucide-react';

export interface ValidationFeedbackProps {
  error?: string;
  warning?: string;
  success?: boolean;
  successMessage?: string;
  required?: boolean;
  helperText?: string;
  passwordStrength?: {
    score: 0 | 1 | 2 | 3 | 4;
    text: string;
  };
  className?: string;
}

const strengthColors = {
  0: 'bg-red-500',
  1: 'bg-orange-500',
  2: 'bg-yellow-500',
  3: 'bg-lime-500',
  4: 'bg-green-500',
};

const strengthLabels = {
  0: 'Very weak',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
};

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  error,
  warning,
  success,
  successMessage = 'Looks good!',
  required,
  helperText,
  passwordStrength,
  className,
}) => {
  return (
    <div className={className}>
      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 mt-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Warning message */}
      {warning && !error && (
        <div className="flex items-start gap-2 mt-2 text-amber-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{warning}</span>
        </div>
      )}

      {/* Success message */}
      {success && !error && !warning && (
        <div className="flex items-start gap-2 mt-2 text-green-600 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Helper text */}
      {helperText && !error && <p className="text-gray-600 text-sm mt-2">{helperText}</p>}

      {/* Required indicator */}
      {required && !error && !success && (
        <p className="text-gray-500 text-xs mt-2">
          <span className="text-red-500">*</span> Required field
        </p>
      )}

      {/* Password strength indicator */}
      {passwordStrength && (
        <div className="mt-3">
          {/* Strength bar */}
          <div className="flex gap-1 mb-2">
            {[0, 1, 2, 3, 4].map((segment) => (
              <div
                key={segment}
                className={`
                  h-1 flex-1 rounded-full
                  ${
                    segment <= passwordStrength.score
                      ? strengthColors[passwordStrength.score]
                      : 'bg-gray-200'
                  }
                  transition-colors duration-200
                `}
              />
            ))}
          </div>

          {/* Strength text */}
          <div className="flex items-center gap-1 text-sm">
            <Zap className="w-3 h-3" />
            <span
              className={`
              font-medium
              ${passwordStrength.score < 3 ? 'text-orange-600' : 'text-green-600'}
            `}
            >
              {strengthLabels[passwordStrength.score]}
            </span>
          </div>

          {/* Strength tips */}
          {passwordStrength.score < 4 && (
            <p className="text-gray-600 text-xs mt-2">
              Use mix of uppercase, lowercase, numbers, and symbols
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ValidationFeedback;
