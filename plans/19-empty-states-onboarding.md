# Phase 6.2: Empty States & Onboarding

## Overview
Add illustrated empty states and a guided onboarding experience for first-time users.

**Estimated Time:** 15-20 hours

---

## Current State Analysis

### Existing Empty States

| Location | Current State |
|----------|---------------|
| Canvas.tsx | Basic text: "Welcome to TableCraft!" |
| DashboardView.tsx | "No tables created yet." + button |
| Sidebar.tsx | "No guests match your filters" in dashed box |
| GuestManagementView.tsx | "No guests found" text |
| RelationshipMatrix.tsx | "No confirmed guests yet." |

### Missing Features
- No tutorial overlay system
- No contextual tips/tooltips
- No "Getting Started" checklist
- No tutorial progress state
- No first-time user detection

---

## Empty State Scenarios

| View | Scenario | Action |
|------|----------|--------|
| Canvas | No tables, no guests | SVG illustration + "Create your first table" |
| Canvas | Tables exist, no guests | "Add guests to get started" prompt |
| Canvas | Guests exist, no tables | "Add tables to seat your guests" |
| Sidebar | Zero guests total | Illustration + "Add your first guest" |
| Dashboard | New event | Welcome state with checklist |
| Guest Management | No guests | Illustration + import option |
| Relationship Matrix | No guests | Illustration explaining feature |

---

## New File Structure

```
src/components/
├── onboarding/
│   ├── OnboardingProvider.tsx
│   ├── TutorialOverlay.tsx
│   ├── TutorialStep.tsx
│   ├── ContextualTip.tsx
│   ├── GettingStartedChecklist.tsx
│   ├── OnboardingStyles.css
│   └── index.ts
├── empty-states/
│   ├── EmptyStateIllustrations.tsx
│   ├── EmptyState.tsx
│   ├── EmptyState.css
│   └── index.ts
```

---

## State Management

### Add to useStore.ts

```typescript
interface OnboardingState {
  hasSeenTutorial: boolean;
  tutorialStep: number | null;  // null = not in tutorial
  dismissedTips: string[];
  completedChecklist: string[];
}

// Actions
startTutorial: () => void;
nextTutorialStep: () => void;
skipTutorial: () => void;
completeTutorial: () => void;
dismissTip: (tipId: string) => void;
completeChecklistItem: (itemId: string) => void;
resetOnboarding: () => void;  // For testing
```

Persist under existing localStorage middleware.

---

## Tutorial Flow Design

### 5-Step First-Time User Tutorial

| Step | Focus | Highlight | Wait For |
|------|-------|-----------|----------|
| 1 | Welcome | Start button | Click |
| 2 | Canvas Introduction | Canvas area | Continue |
| 3 | Add a Table | Add Table dropdown | Table created |
| 4 | Guest Sidebar | Sidebar toggle | Sidebar open |
| 5 | Drag to Assign | Guest chips | First assignment |

**Features:**
- Skip button always visible
- Progress dots shown
- Spotlight effect on highlighted elements
- Auto-advance after required actions

### TutorialOverlay.tsx

```tsx
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to TableCraft!',
    description: "Let's set up your first event in just a few steps.",
    highlightSelector: null,
    position: 'center',
  },
  {
    id: 'canvas',
    title: 'Your Floor Plan Canvas',
    description: 'This is where you arrange tables. Drag them to position.',
    highlightSelector: '.canvas-container',
    position: 'right',
  },
  {
    id: 'add-table',
    title: 'Add Your First Table',
    description: 'Click here to add a table to your floor plan.',
    highlightSelector: '.add-table-dropdown',
    position: 'bottom',
    waitFor: 'tableAdded',
  },
  {
    id: 'sidebar',
    title: 'Guest Panel',
    description: 'Open this panel to see and manage your guests.',
    highlightSelector: '.sidebar-toggle',
    position: 'left',
    waitFor: 'sidebarOpen',
  },
  {
    id: 'assign',
    title: 'Assign Guests',
    description: 'Drag guests from here onto tables to assign seats.',
    highlightSelector: '.guest-chip',
    position: 'left',
    waitFor: 'guestAssigned',
  },
];
```

---

## Contextual Tips System

### Tips Configuration

