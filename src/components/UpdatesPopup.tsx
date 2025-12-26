import { useState } from 'react';
import { createPortal } from 'react-dom';
import { version } from '../../package.json';
import updates from '../updates.json';
import { EmailCaptureModal } from './EmailCaptureModal';
import {
  shouldShowEmailCapture,
  markAsSubscribed,
  trackDismissal,
} from '../utils/emailCaptureManager';
import './UpdatesPopup.css';

interface UpdatesPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpdatesPopup({ isOpen, onClose }: UpdatesPopupProps) {
  const [showEmailCapture, setShowEmailCapture] = useState(false);

  // Check if user has already subscribed (don't show link if so)
  const canShowEmailLink = shouldShowEmailCapture('guestMilestone') ||
                           shouldShowEmailCapture('optimizerSuccess') ||
                           shouldShowEmailCapture('exportAttempt');

  const handleEmailCaptureClose = (subscribed = false) => {
    if (subscribed) {
      markAsSubscribed();
    } else {
      trackDismissal();
    }
    setShowEmailCapture(false);
  };

  if (!isOpen) return null;

  // Use portal to render at document body level for proper centering
  return createPortal(
    <>
      <div className="updates-overlay" onClick={onClose}>
        <div className="updates-popup" onClick={(e) => e.stopPropagation()}>
          <div className="updates-header">
            <h2>What's New</h2>
            <button className="updates-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          <div className="updates-content">
            {updates.map((update) => (
              <div key={update.version} className="update-section">
                <span className="update-version">v{update.version}</span>
                <ul className="update-list">
                  {update.highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="updates-footer">
            <span className="current-version">Current version: v{version}</span>
            {canShowEmailLink && (
              <button
                className="updates-subscribe-link"
                onClick={() => setShowEmailCapture(true)}
              >
                Get notified of new updates
              </button>
            )}
          </div>
        </div>
      </div>
      {showEmailCapture && (
        <EmailCaptureModal
          onClose={() => handleEmailCaptureClose(false)}
          onSuccess={() => handleEmailCaptureClose(true)}
          source="value_moment"
        />
      )}
    </>,
    document.body
  );
}

interface UpdatesButtonProps {
  variant?: 'landing' | 'header';
}

export function UpdatesButton({ variant = 'header' }: UpdatesButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={`updates-btn updates-btn--${variant}`}
        onClick={() => setIsOpen(true)}
        title="What's New"
      >
        {variant === 'landing' ? "What's New" : '✨'}
      </button>
      <UpdatesPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
