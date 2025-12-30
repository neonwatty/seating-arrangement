/**
 * Shared gesture utilities for iOS-like mobile interactions
 * Used by BottomControlSheet, MobileGuestPanel, TransientTopBar
 */

// Detent positions as percentage of viewport height
export const DETENT_THRESHOLDS = {
  SMALL: 0.25,   // 25% of screen
  MEDIUM: 0.5,   // 50% of screen
  LARGE: 0.9,    // 90% of screen
} as const;

export type DetentSize = 'small' | 'medium' | 'large';

// Gesture detection configuration
export const GESTURE_CONFIG = {
  VELOCITY_THRESHOLD: 0.5,    // px/ms for fast flick detection
  DISTANCE_THRESHOLD: 80,     // px to trigger snap without velocity
  RUBBER_BAND_FACTOR: 0.3,    // resistance when dragging past bounds (iOS uses ~0.55)
  DISMISS_THRESHOLD: 50,      // px below smallest detent to dismiss
  SPRING_DURATION: 350,       // ms for snap animation
} as const;

/**
 * iOS-like rubber-banding effect when dragging past bounds.
 * Creates resistance that increases as you drag further past the limit.
 *
 * @param offset Current drag offset
 * @param limit Maximum allowed offset (0 for top bound, max for bottom)
 * @param factor Resistance factor (lower = more resistance)
 * @returns Rubber-banded offset value
 */
export function rubberBand(offset: number, limit: number, factor = GESTURE_CONFIG.RUBBER_BAND_FACTOR): number {
  // Within bounds - no rubber-banding needed
  if (offset >= 0 && offset <= limit) {
    return offset;
  }

  // Past bounds - apply diminishing returns
  const overflow = offset > limit ? offset - limit : offset;
  const dampedOverflow = overflow * factor * (1 - Math.min(Math.abs(overflow) / 500, 0.8));

  if (offset > limit) {
    return limit + dampedOverflow;
  }
  return dampedOverflow;
}

/**
 * Convert detent size to pixel height
 */
export function detentToHeight(detent: DetentSize, maxHeight: number): number {
  const ratio = DETENT_THRESHOLDS[detent.toUpperCase() as keyof typeof DETENT_THRESHOLDS];
  return maxHeight * ratio;
}

/**
 * Convert detent size to Y position (from top of screen)
 * Sheet position = screenHeight - sheetHeight
 */
export function detentToY(detent: DetentSize, maxHeight: number): number {
  const sheetHeight = detentToHeight(detent, maxHeight);
  return maxHeight - sheetHeight;
}

/**
 * Find the nearest detent based on current position and velocity.
 * Fast flicks snap in the direction of movement, slow drags snap to nearest.
 *
 * @param currentY Current Y position of sheet top (from viewport top)
 * @param velocity Vertical velocity (positive = moving down/closing)
 * @param maxHeight Viewport height
 * @param detents Available detent ratios (default: all three)
 * @returns The detent ratio to snap to, or -1 if should dismiss
 */
export function findNearestDetent(
  currentY: number,
  velocity: number,
  maxHeight: number,
  detents: number[] = [DETENT_THRESHOLDS.SMALL, DETENT_THRESHOLDS.MEDIUM, DETENT_THRESHOLDS.LARGE]
): number {
  // Convert Y position to ratio (0 = closed, 1 = full screen)
  const currentRatio = 1 - (currentY / maxHeight);

  // Check for dismiss (dragged below smallest detent threshold)
  const smallestDetent = Math.min(...detents);
  if (currentRatio < smallestDetent - (GESTURE_CONFIG.DISMISS_THRESHOLD / maxHeight)) {
    return -1; // Signal to dismiss
  }

  // Fast flick - snap in direction of velocity
  if (Math.abs(velocity) > GESTURE_CONFIG.VELOCITY_THRESHOLD) {
    const direction = velocity > 0 ? -1 : 1; // positive velocity = moving down = smaller detent

    // Find current detent index
    const sortedDetents = [...detents].sort((a, b) => a - b);
    let currentIndex = sortedDetents.findIndex(d => d >= currentRatio);
    if (currentIndex === -1) currentIndex = sortedDetents.length - 1;

    // Move in direction of flick
    const targetIndex = Math.max(0, Math.min(sortedDetents.length - 1, currentIndex + direction));
    return sortedDetents[targetIndex];
  }

  // Slow drag - snap to nearest detent
  return detents.reduce((prev, curr) =>
    Math.abs(curr - currentRatio) < Math.abs(prev - currentRatio) ? curr : prev
  );
}

/**
 * Convert a detent ratio back to DetentSize
 */
export function ratioToDetentSize(ratio: number): DetentSize {
  if (ratio <= DETENT_THRESHOLDS.SMALL + 0.05) return 'small';
  if (ratio <= DETENT_THRESHOLDS.MEDIUM + 0.1) return 'medium';
  return 'large';
}

/**
 * Check if a scroll container is at the top (allowing drag-to-dismiss)
 */
export function isScrollAtTop(element: HTMLElement | null): boolean {
  if (!element) return true;
  return element.scrollTop <= 0;
}

/**
 * Check if a scroll container is at the bottom
 */
export function isScrollAtBottom(element: HTMLElement | null): boolean {
  if (!element) return true;
  return element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
}
