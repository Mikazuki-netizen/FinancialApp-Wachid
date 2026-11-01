/**
 * Tactile Haptic Feedback utility for native mobile feel
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light') {
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(40);
          break;
        case 'success':
          navigator.vibrate([15, 50, 25]);
          break;
        case 'warning':
          navigator.vibrate([30, 80, 30]);
          break;
      }
    } catch {
      // Ignore vibration errors on unsupported hardware
    }
  }
}
