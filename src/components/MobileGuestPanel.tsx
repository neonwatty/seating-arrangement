import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGesture } from '@use-gesture/react';
import { useStore } from '../store/useStore';
import { getFullName, getInitials } from '../types';
import { GESTURE_CONFIG, rubberBand } from '../utils/gestureUtils';
import type { Guest } from '../types';
import './MobileGuestPanel.css';

const EDGE_ZONE = 30; // pixels from right edge to trigger (Safari back-swipe safety)
const OPEN_THRESHOLD = 80; // horizontal swipe distance to open

interface MobileGuestPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export function MobileGuestPanel({ isOpen, onOpen, onClose }: MobileGuestPanelProps) {
  const { event, selectGuest, setEditingGuest, canvas, panToPosition } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unassigned' | 'assigned'>('all');
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  // Filter guests based on search and filter
  const filteredGuests = event.guests.filter(guest => {
    const fullName = getFullName(guest).toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'unassigned') return !guest.tableId;
    if (filter === 'assigned') return !!guest.tableId;
    return true;
  });

  // Group guests by assignment status
  const unassignedGuests = filteredGuests.filter(g => !g.tableId);
  const assignedGuests = filteredGuests.filter(g => g.tableId);

  // Edge swipe to open (from right edge of screen)
  // Uses velocity OR distance threshold for iOS-like feel
  useGesture(
    {
      onDrag: ({ movement: [mx], velocity: [vx], direction: [dx], active, xy: [startX] }) => {
        // Only process when panel is closed
        if (isOpen) return;

        // Check if started in edge zone (right side of screen)
        const windowWidth = window.innerWidth;
        const inEdgeZone = startX >= windowWidth - EDGE_ZONE;
        if (!inEdgeZone) return;

        // On gesture end, check if should open
        if (!active) {
          const velocityThreshold = GESTURE_CONFIG.VELOCITY_THRESHOLD;
          // Swipe left (negative movement) to open
          if (dx < 0 && (vx > velocityThreshold || Math.abs(mx) > OPEN_THRESHOLD)) {
            onOpen();
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
        axis: 'x',
      },
      enabled: !isOpen,
    }
  );

  // Panel drag-to-close with velocity detection and rubber-banding
  useGesture(
    {
      onDrag: ({ movement: [mx], velocity: [vx], direction: [dx], active }) => {
        if (!isOpen) return;

        if (active) {
          setIsDragging(true);
          // Apply rubber-band when dragging left (past bounds)
          if (mx < 0) {
            // Rubber-band resistance when dragging left
            const boundedOffset = rubberBand(mx, 0, GESTURE_CONFIG.RUBBER_BAND_FACTOR);
            setDragOffset(boundedOffset);
          } else {
            // Allow free drag to the right (toward close)
            setDragOffset(mx);
          }
        } else {
          setIsDragging(false);
          setDragOffset(0);

          // Check if should close - velocity OR distance
          const velocityThreshold = GESTURE_CONFIG.VELOCITY_THRESHOLD;
          const closeThreshold = GESTURE_CONFIG.DISTANCE_THRESHOLD;

          if (dx > 0 && (vx > velocityThreshold || mx > closeThreshold)) {
            onClose();
          }
        }
      },
    },
    {
      target: handleRef,
      drag: {
        pointer: { touch: true },
        filterTaps: true,
        threshold: 5,
        axis: 'x',
      },
      enabled: isOpen,
    }
  );

  // Find table name for assigned guest
  const getTableName = (guest: Guest) => {
    if (!guest.tableId) return null;
    const table = event.tables.find(t => t.id === guest.tableId);
    return table?.name || 'Table';
  };

  // Handle guest tap - navigate to them on canvas
  const handleGuestTap = (guest: Guest) => {
    selectGuest(guest.id);

    // If guest is on a table, pan to the table
    if (guest.tableId) {
      const table = event.tables.find(t => t.id === guest.tableId);
      if (table) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        panToPosition(table.x, table.y, viewportWidth, viewportHeight);
      }
    } else if (guest.canvasX !== undefined && guest.canvasY !== undefined) {
      // Pan to unassigned guest on canvas
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      panToPosition(guest.canvasX, guest.canvasY, viewportWidth, viewportHeight);
    }

    onClose();
  };

  // Handle guest edit
  const handleGuestEdit = (guest: Guest, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGuest(guest.id);
    onClose();
  };

  const panelContent = (
    <>
      {/* Backdrop */}
      <div
        className={`mobile-guest-panel-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`mobile-guest-panel ${isOpen ? 'open' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{
          transform: isDragging && dragOffset > 0 ? `translateX(${dragOffset}px)` : undefined,
        }}
      >
        {/* Swipe handle - touch target for close gesture */}
        <div ref={handleRef} className="panel-handle">
          <div className="handle-bar" />
        </div>

        {/* Header */}
        <div className="panel-header">
          <h2>Guests</h2>
          <span className="guest-count-badge">{event.guests.length}</span>
          <button className="panel-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="panel-search">
          <svg viewBox="0 0 24 24" width="18" height="18" className="search-icon">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Search guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="panel-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({event.guests.length})
          </button>
          <button
            className={`filter-btn ${filter === 'unassigned' ? 'active' : ''}`}
            onClick={() => setFilter('unassigned')}
          >
            Unassigned ({event.guests.filter(g => !g.tableId).length})
          </button>
          <button
            className={`filter-btn ${filter === 'assigned' ? 'active' : ''}`}
            onClick={() => setFilter('assigned')}
          >
            Seated ({event.guests.filter(g => g.tableId).length})
          </button>
        </div>

        {/* Guest list */}
        <div className="panel-guest-list">
          {filteredGuests.length === 0 ? (
            <div className="panel-empty">
              {searchQuery ? `No guests match "${searchQuery}"` : 'No guests yet'}
            </div>
          ) : (
            <>
              {/* Unassigned section */}
              {filter !== 'assigned' && unassignedGuests.length > 0 && (
                <div className="guest-section">
                  {filter === 'all' && <div className="section-label">Unassigned</div>}
                  {unassignedGuests.map(guest => (
                    <div
                      key={guest.id}
                      className={`panel-guest-item ${canvas.selectedGuestIds.includes(guest.id) ? 'selected' : ''}`}
                      onClick={() => handleGuestTap(guest)}
                    >
                      <div
                        className="guest-avatar"
                        style={{
                          backgroundColor: guest.group ? `var(--group-${guest.group})` : 'var(--color-text-secondary)'
                        }}
                      >
                        {getInitials(guest)}
                      </div>
                      <div className="guest-info">
                        <span className="guest-name">{getFullName(guest)}</span>
                        {guest.group && <span className="guest-group">{guest.group}</span>}
                      </div>
                      <button
                        className="guest-edit-btn"
                        onClick={(e) => handleGuestEdit(guest, e)}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Assigned section */}
              {filter !== 'unassigned' && assignedGuests.length > 0 && (
                <div className="guest-section">
                  {filter === 'all' && <div className="section-label">Seated</div>}
                  {assignedGuests.map(guest => (
                    <div
                      key={guest.id}
                      className={`panel-guest-item ${canvas.selectedGuestIds.includes(guest.id) ? 'selected' : ''}`}
                      onClick={() => handleGuestTap(guest)}
                    >
                      <div
                        className="guest-avatar"
                        style={{
                          backgroundColor: guest.group ? `var(--group-${guest.group})` : 'var(--color-text-secondary)'
                        }}
                      >
                        {getInitials(guest)}
                      </div>
                      <div className="guest-info">
                        <span className="guest-name">{getFullName(guest)}</span>
                        <span className="guest-table">{getTableName(guest)}</span>
                      </div>
                      <button
                        className="guest-edit-btn"
                        onClick={(e) => handleGuestEdit(guest, e)}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(panelContent, document.body);
}
