# Phase 6.1: Animation Refinements

## Overview
Add smooth, professional animations throughout the app to enhance user experience.

**Estimated Time:** 8-12 hours

---

## Current State Analysis

### Existing Animation Infrastructure

**CSS Variables (index.css):**
- Duration: `--duration-micro: 0.08s`, `--duration-fast: 0.1s`, `--duration-normal: 0.15s`, `--duration-slow: 0.2s`
- Easing: `--ease-out`, `--ease-in-out`, `--ease-bounce`, `--ease-spring`

**Existing Keyframes:**
- `fadeIn`, `slideUp`, `slideDown`, `popIn`, `pulse`, `shake`, `spin`
- Touch-specific: `touchPulse`, `rippleExpand`, `longPressGrow`
- Component-specific: `selectedPulse`, `optimizedPulse`, `violationPulse`

**No animation libraries installed** - uses pure CSS animations.

**Recommendation:** Stay CSS-only. The existing infrastructure is comprehensive, and adding framer-motion/react-spring would add ~40KB to bundle size.

---

## Feature 1: Smooth Spring Animations for Drag Operations

**Complexity:** Medium (2-3 hours)

### Current Issues
- Table dragging sets `transition: none` making movement instant
- When drag ends, table snaps to final position without animation
- Guest drag overlay lacks spring physics on pickup/release

### Implementation

**Table.css - Add settling animation:**
```css
.table-component.settling {
  transition: transform var(--duration-normal) var(--ease-spring);
}

.table-component.dragging {
  animation: tableLift var(--duration-fast) var(--ease-spring) forwards;
}

@keyframes tableLift {
  0% { transform: scale(1); box-shadow: var(--shadow-lg); }
  100% { transform: scale(1.02); box-shadow: var(--shadow-xl); }
}
```

**Table.tsx - Track settling state:**
```typescript
const [isSettling, setIsSettling] = useState(false);

useEffect(() => {
  if (!isDragging && wasDraggingRef.current) {
    setIsSettling(true);
    const timer = setTimeout(() => setIsSettling(false), 150);
    return () => clearTimeout(timer);
  }
}, [isDragging]);
```

**CanvasGuest.css - Guest pickup/drop animations:**
```css
.canvas-guest.dragging .canvas-guest-circle {
  animation: guestPickup var(--duration-fast) var(--ease-spring) forwards;
}

@keyframes guestPickup {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1.1); }
}

.canvas-guest.dropping .canvas-guest-circle {
  animation: guestDrop var(--duration-normal) var(--ease-spring) forwards;
}

@keyframes guestDrop {
  0% { transform: scale(1.1); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
```

### Files to Modify
- `src/components/Table.tsx`
- `src/components/Table.css`
- `src/components/CanvasGuest.css`
- `src/components/Canvas.css`

---

## Feature 2: Subtle Hover States on All Interactive Elements

**Complexity:** Low-Medium (1-2 hours)

### Audit Findings
- Most buttons have hover transitions
- Missing: filter selects, constraint chips, table cards
- Inconsistent hover lift (`translateY(-1px)` vs `-2px`)

### Implementation

**index.css - Add standardized hover utilities:**
```css
.hover-lift {
  transition: transform var(--duration-fast) var(--ease-bounce),
              box-shadow var(--duration-fast) var(--ease-out);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.hover-scale {
  transition: transform var(--duration-fast) var(--ease-bounce);
}

.hover-scale:hover {
  transform: scale(1.02);
}

.hover-glow {
  transition: box-shadow var(--duration-fast) var(--ease-out);
}

.hover-glow:hover {
  box-shadow: var(--shadow-glow);
}
```

**Add missing hover states:**

```css
/* Sidebar.css */
.filter-select:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

/* OptimizeView.css */
.chip:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--shadow-sm);
}

.table-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### Files to Modify
- `src/index.css`
- `src/components/Sidebar.css`
- `src/components/OptimizeView.css`
- `src/components/MainToolbar.css`
- `src/components/GuestForm.css`

---

## Feature 3: Success Celebration Animation

**Complexity:** Medium-High (3-4 hours)

### Implementation

**Add to store (useStore.ts):**
```typescript
// AppState interface
showCelebration: boolean;
triggerCelebration: () => void;
dismissCelebration: () => void;
```

**New file: CelebrationOverlay.tsx**
```tsx
import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import './CelebrationOverlay.css';

