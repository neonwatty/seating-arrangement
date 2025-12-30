import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGesture } from '@use-gesture/react';
import { useStore } from '../store/useStore';
import { GESTURE_CONFIG, rubberBand } from '../utils/gestureUtils';

interface TransientTopBarProps {
  isVisible: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

/**
 * Transient navigation bar that slides down from top.
 * Contains: Back button, event name (editable), settings button.
 * Supports swipe-up-to-dismiss with velocity detection and rubber-banding.
 */
export function TransientTopBar({
  isVisible,
  onClose,
  onOpenSettings,
}: TransientTopBarProps) {
  const navigate = useNavigate();
  const { event, setEventName } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBack = () => {
    onClose();
    navigate('/events');
  };

  const handleNameClick = () => {
    setIsEditing(true);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  // Swipe-up-to-dismiss gesture with velocity detection and rubber-banding
  useGesture(
    {
      onDrag: ({ movement: [, my], velocity: [, vy], direction: [, dy], active }) => {
        if (!isVisible) return;

        if (active) {
          setIsDragging(true);
          // Upward drag (negative my) dismisses; apply rubber-band for downward
          if (my > 0) {
            // Dragging down (past bounds) - apply rubber-band resistance
            const boundedOffset = rubberBand(my, 0, GESTURE_CONFIG.RUBBER_BAND_FACTOR);
            setDragOffset(boundedOffset);
          } else {
            // Dragging up (toward dismiss) - allow free movement
            setDragOffset(my);
          }
        } else {
          setIsDragging(false);
          setDragOffset(0);

          // Check if should dismiss - velocity OR distance
          const velocityThreshold = GESTURE_CONFIG.VELOCITY_THRESHOLD;
          const dismissThreshold = GESTURE_CONFIG.DISTANCE_THRESHOLD;

          // Swipe up (negative direction and movement) to dismiss
          if (dy < 0 && (vy > velocityThreshold || Math.abs(my) > dismissThreshold)) {
            onClose();
          }
        }
      },
    },
    {
      target: barRef,
      drag: {
        pointer: { touch: true },
        filterTaps: true,
        threshold: 5,
        axis: 'y',
      },
      enabled: isVisible,
    }
  );

  return (
    <div
      ref={barRef}
      className={`transient-top-bar ${isVisible ? 'visible' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        // When dragging, apply offset from current position
        '--drag-offset': isDragging ? `${dragOffset}px` : '0px',
      } as React.CSSProperties}
    >
      <button
        className="back-btn"
        onClick={handleBack}
        aria-label="Back to events"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={event.name}
          onChange={(e) => setEventName(e.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={handleNameKeyDown}
          className="event-name-input"
        />
      ) : (
        <button
          className="event-name"
          onClick={handleNameClick}
          aria-label="Edit event name"
        >
          {event.name || 'Untitled Event'}
        </button>
      )}

      <button
        className="menu-btn"
        onClick={onOpenSettings}
        aria-label="Open settings"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>
    </div>
  );
}
