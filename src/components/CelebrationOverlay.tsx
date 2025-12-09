import { useEffect, useState, useCallback, useMemo } from 'react';
import { useStore } from '../store/useStore';
import './CelebrationOverlay.css';

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  color: string;
  shape: 'circle' | 'square' | 'ribbon';
  duration: number;
}

const CONFETTI_COLORS = [
  '#8b5cf6', // purple (primary)
  '#ec4899', // pink (secondary)
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
];

const CONFETTI_COUNT = 50;

// Generate confetti pieces
function generateConfetti(): ConfettiPiece[] {
  const pieces: ConfettiPiece[] = [];
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    pieces.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: ['circle', 'square', 'ribbon'][Math.floor(Math.random() * 3)] as ConfettiPiece['shape'],
      duration: 2 + Math.random() * 2,
    });
  }
  return pieces;
}

export function CelebrationOverlay() {
  const { showCelebration, dismissCelebration, celebrationStats } = useStore();
  const [isDismissing, setIsDismissing] = useState(false);
  const [celebrationKey, setCelebrationKey] = useState(0);

  // Increment key when celebration starts to regenerate confetti
  useEffect(() => {
    if (showCelebration) {
      setCelebrationKey(k => k + 1);
      setIsDismissing(false);
    }
  }, [showCelebration]);

  // Generate confetti with stable memoization based on celebration key
  const confetti = useMemo(() => {
    if (!showCelebration) return [];
    return generateConfetti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrationKey]);

  const handleDismiss = useCallback(() => {
    setIsDismissing(true);
    setTimeout(() => {
      dismissCelebration();
    }, 300);
  }, [dismissCelebration]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (showCelebration && !isDismissing) {
      const timer = setTimeout(handleDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration, isDismissing, handleDismiss]);

  // Handle escape key
  useEffect(() => {
    if (!showCelebration) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCelebration, handleDismiss]);

  if (!showCelebration) return null;

  return (
    <div
      className={`celebration-overlay active ${isDismissing ? 'dismissing' : ''}`}
      onClick={handleDismiss}
    >
      {/* Confetti */}
      <div className="confetti-container">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className={`confetti ${piece.shape}`}
            style={{
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Success message */}
      <div className="celebration-message" onClick={(e) => e.stopPropagation()}>
        <div className="celebration-icon">🎉</div>
        <h2 className="celebration-title">Seating Complete!</h2>
        <p className="celebration-subtitle">
          Your guests have been optimally seated
        </p>

        {celebrationStats && (
          <div className="celebration-stats">
            <div className="celebration-stat">
              <div className="stat-value">{celebrationStats.guestsSeated}</div>
              <div className="stat-label">Guests Seated</div>
            </div>
            <div className="celebration-stat">
              <div className="stat-value">{celebrationStats.tablesUsed}</div>
              <div className="stat-label">Tables Used</div>
            </div>
            {celebrationStats.score !== undefined && (
              <div className="celebration-stat">
                <div className="stat-value">{celebrationStats.score}</div>
                <div className="stat-label">Score</div>
              </div>
            )}
          </div>
        )}

        <button className="celebration-dismiss" onClick={handleDismiss}>
          Continue
        </button>
      </div>
    </div>
  );
}
