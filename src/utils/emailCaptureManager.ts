/**
 * Email Capture Manager
 * Tracks user engagement milestones and determines when to show email capture modal.
 * Uses localStorage to persist state across sessions.
 */

const STORAGE_KEY = 'seatify_email_capture';

interface EmailCaptureState {
  hasSubscribed: boolean;
  dismissCount: number;
  lastDismissed: string | null;
  triggersShown: {
    guestMilestone: boolean;
    optimizerSuccess: boolean;
    exportAttempt: boolean;
  };
}

const defaultState: EmailCaptureState = {
  hasSubscribed: false,
  dismissCount: 0,
  lastDismissed: null,
  triggersShown: {
    guestMilestone: false,
    optimizerSuccess: false,
    exportAttempt: false,
  },
};

function getState(): EmailCaptureState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultState, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  return defaultState;
}

function setState(updates: Partial<EmailCaptureState>): void {
  const current = getState();
  const newState = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
}

/**
 * Mark user as subscribed - no more email capture prompts
 */
export function markAsSubscribed(): void {
  setState({ hasSubscribed: true });
}

/**
 * Track when user dismisses the modal
 */
export function trackDismissal(): void {
  const state = getState();
  setState({
    dismissCount: state.dismissCount + 1,
    lastDismissed: new Date().toISOString(),
  });
}

/**
 * Check if we should show email capture for a specific trigger
 * Returns false if user has subscribed, dismissed too many times, or already seen this trigger
 */
export function shouldShowEmailCapture(
  trigger: 'guestMilestone' | 'optimizerSuccess' | 'exportAttempt'
): boolean {
  const state = getState();

  // Never show if already subscribed
  if (state.hasSubscribed) return false;

  // Don't show if dismissed 3+ times
  if (state.dismissCount >= 3) return false;

  // Don't show if dismissed within the last hour
  if (state.lastDismissed) {
    const hourAgo = Date.now() - 60 * 60 * 1000;
    if (new Date(state.lastDismissed).getTime() > hourAgo) {
      return false;
    }
  }

  // Check if this specific trigger has been shown
  if (state.triggersShown[trigger]) return false;

  return true;
}

/**
 * Mark a trigger as shown (so we don't show it again)
 */
export function markTriggerShown(
  trigger: 'guestMilestone' | 'optimizerSuccess' | 'exportAttempt'
): void {
  const state = getState();
  setState({
    triggersShown: {
      ...state.triggersShown,
      [trigger]: true,
    },
  });
}

/**
 * Check if user has reached the guest milestone (5+ guests)
 */
export function hasReachedGuestMilestone(guestCount: number): boolean {
  return guestCount >= 5;
}

/**
 * Reset email capture state (for testing)
 */
export function resetEmailCaptureState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
