import { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import type { Table, Guest, VenueElement } from '../types';
import { getFullName, getInitials } from '../types';
import './ReadOnlyCanvas.css';

interface ReadOnlyCanvasProps {
  tables: Table[];
  guests: Guest[];
  venueElements?: VenueElement[];
  eventName?: string;
}

// Calculate seat positions for a table
function getSeatPositionsForTable(table: Table, capacity: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];

  if (table.shape === 'round' || table.shape === 'oval') {
    const radiusX = table.width / 2 + 20;
    const radiusY = table.shape === 'oval' ? table.height / 2 + 20 : radiusX;
    for (let i = 0; i < capacity; i++) {
      const angle = (2 * Math.PI * i) / capacity - Math.PI / 2;
      positions.push({
        x: table.x + table.width / 2 + radiusX * Math.cos(angle),
        y: table.y + table.height / 2 + radiusY * Math.sin(angle),
      });
    }
  } else if (table.shape === 'half-round') {
    const radius = table.width / 2 + 20;
    // Seats only on the curved side (top half)
    for (let i = 0; i < capacity; i++) {
      const angle = Math.PI + (Math.PI * i) / (capacity - 1 || 1);
      positions.push({
        x: table.x + table.width / 2 + radius * Math.cos(angle),
        y: table.y + table.height / 2 + radius * Math.sin(angle),
      });
    }
  } else {
    // Rectangle/square
    const longSideSeats = Math.ceil(capacity / 2);
    const seatSpacing = table.width / (longSideSeats + 1);
    for (let i = 0; i < longSideSeats; i++) {
      positions.push({
        x: table.x + seatSpacing * (i + 1),
        y: table.y - 20,
      });
    }
    for (let i = 0; i < capacity - longSideSeats; i++) {
      positions.push({
        x: table.x + seatSpacing * (i + 1),
        y: table.y + table.height + 20,
      });
    }
  }

  return positions;
}

// Get dietary restriction icons
function getDietaryIcons(restrictions: string[] | undefined): string {
  if (!restrictions || restrictions.length === 0) return '';
  const icons: string[] = [];
  if (restrictions.includes('vegetarian')) icons.push('🥬');
  if (restrictions.includes('vegan')) icons.push('🌱');
  if (restrictions.includes('gluten-free')) icons.push('🌾');
  if (restrictions.includes('kosher')) icons.push('✡️');
  if (restrictions.includes('halal')) icons.push('☪️');
  if (restrictions.includes('nut-free')) icons.push('🥜');
  return icons.slice(0, 2).join('');
}

