/**
 * Haptic Feedback Utilities
 * Provides tactile feedback for mobile interactions
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

/**
 * Check if haptic feedback is available
 */
export function isHapticAvailable(): boolean {
  return 'vibrate' in navigator || 'Vibration' in window;
}

/**
 * Trigger haptic feedback
 */
export function triggerHaptic(pattern: HapticPattern = 'light'): void {
  if (!isHapticAvailable()) {
    return;
  }

  // Vibration patterns in milliseconds
  const patterns: Record<HapticPattern, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 50,
    success: [10, 50, 10],
    warning: [20, 100, 20],
    error: [50, 100, 50, 100, 50],
    selection: 5,
  };

  const vibrationPattern = patterns[pattern];

  try {
    if (Array.isArray(vibrationPattern)) {
      navigator.vibrate(vibrationPattern);
    } else {
      navigator.vibrate(vibrationPattern);
    }
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
}

/**
 * Cancel ongoing vibration
 */
export function cancelHaptic(): void {
  if (isHapticAvailable()) {
    navigator.vibrate(0);
  }
}

/**
 * Haptic feedback for button press
 */
export function hapticButton(): void {
  triggerHaptic('light');
}

/**
 * Haptic feedback for success action
 */
export function hapticSuccess(): void {
  triggerHaptic('success');
}

/**
 * Haptic feedback for error action
 */
export function hapticError(): void {
  triggerHaptic('error');
}

/**
 * Haptic feedback for warning
 */
export function hapticWarning(): void {
  triggerHaptic('warning');
}

/**
 * Haptic feedback for selection/toggle
 */
export function hapticSelection(): void {
  triggerHaptic('selection');
}

/**
 * Haptic feedback for long press
 */
export function hapticLongPress(): void {
  triggerHaptic('heavy');
}

/**
 * React hook for haptic feedback
 */
export function useHaptic() {
  return {
    isAvailable: isHapticAvailable(),
    trigger: triggerHaptic,
    cancel: cancelHaptic,
    button: hapticButton,
    success: hapticSuccess,
    error: hapticError,
    warning: hapticWarning,
    selection: hapticSelection,
    longPress: hapticLongPress,
  };
}
