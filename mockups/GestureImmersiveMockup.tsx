import { useState, useRef, useEffect } from 'react';
import './GestureImmersiveMockup.css';

type Variant = 'edge-swipe' | 'tap-toggle';

export function GestureImmersiveMockup() {
  const [variant, setVariant] = useState<Variant>('edge-swipe');
  const [topBarVisible, setTopBarVisible] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [guestPanelVisible, setGuestPanelVisible] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [lastGesture, setLastGesture] = useState<string | null>(null);

  // Touch tracking for swipe detection
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Use document-level touch handlers in fullscreen mode
  useEffect(() => {
    if (!fullscreen) return;

    const handleDocTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    };

    const handleDocTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const deltaY = touchEndY - touchStartY.current;
      const deltaX = touchEndX - touchStartX.current;

      // Ignore touches that started on controls (top 70px)
      if (touchStartY.current < 70) {
        return;
      }

      const minSwipe = 50;
      const isVertical = Math.abs(deltaY) > Math.abs(deltaX);

      if (variant === 'edge-swipe') {
        if (isVertical) {
          if (deltaY > minSwipe) {
            setLastGesture('SWIPE DOWN - Top Bar!');
            setTopBarVisible(true);
            setTimeout(() => setLastGesture(null), 1500);
            return;
          }
          if (deltaY < -minSwipe) {
            setLastGesture('SWIPE UP - Bottom Sheet!');
            setBottomSheetVisible(true);
            setTimeout(() => setLastGesture(null), 1500);
            return;
          }
        } else {
          if (deltaX < -minSwipe) {
            setLastGesture('SWIPE LEFT - Guest Panel!');
            setGuestPanelVisible(true);
            setTimeout(() => setLastGesture(null), 1500);
            return;
          }
        }
      } else if (variant === 'tap-toggle') {
        if (Math.abs(deltaY) < 10 && Math.abs(deltaX) < 10) {
          setLastGesture('TAP - Toggle UI!');
          setTopBarVisible(v => !v);
          setBottomSheetVisible(v => !v);
          setTimeout(() => setLastGesture(null), 1500);
        }
      }
    };

    document.addEventListener('touchstart', handleDocTouchStart, { passive: true });
    document.addEventListener('touchend', handleDocTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleDocTouchStart);
      document.removeEventListener('touchend', handleDocTouchEnd);
    };
  }, [fullscreen, variant, topBarVisible, bottomSheetVisible]);

  // Reset UI state when changing variant
  const handleVariantChange = (newVariant: Variant) => {
    setVariant(newVariant);
    setTopBarVisible(false);
    setBottomSheetVisible(false);
    setGuestPanelVisible(false);
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  // Show gesture feedback
  const showGestureFeedback = (gesture: string) => {
    setLastGesture(gesture);
    setTimeout(() => setLastGesture(null), 1500);
  };

  // Handle touch end for swipe detection
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaY = touchEndY - touchStartY.current;
    const deltaX = touchEndX - touchStartX.current;

    // Minimum swipe distance
    const minSwipe = 50;

    // Check if horizontal or vertical swipe
    const isVertical = Math.abs(deltaY) > Math.abs(deltaX);

    if (variant === 'edge-swipe') {
      if (isVertical) {
        // Swipe DOWN anywhere = show top bar
        if (deltaY > minSwipe) {
          showGestureFeedback('SWIPE DOWN - Top Bar!');
          setTopBarVisible(true);
          return;
        }

        // Swipe UP anywhere = show bottom sheet
        if (deltaY < -minSwipe) {
          showGestureFeedback('SWIPE UP - Bottom Sheet!');
          setBottomSheetVisible(true);
          return;
        }
      } else {
        // Swipe LEFT = show guest panel
        if (deltaX < -minSwipe) {
          showGestureFeedback('SWIPE LEFT - Guest Panel!');
          setGuestPanelVisible(true);
          return;
        }
      }
    } else if (variant === 'tap-toggle') {
      // For tap toggle, check if it was a tap (small movement)
      if (Math.abs(deltaY) < 10 && Math.abs(deltaX) < 10) {
        showGestureFeedback('TAP - Toggle UI!');
        const isAnyVisible = topBarVisible || bottomSheetVisible;
        setTopBarVisible(!isAnyVisible);
        setBottomSheetVisible(!isAnyVisible);
      }
    }
  };

  // Handle canvas tap for tap-toggle variant
  const handleCanvasTap = () => {
    if (variant === 'tap-toggle') {
      const isAnyVisible = topBarVisible || bottomSheetVisible;
      setTopBarVisible(!isAnyVisible);
      setBottomSheetVisible(!isAnyVisible);
    }
  };

  // Handle corner indicator tap
  const handleCornerTap = () => {
    setTopBarVisible(true);
    setBottomSheetVisible(true);
  };

  // Close all overlays
  const closeAll = () => {
    setTopBarVisible(false);
    setBottomSheetVisible(false);
    setGuestPanelVisible(false);
  };

  // Onboarding steps
  const onboardingSteps = variant === 'edge-swipe'
    ? [
        { icon: '↓', title: 'Swipe down from top', desc: 'Reveal navigation bar' },
        { icon: '↑', title: 'Swipe up from bottom', desc: 'Open control panel' },
        { icon: '←', title: 'Swipe from right edge', desc: 'Open guest list' },
        { icon: '●', title: 'Tap corner dot', desc: 'Show all controls' },
      ]
    : [
        { icon: '👆', title: 'Tap anywhere', desc: 'Toggle controls on/off' },
        { icon: '←', title: 'Swipe from right edge', desc: 'Open guest list' },
        { icon: '●', title: 'Tap corner dot', desc: 'Same as tap' },
      ];

  // Fullscreen mode - renders directly without phone frame
  if (fullscreen) {
    return (
      <div className="fullscreen-mockup">
        {/* Floating controls */}
        <div className="fullscreen-controls">
          <select
            value={variant}
            onChange={(e) => handleVariantChange(e.target.value as Variant)}
            className="fullscreen-variant-select"
          >
            <option value="edge-swipe">Edge Swipe</option>
            <option value="tap-toggle">Tap Toggle</option>
          </select>
          <button className="fullscreen-exit" onClick={() => setFullscreen(false)}>
            Exit
          </button>
        </div>


        {/* Canvas Area - Full screen */}
        <div
          ref={canvasRef}
          className="fullscreen-canvas"
        >
          {/* Canvas instructions */}
          <div className="canvas-instructions">
            {variant === 'edge-swipe' ? (
              <>
                <p><strong>SWIPE HERE TO TEST</strong></p>
                <p>↓ Swipe DOWN = Top bar</p>
                <p>↑ Swipe UP = Bottom sheet</p>
                <p>← Swipe LEFT = Guest panel</p>
              </>
            ) : (
              <>
                <p><strong>TAP HERE TO TEST</strong></p>
                <p>Tap toggles top bar + bottom sheet</p>
              </>
            )}
          </div>

          {/* Mock tables */}
          <div className="mock-table" style={{ top: '55%', left: '30%' }}>T1</div>
          <div className="mock-table" style={{ top: '55%', left: '70%' }}>T2</div>
          <div className="mock-table rect" style={{ top: '70%', left: '50%' }}>T3</div>
          <div className="mock-table" style={{ top: '85%', left: '30%' }}>T4</div>
          <div className="mock-table" style={{ top: '85%', left: '70%' }}>T5</div>

          {/* Gesture feedback */}
          {lastGesture && (
            <div className="gesture-feedback">
              {lastGesture}
            </div>
          )}

          {/* Edge indicators */}
          {variant === 'edge-swipe' && (
            <>
              <div className="edge-hint top" />
              <div className="edge-hint bottom" />
              <div className="edge-hint right" />
            </>
          )}
        </div>

        {/* Transient Top Bar */}
        <div className={`transient-top-bar ${topBarVisible ? 'visible' : ''}`}>
          <button className="back-btn" onClick={closeAll}>←</button>
          <span className="event-name">Sarah & John's Wedding</span>
          <button className="menu-btn" onClick={() => setBottomSheetVisible(true)}>⋮</button>
        </div>

        {/* Bottom Control Sheet */}
        {bottomSheetVisible && (
          <>
            <div className="sheet-backdrop" onClick={closeAll} />
            <div className="bottom-sheet">
              <div className="sheet-handle" />
              <div className="sheet-content">
                <div className="sheet-section">
                  <h4>Views</h4>
                  <div className="sheet-buttons">
                    <button className="sheet-btn active"><span>🎨</span> Canvas</button>
                    <button className="sheet-btn"><span>👥</span> Guests</button>
                    <button className="sheet-btn"><span>📊</span> Dashboard</button>
                  </div>
                </div>
                <div className="sheet-section">
                  <h4>Canvas Tools</h4>
                  <div className="sheet-buttons">
                    <button className="sheet-btn"><span>🔲</span> Grid</button>
                    <button className="sheet-btn"><span>🧲</span> Snap</button>
                    <button className="sheet-btn"><span>📐</span> Guides</button>
                    <button className="sheet-btn"><span>🔗</span> Relations</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Guest Panel */}
        {guestPanelVisible && (
          <>
            <div className="panel-backdrop" onClick={() => setGuestPanelVisible(false)} />
            <div className="guest-panel">
              <div className="panel-header">
                <h3>Guests</h3>
                <button onClick={() => setGuestPanelVisible(false)}>×</button>
              </div>
              <div className="panel-content">
                {['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown'].map((name, i) => (
                  <div key={i} className="guest-item">
                    <div className="guest-avatar">{name.split(' ').map(n => n[0]).join('')}</div>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* FAB */}
        <div className={`immersive-fab ${fabExpanded ? 'expanded' : ''}`}>
          {fabExpanded && (
            <div className="fab-menu">
              <button onClick={() => setFabExpanded(false)}>○ Round Table</button>
              <button onClick={() => setFabExpanded(false)}>▭ Rectangle</button>
            </div>
          )}
          <button className="fab-button" onClick={() => setFabExpanded(!fabExpanded)}>
            {fabExpanded ? '×' : '+'}
          </button>
        </div>

        {/* Corner Indicator */}
        <button className="corner-indicator" onClick={handleCornerTap}>
          <span className="indicator-dot" />
        </button>

        {/* Onboarding */}
        {showOnboarding && (
          <div className="onboarding-overlay">
            <div className="onboarding-card">
              <div className="onboarding-icon">{onboardingSteps[onboardingStep].icon}</div>
              <h3>{onboardingSteps[onboardingStep].title}</h3>
              <p>{onboardingSteps[onboardingStep].desc}</p>
              <div className="onboarding-dots">
                {onboardingSteps.map((_, i) => (
                  <span key={i} className={`dot ${i === onboardingStep ? 'active' : ''}`} />
                ))}
              </div>
              <div className="onboarding-actions">
                {onboardingStep < onboardingSteps.length - 1 ? (
                  <button onClick={() => setOnboardingStep(s => s + 1)}>Next</button>
                ) : (
                  <button onClick={() => setShowOnboarding(false)}>Got it!</button>
                )}
                <button className="skip" onClick={() => setShowOnboarding(false)}>Skip</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="gesture-mockup">
      {/* Variant Selector */}
      <div className="variant-selector">
        <button
          className={`variant-btn ${variant === 'edge-swipe' ? 'active' : ''}`}
          onClick={() => handleVariantChange('edge-swipe')}
        >
          Variant A: Edge Swipe
        </button>
        <button
          className={`variant-btn ${variant === 'tap-toggle' ? 'active' : ''}`}
          onClick={() => handleVariantChange('tap-toggle')}
        >
          Variant B: Tap Toggle
        </button>
        <button
          className="variant-btn fullscreen-btn"
          onClick={() => setFullscreen(true)}
        >
          ⛶ Fullscreen
        </button>
      </div>

      {/* Phone Frame */}
      <div className="phone-frame">
        <div className="phone-notch" />
        <div className="phone-screen">
          {/* Canvas Area - Full screen */}
          <div
            ref={canvasRef}
            className="immersive-canvas"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleCanvasTap}
          >
            {/* Mock tables */}
            <div className="mock-table" style={{ top: '20%', left: '30%' }}>T1</div>
            <div className="mock-table" style={{ top: '20%', left: '70%' }}>T2</div>
            <div className="mock-table rect" style={{ top: '50%', left: '50%' }}>T3</div>
            <div className="mock-table" style={{ top: '75%', left: '30%' }}>T4</div>
            <div className="mock-table" style={{ top: '75%', left: '70%' }}>T5</div>

            {/* Edge indicators (subtle hints) */}
            {variant === 'edge-swipe' && (
              <>
                <div className="edge-hint top" />
                <div className="edge-hint bottom" />
                <div className="edge-hint right" />
              </>
            )}
          </div>

          {/* Transient Top Bar */}
          <div className={`transient-top-bar ${topBarVisible ? 'visible' : ''}`}>
            <button className="back-btn" onClick={closeAll}>←</button>
            <span className="event-name">Sarah & John's Wedding</span>
            <button className="menu-btn" onClick={() => setBottomSheetVisible(true)}>⋮</button>
          </div>

          {/* Bottom Control Sheet */}
          {bottomSheetVisible && (
            <>
              <div className="sheet-backdrop" onClick={closeAll} />
              <div className="bottom-sheet">
                <div className="sheet-handle" />
                <div className="sheet-content">
                  <div className="sheet-section">
                    <h4>Views</h4>
                    <div className="sheet-buttons">
                      <button className="sheet-btn active">
                        <span>🎨</span> Canvas
                      </button>
                      <button className="sheet-btn">
                        <span>👥</span> Guests
                      </button>
                      <button className="sheet-btn">
                        <span>📊</span> Dashboard
                      </button>
                    </div>
                  </div>
                  <div className="sheet-section">
                    <h4>Canvas Tools</h4>
                    <div className="sheet-buttons">
                      <button className="sheet-btn">
                        <span>🔲</span> Grid
                      </button>
                      <button className="sheet-btn">
                        <span>🧲</span> Snap
                      </button>
                      <button className="sheet-btn">
                        <span>📐</span> Guides
                      </button>
                      <button className="sheet-btn">
                        <span>🔗</span> Relations
                      </button>
                    </div>
                  </div>
                  <div className="sheet-section">
                    <h4>Settings</h4>
                    <div className="sheet-buttons">
                      <button className="sheet-btn">
                        <span>🌙</span> Theme
                      </button>
                      <button className="sheet-btn">
                        <span>❓</span> Help
                      </button>
                      <button className="sheet-btn">
                        <span>⚙️</span> Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Guest Panel (slides from right) */}
          {guestPanelVisible && (
            <>
              <div className="panel-backdrop" onClick={() => setGuestPanelVisible(false)} />
              <div className="guest-panel">
                <div className="panel-header">
                  <h3>Guests</h3>
                  <button onClick={() => setGuestPanelVisible(false)}>×</button>
                </div>
                <div className="panel-content">
                  {['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown'].map((name, i) => (
                    <div key={i} className="guest-item">
                      <div className="guest-avatar">{name.split(' ').map(n => n[0]).join('')}</div>
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* FAB */}
          <div className={`immersive-fab ${fabExpanded ? 'expanded' : ''}`}>
            {fabExpanded && (
              <div className="fab-menu">
                <button onClick={() => setFabExpanded(false)}>○ Round Table</button>
                <button onClick={() => setFabExpanded(false)}>▭ Rectangle</button>
                <button onClick={() => setFabExpanded(false)}>□ Square</button>
              </div>
            )}
            <button
              className="fab-button"
              onClick={() => setFabExpanded(!fabExpanded)}
            >
              {fabExpanded ? '×' : '+'}
            </button>
          </div>

          {/* Corner Indicator */}
          <button
            className="corner-indicator"
            onClick={handleCornerTap}
            title="Tap to show controls"
          >
            <span className="indicator-dot" />
          </button>

          {/* Onboarding Overlay */}
          {showOnboarding && (
            <div className="onboarding-overlay">
              <div className="onboarding-card">
                <div className="onboarding-icon">
                  {onboardingSteps[onboardingStep].icon}
                </div>
                <h3>{onboardingSteps[onboardingStep].title}</h3>
                <p>{onboardingSteps[onboardingStep].desc}</p>
                <div className="onboarding-dots">
                  {onboardingSteps.map((_, i) => (
                    <span key={i} className={`dot ${i === onboardingStep ? 'active' : ''}`} />
                  ))}
                </div>
                <div className="onboarding-actions">
                  {onboardingStep < onboardingSteps.length - 1 ? (
                    <button onClick={() => setOnboardingStep(s => s + 1)}>Next</button>
                  ) : (
                    <button onClick={() => setShowOnboarding(false)}>Got it!</button>
                  )}
                  <button className="skip" onClick={() => setShowOnboarding(false)}>Skip</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description Panel */}
      <div className="mockup-description">
        <h2>
          {variant === 'edge-swipe' ? 'Edge Swipe Pattern' : 'Tap Toggle Pattern'}
          <span className="mockup-badge">MOCKUP</span>
        </h2>

        {variant === 'edge-swipe' ? (
          <ul>
            <li><strong>Swipe DOWN from top:</strong> Reveals navigation bar</li>
            <li><strong>Swipe UP from bottom:</strong> Opens control panel</li>
            <li><strong>Swipe LEFT from right:</strong> Opens guest list</li>
            <li><strong>Corner dot:</strong> Tap to show all UI</li>
            <li><strong>100% canvas:</strong> No persistent chrome</li>
          </ul>
        ) : (
          <ul>
            <li><strong>Tap canvas:</strong> Toggles top bar + bottom sheet</li>
            <li><strong>Swipe from right:</strong> Opens guest list</li>
            <li><strong>Simpler model:</strong> One gesture to remember</li>
            <li><strong>Corner dot:</strong> Fallback for accessibility</li>
            <li><strong>100% canvas:</strong> No persistent chrome</li>
          </ul>
        )}

        <div className="mockup-controls">
          <button onClick={() => setShowOnboarding(true)}>
            Show Onboarding
          </button>
          <button onClick={closeAll}>
            Reset UI
          </button>
        </div>

        <div className="mockup-note">
          <strong>Test on mobile:</strong> Use touch gestures to interact with the mockup.
          On desktop, use the variant buttons and click areas to simulate.
        </div>
      </div>
    </div>
  );
}

export default GestureImmersiveMockup;
