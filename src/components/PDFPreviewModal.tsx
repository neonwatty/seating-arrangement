import { useEffect, useRef, useState } from 'react';
import './PDFPreviewModal.css';

export interface PlaceCardOptions {
  includeTableName: boolean;
  includeDietary: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  title: string;
  onDownload: (options?: PlaceCardOptions) => void;
  isGenerating?: boolean;
  type: 'table' | 'place';
  onOptionsChange?: (options: PlaceCardOptions) => void;
}

const defaultOptions: PlaceCardOptions = {
  includeTableName: true,
  includeDietary: true,
  fontSize: 'medium',
};

export function PDFPreviewModal({
  isOpen,
  onClose,
  pdfUrl,
  title,
  onDownload,
  isGenerating = false,
  type,
  onOptionsChange,
}: PDFPreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [options, setOptions] = useState<PlaceCardOptions>(defaultOptions);
  const [showOptions, setShowOptions] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Clean up blob URL when modal closes
  useEffect(() => {
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Reset options when modal opens
  useEffect(() => {
    if (isOpen) {
      setOptions(defaultOptions);
      setShowOptions(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOptionChange = <K extends keyof PlaceCardOptions>(
    key: K,
    value: PlaceCardOptions[K]
  ) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    onOptionsChange?.(newOptions);
  };

  const handleDownload = () => {
    onDownload(type === 'place' ? options : undefined);
  };

  return (
    <div className="pdf-preview-overlay" onClick={handleOverlayClick}>
      <div className="pdf-preview-modal" ref={modalRef}>
        <div className="pdf-preview-header">
          <h2>{title}</h2>
          <div className="pdf-preview-actions">
            {type === 'place' && (
              <button
                className={`pdf-preview-btn options ${showOptions ? 'active' : ''}`}
                onClick={() => setShowOptions(!showOptions)}
                title="Customize options"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            )}
            <button
              className="pdf-preview-btn download"
              onClick={handleDownload}
              disabled={isGenerating || !pdfUrl}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>
            <button className="pdf-preview-btn close" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Options Panel for Place Cards */}
        {type === 'place' && showOptions && (
          <div className="pdf-options-panel">
            <div className="pdf-option-group">
              <label className="pdf-option-label">
                <input
                  type="checkbox"
                  checked={options.includeTableName}
                  onChange={(e) => handleOptionChange('includeTableName', e.target.checked)}
                />
                <span>Show table name</span>
              </label>
              <label className="pdf-option-label">
                <input
                  type="checkbox"
                  checked={options.includeDietary}
                  onChange={(e) => handleOptionChange('includeDietary', e.target.checked)}
                />
                <span>Show dietary icons</span>
              </label>
            </div>
            <div className="pdf-option-group">
              <span className="pdf-option-title">Font Size</span>
              <div className="pdf-font-size-options">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <label key={size} className="pdf-font-option">
                    <input
                      type="radio"
                      name="fontSize"
                      value={size}
                      checked={options.fontSize === size}
                      onChange={() => handleOptionChange('fontSize', size)}
                    />
                    <span className={`pdf-font-label pdf-font-${size}`}>
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <p className="pdf-options-note">
              Changes will apply when you download
            </p>
          </div>
        )}

        <div className="pdf-preview-content">
          {isGenerating ? (
            <div className="pdf-preview-loading">
              <div className="pdf-preview-spinner" />
              <p>Generating preview...</p>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="pdf-preview-iframe"
              title="PDF Preview"
            />
          ) : (
            <div className="pdf-preview-empty">
              <p>Unable to generate preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