| Tip ID | Location | Trigger | Content |
|--------|----------|---------|---------|
| `tip-zoom` | Canvas toolbar | First canvas visit | "Scroll to pan, Cmd+scroll to zoom" |
| `tip-grid` | Grid controls | First hover | "Enable grid for precise placement" |
| `tip-relationships` | Relationship button | First click | "Define who sits together or apart" |
| `tip-optimize` | Optimize button | 5+ guests | "Let AI arrange guests based on relationships" |
| `tip-search` | Canvas | 10+ tables | "Press Cmd+F to find guests" |
| `tip-shortcuts` | Any view | After 5 actions | "Press ? for keyboard shortcuts" |

### ContextualTip.tsx

```tsx
interface ContextualTipProps {
  tipId: string;
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function ContextualTip({ tipId, children, content, position = 'top' }: ContextualTipProps) {
  const { dismissedTips, dismissTip } = useStore();
  const [isVisible, setIsVisible] = useState(false);

  if (dismissedTips.includes(tipId)) {
    return <>{children}</>;
  }

  return (
    <div className="tip-anchor" onMouseEnter={() => setIsVisible(true)}>
      {children}
      {isVisible && (
        <div className={`contextual-tip tip-${position}`}>
          <p>{content}</p>
          <button onClick={() => dismissTip(tipId)}>Got it</button>
        </div>
      )}
    </div>
  );
}
```

---

## Getting Started Checklist

### Dashboard Widget

```
┌─────────────────────────────────────┐
│ Getting Started                     │
├─────────────────────────────────────┤
│ ✅ Name your event                  │
│ ⬜ Add your first table      [→ Go] │
│ ⬜ Add guests                [→ Go] │
│ ⬜ Define relationships      [→ Go] │
│ ⬜ Assign guests to tables   [→ Go] │
├─────────────────────────────────────┤
│ 1 of 5 complete                     │
│ [Dismiss checklist]                 │
└─────────────────────────────────────┘
```

### Auto-Detection Logic

```typescript
const checklistItems = [
  {
    id: 'name-event',
    label: 'Name your event',
    isComplete: (state) => state.event.name !== 'My Event',
  },
  {
    id: 'add-table',
    label: 'Add your first table',
    isComplete: (state) => state.event.tables.length > 0,
    action: () => setActiveView('canvas'),
  },
  {
    id: 'add-guests',
    label: 'Add guests',
    isComplete: (state) => state.event.guests.length > 0,
    action: () => setActiveView('guests'),
  },
  {
    id: 'relationships',
    label: 'Define relationships',
    isComplete: (state) => state.event.guests.some(g => g.relationships?.length > 0),
    action: () => /* open relationships */,
  },
  {
    id: 'assign-guests',
    label: 'Assign guests to tables',
    isComplete: (state) => state.event.guests.some(g => g.tableId),
    action: () => setActiveView('canvas'),
  },
];
```

---

## SVG Illustrations

### Design Guidelines
- Line-art style, 2px stroke
- `var(--color-primary)` for accents
- `var(--color-border)` for structure
- 180x120px viewBox typical size

### EmptyStateIllustrations.tsx

```tsx
export function EmptyCanvasIllustration() {
  return (
    <svg viewBox="0 0 200 150" className="empty-illustration">
      {/* Floor plan outline */}
      <rect x="20" y="20" width="160" height="110" rx="8"
        fill="none" stroke="var(--color-border)" strokeWidth="2" strokeDasharray="8 4" />

      {/* Dashed table shapes suggesting placement */}
      <circle cx="60" cy="70" r="25"
        fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
      <rect x="110" y="50" width="50" height="30" rx="4"
        fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />

      {/* Plus icon */}
      <circle cx="100" cy="100" r="15" fill="var(--color-primary)" opacity="0.2" />
      <path d="M100 92 v16 M92 100 h16" stroke="var(--color-primary)" strokeWidth="2" />
    </svg>
  );
}

export function EmptyGuestsIllustration() {
  return (
    <svg viewBox="0 0 180 120" className="empty-illustration">
      {/* Three faded guest bubbles */}
      <circle cx="50" cy="50" r="20" fill="var(--color-bg-secondary)" stroke="var(--color-border)" strokeWidth="2" />
      <text x="50" y="55" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="14">?</text>

      <circle cx="90" cy="60" r="20" fill="var(--color-bg-secondary)" stroke="var(--color-border)" strokeWidth="2" />
      <text x="90" y="65" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="14">?</text>

      <circle cx="130" cy="50" r="20" fill="var(--color-bg-secondary)" stroke="var(--color-border)" strokeWidth="2" />
      <text x="130" y="55" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="14">?</text>

      {/* Add guest prompt */}
      <circle cx="90" cy="95" r="12" fill="var(--color-primary)" opacity="0.2" />
      <path d="M90 89 v12 M84 95 h12" stroke="var(--color-primary)" strokeWidth="2" />
    </svg>
  );
}

export function AllAssignedIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="empty-illustration">
      {/* Checkmark circle */}
      <circle cx="60" cy="60" r="45" fill="var(--color-success)" opacity="0.1" />
      <circle cx="60" cy="60" r="35" fill="none" stroke="var(--color-success)" strokeWidth="3" />
      <path d="M42 60 l12 12 l24 -24" fill="none" stroke="var(--color-success)" strokeWidth="4" strokeLinecap="round" />

      {/* Confetti dots */}
      <circle cx="25" cy="30" r="4" fill="var(--color-primary)" />
      <circle cx="95" cy="25" r="3" fill="var(--color-secondary)" />
      <circle cx="100" cy="90" r="4" fill="var(--color-primary)" />
      <circle cx="20" cy="85" r="3" fill="var(--color-secondary)" />
    </svg>
  );
}
```