export function CelebrationOverlay() {
  const { showCelebration, dismissCelebration } = useStore();

  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(dismissCelebration, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration, dismissCelebration]);

  if (!showCelebration) return null;

  return (
    <div className="celebration-overlay" onClick={dismissCelebration}>
      <div className="celebration-content">
        <div className="celebration-icon">✨</div>
        <div className="celebration-confetti">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}
            />
          ))}
        </div>
        <h2>Optimization Complete!</h2>
        <p>Your seating arrangement has been optimized</p>
      </div>
    </div>
  );
}
```

**New file: CelebrationOverlay.css**
```css
.celebration-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 9999;
  animation: overlayFade var(--duration-normal) var(--ease-out);
}

.celebration-content {
  text-align: center;
  padding: 2rem 3rem;
  background: var(--color-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  animation: celebrationBounce 0.5s var(--ease-spring);
  position: relative;
  overflow: hidden;
}

@keyframes celebrationBounce {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.celebration-icon {
  font-size: 4rem;
  animation: iconPop var(--duration-slow) var(--ease-spring) 0.2s both;
}

@keyframes iconPop {
  0% { transform: scale(0) rotate(-45deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--color-primary);
  border-radius: 2px;
  animation: confettiFall 2s ease-out var(--delay) forwards;
  opacity: 0;
}

@keyframes confettiFall {
  0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(200px) rotate(720deg); opacity: 0; }
}
```

**Trigger in OptimizeView.tsx:**
```typescript
const applyOptimization = () => {
  if (!result) return;
  result.assignments.forEach((tableId, guestId) => {
    assignGuestToTable(guestId, tableId);
  });
  setTimeout(() => triggerCelebration(), 300);
  setResult(null);
};
```

### Files to Create
- `src/components/CelebrationOverlay.tsx`
- `src/components/CelebrationOverlay.css`

### Files to Modify
- `src/store/useStore.ts`
- `src/components/OptimizeView.tsx`
- `src/App.tsx`

---

## Feature 4: Loading Skeleton States

**Complexity:** Medium (2-3 hours)

### Implementation

**New file: Skeleton.tsx**
```tsx
import './Skeleton.css';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ variant = 'text', width, height, className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={{ width, height }}
    />
  );
}

export function TableSkeleton() {
  return (
    <div className="table-skeleton">
      <Skeleton variant="circular" width={80} height={80} />
      <Skeleton variant="text" width={60} height={14} />
    </div>
  );
}

export function GuestChipSkeleton() {
  return (
    <div className="guest-chip-skeleton">
      <Skeleton variant="circular" width={36} height={36} />
      <div className="guest-info-skeleton">
        <Skeleton variant="text" width={100} height={14} />
        <Skeleton variant="text" width={60} height={12} />
      </div>
    </div>
  );
}
```

**New file: Skeleton.css**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 25%,
    var(--color-bg-hover) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-circular { border-radius: 50%; }
.skeleton-rectangular { border-radius: var(--radius-md); }
```

**OptimizeView.css - Enhanced loading state:**
```css
.optimization-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.optimization-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.optimization-progress {
  width: 200px;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin-top: 1rem;
  overflow: hidden;
}

.progress-bar {
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  animation: progressIndeterminate 1.5s ease-in-out infinite;
}

@keyframes progressIndeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}
```

### Files to Create
- `src/components/Skeleton.tsx`
- `src/components/Skeleton.css`

### Files to Modify
- `src/components/OptimizeView.tsx`
- `src/components/OptimizeView.css`

---

## Implementation Steps

1. **Drag Animations** - Add settling state to Table, enhance CanvasGuest
2. **Hover States** - Audit all components, add utility classes, standardize
3. **Celebration** - Add store state, create overlay component, trigger on optimize
4. **Skeletons** - Create reusable skeleton components, add to optimize loading

---

## Testing Considerations

1. **E2E Tests** (`e2e/animations.spec.ts`):
   - Verify drag overlay appears/disappears
   - Check celebration shows after optimization
   - Ensure animations respect `prefers-reduced-motion`

2. **Performance:**
   - Measure frame rate during drag operations
   - Test on low-end mobile devices
   - Ensure GPU acceleration via `transform` properties

---

## Complexity Summary

| Feature | Complexity | Time |
|---------|-----------|------|
| Spring drag animations | Medium | 2-3 hours |
| Hover state audit | Low-Medium | 1-2 hours |
| Celebration animation | Medium-High | 3-4 hours |
| Loading skeletons | Medium | 2-3 hours |

**Total: 8-12 hours**
