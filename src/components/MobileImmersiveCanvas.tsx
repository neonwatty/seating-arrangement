import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useGesture } from '@use-gesture/react';
import { TransientTopBar } from './TransientTopBar';
import { BottomControlSheet } from './BottomControlSheet';
import { useStore } from '../store/useStore';
import { GESTURE_CONFIG } from '../utils/gestureUtils';
import './MobileImmersiveCanvas.css';

interface MobileImmersiveCanvasProps {
  children: ReactNode;
  showRelationships: boolean;
  onToggleRelationships: () => void;
  onShowImport: () => void;
  isGuestPanelOpen?: boolean;
  onOpenGuestPanel?: () => void;
  onCloseGuestPanel?: () => void;
}

/**
 * Wraps the canvas in immersive mode for mobile devices.
 * Provides gesture-based UI access:
 * - Swipe DOWN: Show top navigation bar
 * - Swipe UP: Show bottom control sheet
 * - Swipe LEFT (from right): Open guest panel (handled by MobileGuestPanel)
 */
export function MobileImmersiveCanvas({
  children,
  showRelationships,
  onToggleRelationships,
  onShowImport,
  isGuestPanelOpen = false,
  onOpenGuestPanel,
  onCloseGuestPanel,
}: MobileImmersiveCanvasProps) {
  const { hasSeenImmersiveHint, setHasSeenImmersiveHint } = useStore();

  const [topBarVisible, setTopBarVisible] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Single drawer logic: close other drawers when one opens
  const openTopBar = useCallback(() => {
    setTopBarVisible(true);
    setBottomSheetVisible(false);
    onCloseGuestPanel?.();
    setShowHint(false);
  }, [onCloseGuestPanel]);

  const openBottomSheet = useCallback(() => {
    setBottomSheetVisible(true);
    setTopBarVisible(false);
    onCloseGuestPanel?.();
    setShowHint(false);
  }, [onCloseGuestPanel]);

  const openGuestPanel = useCallback(() => {
    onOpenGuestPanel?.();
    setTopBarVisible(false);
    setBottomSheetVisible(false);
    setShowHint(false);
  }, [onOpenGuestPanel]);

  // Show hint for first-time users
  useEffect(() => {
    if (!hasSeenImmersiveHint) {
      const timer = setTimeout(() => {
        setShowHint(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenImmersiveHint]);

  // Auto-hide hint after a few seconds
  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => {
        setShowHint(false);
        setHasSeenImmersiveHint();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showHint, setHasSeenImmersiveHint]);

  // Velocity-aware gesture detection using @use-gesture
  // Uses velocity OR distance threshold (iOS-like feel)
  useGesture(
    {
      onDrag: ({ movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], active, event }) => {
        // Only process on gesture end
        if (active) return;

        // Check if primarily vertical or horizontal
        const isVertical = Math.abs(my) > Math.abs(mx);
        const minSwipe = GESTURE_CONFIG.DISTANCE_THRESHOLD;
        const velocityThreshold = GESTURE_CONFIG.VELOCITY_THRESHOLD;

        // Handle dismissal gestures when panels are open
        if (topBarVisible && isVertical && dy < 0) {
          // Swipe UP to dismiss top bar - check velocity OR distance
          if (vy > velocityThreshold || Math.abs(my) > minSwipe) {
            setTopBarVisible(false);
            return;
          }
        }

        // Note: BottomControlSheet handles its own dismissal via drag gestures
        // but we keep this for swipes that start on the canvas
        if (bottomSheetVisible && isVertical && dy > 0) {
          // Swipe DOWN to dismiss bottom sheet
          if (vy > velocityThreshold || my > minSwipe) {
            setBottomSheetVisible(false);
            return;
          }
        }

        if (isGuestPanelOpen && !isVertical && dx > 0) {
          // Swipe RIGHT to dismiss guest panel
          if (vx > velocityThreshold || mx > minSwipe) {
            onCloseGuestPanel?.();
            return;
          }
        }

        // Don't process opening gestures if panels are already open
        if (topBarVisible || bottomSheetVisible || isGuestPanelOpen) {
          return;
        }

        // Ignore touches that started on interactive elements
        const target = event?.target as HTMLElement | null;
        if (target) {
          const isOnInteractiveElement =
            target.closest('.mobile-fab') ||
            target.closest('.corner-indicator') ||
            target.closest('.transient-top-bar') ||
            target.closest('.bottom-control-sheet') ||
            target.closest('.mobile-guest-panel') ||
            target.closest('button') ||
            target.closest('input');

          if (isOnInteractiveElement) {
            return;
          }
        }

        if (isVertical) {
          // Swipe DOWN = show top bar (velocity OR distance triggers)
          if (dy > 0 && (vy > velocityThreshold || my > minSwipe)) {
            openTopBar();
            return;
          }

          // Swipe UP = show bottom sheet
          if (dy < 0 && (vy > velocityThreshold || Math.abs(my) > minSwipe)) {
            openBottomSheet();
            return;
          }
        } else {
          // Swipe LEFT (from right) = open guest panel
          if (dx < 0 && (vx > velocityThreshold || Math.abs(mx) > minSwipe) && onOpenGuestPanel) {
            openGuestPanel();
            return;
          }
        }
      },
    },
    {
      target: typeof window !== 'undefined' ? window : undefined,
      drag: {
        pointer: { touch: true },
        filterTaps: true,
        threshold: 10,
      },
    }
  );

  // Close all overlays
  const closeAll = () => {
    setTopBarVisible(false);
    setBottomSheetVisible(false);
  };

  // Corner indicator tap - show top bar (single drawer only)
  const handleCornerTap = () => {
    openTopBar();
    setHasSeenImmersiveHint();
  };

  return (
    <div className="mobile-immersive-canvas">
      {/* Main canvas content */}
      {children}

      {/* Transient Top Bar */}
      <TransientTopBar
        isVisible={topBarVisible}
        onClose={closeAll}
        onOpenSettings={openBottomSheet}
      />

      {/* Bottom Control Sheet */}
      <BottomControlSheet
        isVisible={bottomSheetVisible}
        onClose={closeAll}
        showRelationships={showRelationships}
        onToggleRelationships={onToggleRelationships}
        onShowImport={onShowImport}
      />

      {/* Corner Indicator - always visible */}
      <button
        className="corner-indicator"
        onClick={handleCornerTap}
        aria-label="Show controls"
      >
        <span className="indicator-dot" />
      </button>

      {/* First-time hint */}
      {showHint && (
        <div className="immersive-hint">
          <div className="hint-content">
            <p><strong>Swipe to access controls</strong></p>
            <p>↓ Down for nav • ↑ Up for tools</p>
          </div>
        </div>
      )}

      {/* Edge hint indicators */}
      <div className="edge-hint top" />
      <div className="edge-hint bottom" />
    </div>
  );
}
