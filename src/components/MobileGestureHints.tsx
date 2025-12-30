import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './MobileGestureHints.css';

const HINT_SHOWN_KEY = 'seatify-mobile-hints-shown';

interface MobileGestureHintsProps {
  isGuestPanelOpen: boolean;
}

export function MobileGestureHints({ isGuestPanelOpen }: MobileGestureHintsProps) {
  // Initialize state from localStorage
  const hintsAlreadyShown = typeof window !== 'undefined' && localStorage.getItem(HINT_SHOWN_KEY) === 'true';
  const [showHint, setShowHint] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(hintsAlreadyShown);

  // Dismiss hint callback
  const dismissHint = useCallback(() => {
    setShowHint(false);
    setHintDismissed(true);
    localStorage.setItem(HINT_SHOWN_KEY, 'true');
  }, []);

  // Show hint for first-time users after delay
  useEffect(() => {
    if (hintsAlreadyShown) return;

    const timer = setTimeout(() => {
      setShowHint(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [hintsAlreadyShown]);

  // Auto-dismiss hint after 5 seconds
  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => {
        dismissHint();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showHint, dismissHint]);

  const content = (
    <>
      {/* Edge indicator - always visible when panel is closed and hints dismissed */}
      {!isGuestPanelOpen && hintDismissed && (
        <div className="edge-indicator" aria-hidden="true">
          <div className="edge-line" />
        </div>
      )}

      {/* First-time hint overlay */}
      {showHint && !isGuestPanelOpen && (
        <div className="gesture-hint-overlay" onClick={dismissHint}>
          <div className="gesture-hint-card">
            <div className="hint-icon">
              <svg viewBox="0 0 24 24" width="32" height="32">
                <path fill="currentColor" d="M10.5 8.5l-2 2 3.5 3.5-3.5 3.5 2 2 5.5-5.5-5.5-5.5z"/>
              </svg>
            </div>
            <div className="hint-content">
              <h3>Swipe from right edge</h3>
              <p>Access your guest list quickly</p>
            </div>
            <div className="hint-dismiss">Tap to dismiss</div>
          </div>
          <div className="gesture-demo">
            <div className="demo-hand" />
            <div className="demo-swipe-trail" />
          </div>
        </div>
      )}
    </>
  );

  return createPortal(content, document.body);
}
