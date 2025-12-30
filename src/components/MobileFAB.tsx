import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store/useStore';
import type { TableShape } from '../types';
import './MobileFAB.css';

interface MobileFABProps {
  onAddGuest: () => void;
  isHidden?: boolean; // Hide during drag operations
}

export function MobileFAB({ onAddGuest, isHidden = false }: MobileFABProps) {
  const { event, addTable } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isExpanded]);

  const handleAddTable = (shape: TableShape) => {
    const tableNumber = event.tables.length + 1;
    // Position new tables near center of viewport
    const x = Math.max(100, window.innerWidth / 2 - 50 + (tableNumber * 30) % 100);
    const y = Math.max(100, window.innerHeight / 2 - 50 + (tableNumber * 20) % 80);
    addTable(shape, x, y);
    setIsExpanded(false);
  };

  const handleAddGuest = () => {
    onAddGuest();
    setIsExpanded(false);
  };

  const fabContent = (
    <div
      className={`mobile-fab-container ${isHidden ? 'hidden' : ''} ${isExpanded ? 'expanded' : ''}`}
      ref={fabRef}
    >
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div className="fab-backdrop" onClick={() => setIsExpanded(false)} />
      )}

      {/* Action buttons (appear when expanded) */}
      <div className={`fab-actions ${isExpanded ? 'visible' : ''}`}>
        <button
          className="fab-action"
          onClick={handleAddGuest}
          aria-label="Add Guest"
        >
          <span className="fab-action-icon">👤</span>
          <span className="fab-action-label">Guest</span>
        </button>
        <button
          className="fab-action"
          onClick={() => handleAddTable('round')}
          aria-label="Add Round Table"
        >
          <span className="fab-action-icon">⭕</span>
          <span className="fab-action-label">Round</span>
        </button>
        <button
          className="fab-action"
          onClick={() => handleAddTable('rectangle')}
          aria-label="Add Rectangle Table"
        >
          <span className="fab-action-icon">▭</span>
          <span className="fab-action-label">Rectangle</span>
        </button>
      </div>

      {/* Main FAB button */}
      <button
        className={`mobile-fab ${isExpanded ? 'active' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Close menu' : 'Add items'}
        aria-expanded={isExpanded}
      >
        <svg viewBox="0 0 24 24" width="28" height="28" className="fab-icon">
          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      </button>
    </div>
  );

  return createPortal(fabContent, document.body);
}
