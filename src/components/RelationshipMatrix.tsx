import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { RelationshipType } from '../types';
import './RelationshipMatrix.css';

const RELATIONSHIP_TYPES: {
  value: RelationshipType | null;
  label: string;
  short: string;
  color: string;
}[] = [
  { value: null, label: 'None', short: '-', color: 'transparent' },
  { value: 'partner', label: 'Partner', short: 'P', color: '#e91e63' },
  { value: 'family', label: 'Family', short: 'F', color: '#9c27b0' },
  { value: 'friend', label: 'Friend', short: '+', color: '#2196f3' },
  { value: 'colleague', label: 'Colleague', short: 'C', color: '#4caf50' },
  { value: 'avoid', label: 'Avoid', short: 'X', color: '#f44336' },
];

const getStrengthForType = (type: RelationshipType): number => {
  switch (type) {
    case 'partner':
      return 5;
    case 'family':
      return 4;
    case 'friend':
      return 3;
    case 'colleague':
      return 2;
    case 'avoid':
      return 5;
    default:
      return 3;
  }
};

export function RelationshipMatrix() {
  const { event, addRelationship, removeRelationship } = useStore();
  const [selectedCell, setSelectedCell] = useState<{ from: string; to: string } | null>(null);

  const confirmedGuests = event.guests.filter((g) => g.rsvpStatus !== 'declined');

  // Sort guests by table assignment for better visualization of seating optimization
  const sortedGuests = useMemo(() => {
    // Create a map of table order (by table name for consistent sorting)
    const tableOrder = new Map<string, number>();
    const sortedTables = [...event.tables].sort((a, b) => a.name.localeCompare(b.name));
    sortedTables.forEach((table, idx) => tableOrder.set(table.id, idx));

    return [...confirmedGuests].sort((a, b) => {
      // Guests with tables come first, sorted by table
      const aTableOrder = a.tableId ? tableOrder.get(a.tableId) ?? 999 : 1000;
      const bTableOrder = b.tableId ? tableOrder.get(b.tableId) ?? 999 : 1000;

      if (aTableOrder !== bTableOrder) {
        return aTableOrder - bTableOrder;
      }

      // Within same table (or both unassigned), sort by name
      return a.name.localeCompare(b.name);
    });
  }, [confirmedGuests, event.tables]);

  // Get table boundaries for visual separators
  const tableBoundaries = useMemo(() => {
    const boundaries = new Set<number>();
    let lastTableId: string | undefined = undefined;

    sortedGuests.forEach((guest, idx) => {
      if (idx > 0 && guest.tableId !== lastTableId) {
        boundaries.add(idx);
      }
      lastTableId = guest.tableId;
    });

    return boundaries;
  }, [sortedGuests]);

  // Get table name for a guest
  const getTableName = (tableId: string | undefined) => {
    if (!tableId) return null;
    return event.tables.find(t => t.id === tableId)?.name || null;
  };

  const getRelationship = (fromId: string, toId: string) => {
    const guest = event.guests.find((g) => g.id === fromId);
    return guest?.relationships?.find((r) => r.guestId === toId);
  };

  const setRelationship = (fromId: string, toId: string, type: RelationshipType | null) => {
    if (type === null) {
      removeRelationship(fromId, toId);
      removeRelationship(toId, fromId);
    } else {
      const strength = getStrengthForType(type);
      addRelationship(fromId, toId, type, strength);
      addRelationship(toId, fromId, type, strength);
    }
    setSelectedCell(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const handleCellClick = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setSelectedCell({ from: fromId, to: toId });
  };

  return (
    <div className="relationship-matrix">
      <div className="matrix-controls">
        <div className="legend">
          {RELATIONSHIP_TYPES.filter((t) => t.value).map((type) => (
            <span key={type.value} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: type.color }}
              >
                {type.short}
              </span>
              {type.label}
            </span>
          ))}
        </div>
      </div>

      <div className="matrix-scroll">
        <div className="matrix-grid">
          {/* Header row */}
          <div className="matrix-header">
            <div className="matrix-corner"></div>
            {sortedGuests.map((guest, colIdx) => {
              const tableName = getTableName(guest.tableId);
              const isBoundary = tableBoundaries.has(colIdx);
              return (
                <div
                  key={guest.id}
                  className={`matrix-col-header ${isBoundary ? 'table-boundary' : ''}`}
                  title={`${guest.name}${tableName ? ` (${tableName})` : ' (Unassigned)'}`}
                >
                  {getInitials(guest.name)}
                </div>
              );
            })}
          </div>

          {/* Data rows */}
          {sortedGuests.map((rowGuest, rowIdx) => {
            const rowTableName = getTableName(rowGuest.tableId);
            const isRowBoundary = tableBoundaries.has(rowIdx);

            return (
              <div key={rowGuest.id} className={`matrix-row ${isRowBoundary ? 'table-boundary' : ''}`}>
                <div
                  className="matrix-row-header"
                  title={`${rowGuest.name}${rowTableName ? ` (${rowTableName})` : ' (Unassigned)'}`}
                >
                  <span className="row-name">{rowGuest.name}</span>
                  {rowTableName && <span className="row-table">{rowTableName}</span>}
                </div>
                {sortedGuests.map((colGuest, colIdx) => {
                  const rel = getRelationship(rowGuest.id, colGuest.id);
                  const typeInfo = RELATIONSHIP_TYPES.find((t) => t.value === rel?.type);
                  const isDisabled = rowGuest.id === colGuest.id;
                  const isSelected =
                    selectedCell?.from === rowGuest.id && selectedCell?.to === colGuest.id;
                  const isSameTable = rowGuest.tableId && rowGuest.tableId === colGuest.tableId;
                  const isColBoundary = tableBoundaries.has(colIdx);

                  return (
                    <div
                      key={`${rowGuest.id}-${colGuest.id}`}
                      className={`matrix-cell ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isSameTable ? 'same-table' : ''} ${isColBoundary ? 'col-boundary' : ''}`}
                      style={{
                        backgroundColor: typeInfo?.color || 'transparent',
                      }}
                      onClick={() => handleCellClick(rowGuest.id, colGuest.id)}
                      title={isDisabled ? '' : `${rowGuest.name} → ${colGuest.name}`}
                    >
                      {isDisabled ? '—' : typeInfo?.short || ''}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dropdown for selected cell */}
      {selectedCell && (
        <div className="cell-dropdown-overlay" onClick={() => setSelectedCell(null)}>
          <div className="cell-dropdown" onClick={(e) => e.stopPropagation()}>
            <h4>
              {event.guests.find((g) => g.id === selectedCell.from)?.name}
              {' ↔ '}
              {event.guests.find((g) => g.id === selectedCell.to)?.name}
            </h4>
            <div className="dropdown-options">
              {RELATIONSHIP_TYPES.map((type) => (
                <button
                  key={type.value || 'none'}
                  className="dropdown-option"
                  style={{ borderLeftColor: type.color }}
                  onClick={() => setRelationship(selectedCell.from, selectedCell.to, type.value)}
                >
                  <span
                    className="option-indicator"
                    style={{ backgroundColor: type.color }}
                  >
                    {type.short}
                  </span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {confirmedGuests.length === 0 && (
        <div className="matrix-empty">
          <p>No confirmed guests yet.</p>
          <p>Add guests to start managing relationships.</p>
        </div>
      )}
    </div>
  );
}
