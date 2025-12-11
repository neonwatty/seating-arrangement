import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useIsMobile } from '../hooks/useResponsive';
import './GridControls.css';

export function GridControls() {
  const {
    canvasPrefs,
    toggleGrid,
    toggleSnapToGrid,
    toggleAlignmentGuides,
    togglePanMode,
    setGridSize,
  } = useStore();
  const isMobile = useIsMobile();

  const [showGridSizeDropdown, setShowGridSizeDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowGridSizeDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Render mobile menu (shown at 480px and below)
  if (isMobile) {
    return (
      <div className="grid-controls-mobile" ref={mobileMenuRef}>
        <button
          className={`grid-control-btn mobile-menu-trigger ${showMobileMenu ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Grid options"
          aria-expanded={showMobileMenu}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M20 3H4c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM9 19H5v-4h4v4zm0-6H5V9h4v4zm0-6H5V5h4v2zm6 12h-4v-4h4v4zm0-6h-4V9h4v4zm0-6h-4V5h4v2zm4 12h-4v-4h4v4zm0-6h-4V9h4v4zm0-6h-4V5h4v2z"
            />
          </svg>
        </button>
        {showMobileMenu && (
          <div className="mobile-grid-menu">
            <div className="mobile-menu-header">Grid Options</div>
            <button
              className={`mobile-menu-item ${canvasPrefs.showGrid ? 'active' : ''}`}
              onClick={() => {
                toggleGrid();
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M20 3H4c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM9 19H5v-4h4v4zm0-6H5V9h4v4zm0-6H5V5h4v2zm6 12h-4v-4h4v4zm0-6h-4V9h4v4zm0-6h-4V5h4v2zm4 12h-4v-4h4v4zm0-6h-4V9h4v4zm0-6h-4V5h4v2z"
                />
              </svg>
              <span>Show Grid</span>
              {canvasPrefs.showGrid && <span className="checkmark">✓</span>}
            </button>
            <button
              className={`mobile-menu-item ${canvasPrefs.snapToGrid ? 'active' : ''}`}
              onClick={() => {
                toggleSnapToGrid();
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"
                />
              </svg>
              <span>Snap to Grid</span>
              {canvasPrefs.snapToGrid && <span className="checkmark">✓</span>}
            </button>
            <button
              className={`mobile-menu-item ${canvasPrefs.showAlignmentGuides ? 'active' : ''}`}
              onClick={() => {
                toggleAlignmentGuides();
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M11 2v4h2V2h-2zm0 16v4h2v-4h-2zM2 11v2h4v-2H2zm16 0v2h4v-2h-4zm-7 1a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"
                />
              </svg>
              <span>Alignment Guides</span>
              {canvasPrefs.showAlignmentGuides && <span className="checkmark">✓</span>}
            </button>
            <div className="mobile-menu-divider" />
            <button
              className={`mobile-menu-item ${canvasPrefs.panMode ? 'active' : ''}`}
              onClick={() => {
                togglePanMode();
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"
                />
              </svg>
              <span>Pan Mode (1-finger)</span>
              {canvasPrefs.panMode && <span className="checkmark">✓</span>}
            </button>
            <div className="mobile-menu-divider" />
            <div className="mobile-menu-label">Grid Size</div>
            <div className="mobile-grid-sizes">
              {([20, 40, 80] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setGridSize(size);
                  }}
                  className={`mobile-size-option ${canvasPrefs.gridSize === size ? 'selected' : ''}`}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="grid-controls">
      <span className="grid-controls-label">Grid</span>
      {/* Grid visibility toggle */}
      <button
        className={`grid-control-btn has-tooltip ${canvasPrefs.showGrid ? 'active' : ''}`}
        onClick={toggleGrid}
        aria-label={canvasPrefs.showGrid ? 'Hide grid' : 'Show grid'}
        aria-pressed={canvasPrefs.showGrid}
        data-tooltip={canvasPrefs.showGrid ? 'Hide Grid' : 'Show Grid'}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M20 3H4c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM9 19H5v-4h4v4zm0-6H5V9h4v4zm0-6H5V5h4v2zm6 12h-4v-4h4v4zm0-6h-4V9h4v4zm0-6h-4V5h4v2zm4 12h-4v-4h4v4zm0-6h-4V9h4v4zm0-6h-4V5h4v2z"
          />
        </svg>
      </button>

      {/* Snap to grid toggle */}
      <button
        className={`grid-control-btn has-tooltip ${canvasPrefs.snapToGrid ? 'active' : ''}`}
        onClick={toggleSnapToGrid}
        aria-label={canvasPrefs.snapToGrid ? 'Disable snap to grid' : 'Enable snap to grid'}
        aria-pressed={canvasPrefs.snapToGrid}
        data-tooltip={canvasPrefs.snapToGrid ? 'Snap: On' : 'Snap: Off'}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"
          />
        </svg>
      </button>

      {/* Alignment guides toggle */}
      <button
        className={`grid-control-btn has-tooltip ${canvasPrefs.showAlignmentGuides ? 'active' : ''}`}
        onClick={toggleAlignmentGuides}
        aria-label={canvasPrefs.showAlignmentGuides ? 'Disable alignment guides' : 'Enable alignment guides'}
        aria-pressed={canvasPrefs.showAlignmentGuides}
        data-tooltip={canvasPrefs.showAlignmentGuides ? 'Guides: On' : 'Guides: Off'}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M11 2v4h2V2h-2zm0 16v4h2v-4h-2zM2 11v2h4v-2H2zm16 0v2h4v-2h-4zm-7 1a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"
          />
        </svg>
      </button>

      {/* Grid size dropdown */}
      <div className="grid-size-dropdown" ref={dropdownRef}>
        <button
          className="grid-control-btn grid-size-btn has-tooltip"
          onClick={() => setShowGridSizeDropdown(!showGridSizeDropdown)}
          aria-label={`Grid size: ${canvasPrefs.gridSize}px`}
          aria-expanded={showGridSizeDropdown}
          aria-haspopup="listbox"
          data-tooltip="Grid Size"
        >
          <span className="grid-size-value">{canvasPrefs.gridSize}</span>
        </button>
        {showGridSizeDropdown && (
          <div
            className="grid-size-menu"
            role="listbox"
            aria-label="Grid size options"
          >
            {([20, 40, 80] as const).map((size) => (
              <button
                key={size}
                onClick={() => {
                  setGridSize(size);
                  setShowGridSizeDropdown(false);
                }}
                className={`grid-size-option ${canvasPrefs.gridSize === size ? 'selected' : ''}`}
                role="option"
                aria-selected={canvasPrefs.gridSize === size}
              >
                {size}px
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