---

## Reusable EmptyState Component

```tsx
interface EmptyStateProps {
  illustration: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  secondaryAction
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-illustration">
        {illustration}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <button className="empty-state-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {secondaryAction && (
        <button className="empty-state-secondary" onClick={secondaryAction.onClick}>
          {secondaryAction.label}
        </button>
      )}
    </div>
  );
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/store/useStore.ts` | Add onboarding state slice |
| `src/App.tsx` | Wrap with OnboardingProvider, add TutorialOverlay |
| `src/components/Canvas.tsx` | Replace empty state, add tip triggers |
| `src/components/DashboardView.tsx` | Add GettingStartedChecklist |
| `src/components/Sidebar.tsx` | Add empty state for zero guests |
| `src/components/GuestManagementView.tsx` | Enhance empty state |
| `src/components/Header.tsx` | Add "Restart Tutorial" in help menu |
| `src/components/RelationshipMatrix.tsx` | Enhance empty state |

---

## Implementation Steps

### Phase 1: Foundation (Day 1)
1. Create onboarding state slice in store
2. Create OnboardingProvider context
3. Create EmptyState wrapper component
4. Create base CSS for onboarding/empty states

### Phase 2: Empty States (Day 2)
1. Design and implement SVG illustrations
2. Replace Canvas empty state
3. Replace Dashboard empty state
4. Replace GuestManagement empty state
5. Replace Sidebar empty state
6. Replace RelationshipMatrix empty state

### Phase 3: Tutorial Overlay (Day 3)
1. Create TutorialOverlay component
2. Implement step progression logic
3. Create spotlight effect for highlights
4. Connect to store state
5. Trigger on first app launch

### Phase 4: Contextual Tips (Day 4)
1. Create ContextualTip component
2. Implement tip positioning
3. Add tip triggers throughout app
4. Store dismissed tips in localStorage

### Phase 5: Getting Started Checklist (Day 5)
1. Create GettingStartedChecklist component
2. Implement auto-detection of completion
3. Add to DashboardView
4. Add dismiss functionality

### Phase 6: Polish & Testing (Day 6)
1. Add "Restart Tutorial" to Help menu
2. Write E2E tests
3. Test on mobile
4. Dark mode compatibility

---

## CSS Variables to Add

```css
/* Onboarding */
--onboarding-overlay-bg: rgba(61, 44, 36, 0.85);
--onboarding-spotlight-size: 200px;
--onboarding-tip-bg: var(--color-bg);
--onboarding-tip-border: var(--color-primary);

/* Empty states */
--empty-state-illustration-size: 180px;
--empty-state-text-color: var(--color-text-secondary);
```

---

## Testing Considerations

### E2E Tests (`e2e/onboarding.spec.ts`)
- First-time user sees tutorial
- Tutorial can be skipped
- Tutorial completes all steps
- Contextual tips appear and dismiss
- Checklist updates on actions

### localStorage Mock
- Clear `hasSeenTutorial` for testing
- Reset function for manual testing

---

## Complexity Summary

| Feature | Time |
|---------|------|
| State management | 2 hours |
| Empty state components | 4 hours |
| SVG illustrations | 3 hours |
| Tutorial overlay | 4 hours |
| Contextual tips | 3 hours |
| Getting started checklist | 2 hours |
| Polish & testing | 2 hours |

**Total: 15-20 hours**
