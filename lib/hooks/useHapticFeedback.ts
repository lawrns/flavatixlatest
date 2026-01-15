/**
 * Hook for triggering haptic feedback on devices that support it
 * @example
 * const { trigger } = useHapticFeedback();
 * <button onClick={() => trigger([10])}>Click</button>
 */
export function useHapticFeedback() {
  const trigger = (pattern: number[] = [10]) => {
    // Check if device supports vibration API
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  return { trigger };
}

// Preset patterns for common interactions
export const hapticPatterns = {
  light: [10],                    // Light tap
  medium: [15],                   // Medium tap
  heavy: [20],                    // Heavy tap
  double: [10, 50, 10],          // Double tap
  success: [10, 50, 10, 50, 10], // Success pattern
  error: [20, 10, 20],           // Error pattern
};
