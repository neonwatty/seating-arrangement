import './LandingPage.css';
import { version } from '../../package.json';
import { UpdatesButton } from './UpdatesPopup';

interface LandingPageProps {
  onEnterApp: () => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="beta-badge">Internal Beta</div>
          <h1 className="landing-logo">TableCraft</h1>
          <p className="landing-tagline">Event Seating Made Simple</p>
          <p className="landing-description">
            Drag-and-drop table arrangement with relationship-aware seating suggestions.
            Test build for internal feedback.
          </p>
          <button className="cta-button" onClick={onEnterApp}>
            Launch App
          </button>
        </section>

        {/* Testing Guidance Section */}
        <section className="testing-section">
          <h2 className="testing-header">What to Test</h2>
          <div className="testing-grid">
            <div className="testing-card">
              <h3>
                <span className="testing-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h7v7h-7z" strokeDasharray="2 2" />
                  </svg>
                </span>
                Canvas Interaction
              </h3>
              <ul className="testing-list">
                <li>Drag tables to rearrange</li>
                <li>Zoom and pan navigation</li>
                <li>Multi-select with Shift+click</li>
                <li>Grid snap and alignment</li>
              </ul>
            </div>
            <div className="testing-card">
              <h3>
                <span className="testing-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="7" r="4" />
                    <circle cx="17" cy="9" r="3" />
                    <path d="M5 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                  </svg>
                </span>
                Guest Management
              </h3>
              <ul className="testing-list">
                <li>Add/edit guest details</li>
                <li>Assign guests to tables</li>
                <li>Set relationships between guests</li>
                <li>Auto-optimize seating</li>
              </ul>
            </div>
            <div className="testing-card">
              <h3>
                <span className="testing-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <path d="M12 18h.01" />
                  </svg>
                </span>
                Cross-Platform
              </h3>
              <ul className="testing-list">
                <li>Touch gestures on mobile</li>
                <li>Responsive layout</li>
                <li>Dark mode toggle</li>
                <li>Data persistence</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Preview Section - Animated Demo */}
        <section className="preview-section">
          <div className="demo-container">
            {/* Unassigned guest that will be dragged */}
            <div className="demo-guest-chip">
              Alex
            </div>

            {/* Drag trail (dashed path) */}
            <svg className="demo-trail" viewBox="0 0 200 100" preserveAspectRatio="none">
              <path
                d="M 20 50 Q 100 50 180 50"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
            </svg>

            {/* Table with seats */}
            <div className="demo-table">
              <div className="demo-capacity">
                <span className="capacity-before">3</span>
                <span className="capacity-after">4</span>
                <span className="capacity-divider">/4</span>
              </div>

              {/* Seated guests - positioned on table perimeter */}
              <div className="demo-seat" style={{ top: '-12px', left: '50%', transform: 'translateX(-50%)' }}>
                <div className="demo-seated family" />
              </div>
              <div className="demo-seat" style={{ bottom: '-12px', left: '50%', transform: 'translateX(-50%)' }}>
                <div className="demo-seated friend" />
              </div>
              <div className="demo-seat" style={{ left: '-12px', top: '50%', transform: 'translateY(-50%)' }}>
                <div className="demo-seated colleague" />
              </div>
              {/* Empty seat that gets filled */}
              <div className="demo-seat" style={{ right: '-12px', top: '50%', transform: 'translateY(-50%)' }}>
                <div className="demo-seated new-guest" />
              </div>
            </div>

            {/* Success checkmark */}
            <div className="demo-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12l5 5L19 7" />
              </svg>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="footer-meta">
            <UpdatesButton variant="landing" />
            <span className="version-tag">v{version} beta</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
