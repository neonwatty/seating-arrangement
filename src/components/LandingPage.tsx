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
          <h1 className="landing-logo">TableCraft</h1>
          <p className="landing-tagline">Perfect Seating, Happy Guests</p>
          <p className="landing-description">
            Plan your event seating with smart suggestions
            that keep friends together and conflicts apart
          </p>
          <button className="cta-button" onClick={onEnterApp}>
            Try the Demo
          </button>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h7v7h-7z" strokeDasharray="2 2" />
              </svg>
            </div>
            <h3>Drag & Drop Canvas</h3>
            <p>Arrange tables visually with intuitive controls</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="7" r="4" />
                <circle cx="17" cy="9" r="3" />
                <path d="M5 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              </svg>
            </div>
            <h3>Smart Groups</h3>
            <p>Organize guests by family, friends, or custom groups</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>
            <h3>Conflict Detection</h3>
            <p>Automatic warnings when incompatible guests are seated together</p>
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
          <p>Made for event planners</p>
          <div className="footer-meta">
            <UpdatesButton variant="landing" />
            <span className="version-tag">v{version}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