export function ReadOnlyCanvas({ tables, guests, venueElements = [], eventName }: ReadOnlyCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(50);
  const [panY, setPanY] = useState(50);
  const [isReady, setIsReady] = useState(false);

  // Tooltip state
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  // Auto-center canvas on mount
  useLayoutEffect(() => {
    if (tables.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional initial state set on mount
      setIsReady(true);
      return;
    }

    // Calculate bounding box of all tables
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const table of tables) {
      minX = Math.min(minX, table.x);
      minY = Math.min(minY, table.y);
      maxX = Math.max(maxX, table.x + table.width);
      maxY = Math.max(maxY, table.y + table.height);
    }

    // Add padding
    const padding = 100;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Get canvas dimensions
    const canvasWidth = canvasRef.current?.clientWidth || 800;
    const canvasHeight = canvasRef.current?.clientHeight || 600;

    // Calculate zoom to fit
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const zoomX = canvasWidth / contentWidth;
    const zoomY = canvasHeight / contentHeight;
    const newZoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.25), 2);

    // Calculate pan to center content
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const newPanX = (canvasWidth / 2) - (centerX * newZoom);
    const newPanY = (canvasHeight / 2) - (centerY * newZoom);

    setZoom(newZoom);
    setPanX(newPanX);
    setPanY(newPanY);
    setIsReady(true);
  }, [tables]);

  // Gesture handling for pinch-to-zoom and pan
  useGesture(
    {
      onPinch: ({ offset: [scale], origin: [ox, oy], memo }) => {
        const newZoom = Math.min(2, Math.max(0.25, scale));

        if (!memo) {
          memo = {
            originX: (ox - panX) / zoom,
            originY: (oy - panY) / zoom,
          };
        }

        const newPanX = ox - memo.originX * newZoom;
        const newPanY = oy - memo.originY * newZoom;

        setZoom(newZoom);
        setPanX(newPanX);
        setPanY(newPanY);

        return memo;
      },
      onDrag: ({ delta: [dx, dy], touches, pinching }) => {
        if (pinching) return;
        // Allow single-finger or two-finger panning
        if (touches >= 1) {
          setPanX(prev => prev + dx);
          setPanY(prev => prev + dy);
        }
      },
    },
    {
      target: gestureRef,
      eventOptions: { passive: false },
      pinch: {
        scaleBounds: { min: 0.25, max: 2 },
        from: () => [zoom, 0],
      },
      drag: {
        pointer: { touch: true },
        filterTaps: true,
        threshold: 10,
      },
    }
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.min(2, Math.max(0.25, prev + delta)));
      } else {
        setPanX(prev => prev - e.deltaX);
        setPanY(prev => prev - e.deltaY);
      }
    },
    []
  );

  const handleRecenter = () => {
    if (tables.length === 0) {
      setPanX(50);
      setPanY(50);
      setZoom(1);
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const table of tables) {
      minX = Math.min(minX, table.x);
      minY = Math.min(minY, table.y);
      maxX = Math.max(maxX, table.x + table.width);
      maxY = Math.max(maxY, table.y + table.height);
    }

    const padding = 100;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const canvasWidth = canvasRef.current?.clientWidth || 800;
    const canvasHeight = canvasRef.current?.clientHeight || 600;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const zoomX = canvasWidth / contentWidth;
    const zoomY = canvasHeight / contentHeight;
    const newZoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.25), 2);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const newPanX = (canvasWidth / 2) - (centerX * newZoom);
    const newPanY = (canvasHeight / 2) - (centerY * newZoom);

    setZoom(newZoom);
    setPanX(newPanX);
    setPanY(newPanY);
  };

  // Get guests for a specific table
  const getTableGuests = (tableId: string) => {
    return guests.filter(g => g.tableId === tableId);
  };

  // Show tooltip for a guest
  const showGuestTooltip = (guest: Guest, x: number, y: number) => {
    const table = guest.tableId ? tables.find(t => t.id === guest.tableId) : null;
    const dietary = getDietaryIcons(guest.dietaryRestrictions);
    let content = getFullName(guest);
    if (table) content += ` (${table.name})`;
    if (guest.group) content += `\nGroup: ${guest.group}`;
    if (dietary) content += `\n${dietary}`;
    setTooltip({ x, y, content });
  };

  return (
    <div className="readonly-canvas-container">
      {/* Header */}
      <div className="readonly-canvas-header">
        <div className="readonly-header-left">
          {eventName && <h2 className="readonly-event-name">{eventName}</h2>}
          <span className="readonly-stats">
            {tables.length} table{tables.length !== 1 ? 's' : ''} &bull; {guests.length} guest{guests.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="readonly-header-right">
          <div className="readonly-zoom-controls">
            <button onClick={() => setZoom(prev => Math.max(0.25, prev - 0.1))} title="Zoom Out">−</button>
            <span className="zoom-display">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} title="Zoom In">+</button>
            <button onClick={handleRecenter} className="recenter-btn" title="Re-center">⌖</button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={(node) => {
          (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          (gestureRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className="readonly-canvas"
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
      >
        <div
          className="readonly-canvas-content"
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: '0 0',
            opacity: isReady ? 1 : 0,
          }}
        >
          {/* Venue Elements */}
          {venueElements.map((element) => (
            <div
              key={element.id}
              className={`readonly-venue-element readonly-venue-${element.type}`}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
              }}
            >
              <span className="venue-label">{element.label}</span>
            </div>
          ))}

          {/* Tables */}
          {tables.map((table) => {
            const tableGuests = getTableGuests(table.id);
            const seatPositions = getSeatPositionsForTable(table, table.capacity);

            return (
              <div key={table.id} className="readonly-table-wrapper">
                {/* Table shape */}
                <div
                  className={`readonly-table readonly-table-${table.shape}`}
                  style={{
                    left: table.x,
                    top: table.y,
                    width: table.width,
                    height: table.height,
                    transform: table.rotation ? `rotate(${table.rotation}deg)` : undefined,
                  }}
                >
                  <span className="table-name">{table.name}</span>
                  <span className="table-count">{tableGuests.length}/{table.capacity}</span>
                </div>

                {/* Seated guests */}
                {tableGuests.map((guest, index) => {
                  const seatIndex = guest.seatIndex ?? index;
                  const seatPos = seatPositions[seatIndex] || seatPositions[0];
                  if (!seatPos) return null;

                  const dietary = getDietaryIcons(guest.dietaryRestrictions);

                  return (
                    <div
                      key={guest.id}
                      className="readonly-guest"
                      style={{
                        left: seatPos.x,
                        top: seatPos.y,
                      }}
                      onMouseEnter={(e) => showGuestTooltip(guest, e.clientX, e.clientY)}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <span className="guest-initials">{getInitials(guest)}</span>
                      {dietary && <span className="guest-dietary">{dietary}</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Unassigned guests on canvas */}
          {guests
            .filter(g => !g.tableId && g.canvasX !== undefined && g.canvasY !== undefined)
            .map((guest) => {
              const dietary = getDietaryIcons(guest.dietaryRestrictions);
              return (
                <div
                  key={guest.id}
                  className="readonly-guest readonly-guest-unassigned"
                  style={{
                    left: guest.canvasX,
                    top: guest.canvasY,
                  }}
                  onMouseEnter={(e) => showGuestTooltip(guest, e.clientX, e.clientY)}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <span className="guest-initials">{getInitials(guest)}</span>
                  {dietary && <span className="guest-dietary">{dietary}</span>}
                </div>
              );
            })}
        </div>

        {/* Empty state */}
        {tables.length === 0 && guests.length === 0 && (
          <div className="readonly-empty">
            <p>No seating arrangement to display.</p>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="readonly-tooltip"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
        >
          {tooltip.content.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}
