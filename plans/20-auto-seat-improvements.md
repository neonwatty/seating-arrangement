# Phase 5.1: Auto-Seat Algorithm Improvements

## Overview
Enhance the optimization algorithm with configurable weights, preview mode, selective optimization, and detailed score breakdowns.

**Estimated Time:** 18-23 hours

---

## Current Algorithm Analysis

### Location: `src/store/useStore.ts` (lines 1521-1666)

The current `optimizeSeating()` uses a **greedy algorithm**:

**Current Scoring:**
```
Partner at same table:     +10 points
Partner at different table: -5 points
Family at same table:      +5 points
Friend at same table:      +3 points
Colleague at same table:   +1 points
Avoid at same table:       -20 points
Avoid at different table:  +5 points
```

**Current Algorithm Steps:**
1. Filter to confirmed guests only
2. Build partner pairs (must stay together)
3. Group guests: partner pairs first, then individuals
4. Sort tables by capacity (largest first)
5. Greedy assignment: for each group, find table with best compatibility
6. Apply assignments and track moved guests

### Current Limitations
- No configurable weight factors
- No preview mode before applying
- Cannot optimize only selected tables/guests
- No detailed score breakdown per assignment
- Does not consider explicit Constraints array
- No consideration of guest.group field cohesion
- Limited to greedy approach without refinement

---

## New Type Definitions

### Add to `src/types/index.ts`

```typescript
export interface OptimizationWeights {
  relationships: {
    partner: number;      // Default: 100
    family: number;       // Default: 50
    friend: number;       // Default: 30
    colleague: number;    // Default: 10
    acquaintance: number; // Default: 5
    avoid: number;        // Default: -200
  };
  constraints: {
    required: number;     // Default: 1000
    preferred: number;    // Default: 50
    optional: number;     // Default: 10
  };
  groupCohesion: number;  // Default: 40
  interestMatch: number;  // Default: 5
  industryMix: number;    // Default: 3
}

export interface AssignmentScore {
  guestId: string;
  tableId: string;
  totalScore: number;
  breakdown: {
    relationshipScore: number;
    constraintScore: number;
    groupCohesionScore: number;
    interestScore: number;
    reasons: ScoreReason[];
  };
}

export interface ScoreReason {
  type: 'relationship' | 'constraint' | 'group' | 'interest' | 'penalty';
  description: string;
  points: number;
  involvedGuestIds?: string[];
}

export interface OptimizationResult {
  proposedAssignments: Map<string, string>;
  currentAssignments: Map<string, string>;
  totalScore: number;
  previousScore: number;
  scoreImprovement: number;
  assignmentScores: AssignmentScore[];
  tableScores: Map<string, TableOptimizationScore>;
  violations: OptimizationViolation[];
  movedGuests: string[];
}

export interface TableOptimizationScore {
  tableId: string;
  tableName: string;
  compatibilityScore: number;
  guestCount: number;
  capacity: number;
  issues: string[];
  guestScores: AssignmentScore[];
}

export interface OptimizationViolation {
  severity: 'critical' | 'warning' | 'info';
  message: string;
  guestIds: string[];
  constraintId?: string;
}

export interface OptimizationOptions {
  selectedGuestIds?: string[];
  selectedTableIds?: string[];
  preserveCurrentAssignments?: boolean;
  maxIterations?: number;
}
```

---

## Enhanced Algorithm

### New file: `src/utils/optimizationEngine.ts`

```typescript
export function optimizeSeatingAdvanced(
  guests: Guest[],
  tables: Table[],
  constraints: Constraint[],
  weights: OptimizationWeights,
  options: OptimizationOptions = {}
): OptimizationResult {

  // Phase 1: Prepare eligible guests/tables
  const eligibleGuests = options.selectedGuestIds
    ? guests.filter(g => options.selectedGuestIds!.includes(g.id))
    : guests.filter(g => g.rsvpStatus !== 'declined');

  const eligibleTables = options.selectedTableIds
    ? tables.filter(t => options.selectedTableIds!.includes(t.id))
    : tables;

  // Phase 2: Build constraint graph
  const constraintGraph = buildConstraintGraph(constraints, eligibleGuests);

  // Phase 3: Build relationship matrix
  const relationshipMatrix = buildRelationshipMatrix(eligibleGuests, weights);

  // Phase 4: Identify hard constraints
  const requiredPairs = extractRequiredPairs(constraintGraph);
  const forbiddenPairs = extractForbiddenPairs(constraintGraph);

  // Phase 5: Group guests by priority
  const groupedGuests = groupGuestsByPriority(eligibleGuests, requiredPairs);

  // Phase 6: Initial greedy assignment
  let assignments = greedyAssignment(
    groupedGuests,
    eligibleTables,
    relationshipMatrix,
    forbiddenPairs,
    weights
  );

  // Phase 7: Local search refinement
  for (let i = 0; i < (options.maxIterations || 10); i++) {
    const improved = localSearchImprove(assignments, ...);
    if (!improved) break;
    assignments = improved;
  }

  // Phase 8: Calculate detailed scores
  const assignmentScores = calculateDetailedScores(
    assignments, eligibleGuests, constraints, weights
  );

  // Phase 9: Detect violations
  const violations = detectViolations(assignments, constraints, eligibleGuests);

  return {
    proposedAssignments: assignments,
    currentAssignments: getCurrentAssignments(guests),
    totalScore: calculateTotalScore(assignmentScores),
    previousScore: calculateCurrentScore(guests, constraints, weights),
    scoreImprovement: ...,
    assignmentScores,
    tableScores: aggregateTableScores(assignmentScores, tables),
    violations,
    movedGuests: identifyMovedGuests(assignments, guests)
  };
}
```

### Greedy Assignment

```typescript
function greedyAssignment(
  groupedGuests: GuestGroup[],
  tables: Table[],
  relationshipMatrix: Map<string, Map<string, number>>,
  forbiddenPairs: Set<string>,
  weights: OptimizationWeights
): Map<string, string> {
  const assignments = new Map<string, string>();
  const tableOccupancy = new Map<string, number>();

  // Sort tables by capacity (largest first)
  const sortedTables = [...tables].sort((a, b) => b.capacity - a.capacity);

  for (const group of groupedGuests) {
    let bestTable: Table | null = null;
    let bestScore = -Infinity;

    for (const table of sortedTables) {
      const currentOccupancy = tableOccupancy.get(table.id) || 0;

      // Check capacity
      if (currentOccupancy + group.guestIds.length > table.capacity) continue;

      // Check forbidden pairs
      if (hasForbiddenConflict(group.guestIds, table.id, assignments, forbiddenPairs)) continue;

      // Score this assignment
      const score = scoreGroupAtTable(
        group.guestIds, table.id, assignments, relationshipMatrix, weights
      );

      if (score > bestScore) {
        bestScore = score;
        bestTable = table;
      }
    }

    if (bestTable) {
      for (const guestId of group.guestIds) {
        assignments.set(guestId, bestTable.id);
      }
      tableOccupancy.set(
        bestTable.id,
        (tableOccupancy.get(bestTable.id) || 0) + group.guestIds.length
      );
    }
  }

  return assignments;
}
```

### Local Search Refinement

```typescript
function localSearchImprove(
  currentAssignments: Map<string, string>,
  guests: Guest[],
  tables: Table[],
  relationshipMatrix: Map<string, Map<string, number>>,
  forbiddenPairs: Set<string>,
  weights: OptimizationWeights
): Map<string, string> | null {
  const guestIds = [...currentAssignments.keys()];

  // Try pairwise swaps
  for (let i = 0; i < guestIds.length; i++) {
    for (let j = i + 1; j < guestIds.length; j++) {
      const guest1 = guestIds[i];
      const guest2 = guestIds[j];
      const table1 = currentAssignments.get(guest1)!;
      const table2 = currentAssignments.get(guest2)!;

      if (table1 === table2) continue;

      // Check forbidden pairs
      if (wouldCreateForbiddenPair(guest1, table2, currentAssignments, forbiddenPairs)) continue;
      if (wouldCreateForbiddenPair(guest2, table1, currentAssignments, forbiddenPairs)) continue;

      // Calculate score delta
      const currentScore = calculatePairScore(...);
      const swappedScore = calculatePairScore(...);

      if (swappedScore > currentScore) {
        const newAssignments = new Map(currentAssignments);
        newAssignments.set(guest1, table2);
        newAssignments.set(guest2, table1);
        return newAssignments;
      }
    }
  }

  return null;
}
```

---

## Weight Configuration UI

### WeightConfiguration.tsx

```tsx
interface WeightConfigurationProps {
  weights: OptimizationWeights;
  onChange: (weights: OptimizationWeights) => void;
}

export function WeightConfiguration({ weights, onChange }: WeightConfigurationProps) {
  return (
    <div className="weight-configuration">
      <h3>Optimization Priorities</h3>

      <section className="weight-section">
        <h4>Relationship Weights</h4>
        <WeightSlider
          label="Partners (must sit together)"
          value={weights.relationships.partner}
          min={0} max={200}
          onChange={(v) => updateWeight('relationships.partner', v)}
        />
        <WeightSlider
          label="Family members"
          value={weights.relationships.family}
          min={0} max={100}
          onChange={(v) => updateWeight('relationships.family', v)}
        />
        <WeightSlider
          label="Friends"
          value={weights.relationships.friend}
          min={0} max={100}
          onChange={(v) => updateWeight('relationships.friend', v)}
        />
        <WeightSlider
          label="Avoid penalty"
          value={Math.abs(weights.relationships.avoid)}
          min={50} max={500}
          onChange={(v) => updateWeight('relationships.avoid', -v)}
        />
      </section>

      <section className="weight-section">
        <h4>Group & Social</h4>
        <WeightSlider
          label="Group cohesion bonus"
          value={weights.groupCohesion}
          min={0} max={100}
        />
        <WeightSlider
          label="Shared interests bonus"
          value={weights.interestMatch}
          min={0} max={20}
        />
      </section>

      <div className="weight-presets">
        <button onClick={() => applyPreset('wedding')}>Wedding</button>
        <button onClick={() => applyPreset('corporate')}>Corporate</button>
        <button onClick={() => applyPreset('networking')}>Networking</button>
      </div>
    </div>
  );
}
```

### Preset Configurations

```typescript
const PRESETS = {
  wedding: {
    relationships: { partner: 200, family: 80, friend: 40, colleague: 10, acquaintance: 5, avoid: -300 },
    constraints: { required: 1000, preferred: 60, optional: 15 },
    groupCohesion: 60,
    interestMatch: 3,
    industryMix: 0,
  },
  corporate: {
    relationships: { partner: 50, family: 20, friend: 30, colleague: 40, acquaintance: 10, avoid: -150 },
    constraints: { required: 1000, preferred: 50, optional: 10 },
    groupCohesion: 30,
    interestMatch: 8,
    industryMix: 10,
  },
  networking: {
    relationships: { partner: 30, family: 10, friend: 20, colleague: 15, acquaintance: 5, avoid: -100 },
    constraints: { required: 1000, preferred: 40, optional: 10 },
    groupCohesion: 10,
    interestMatch: 15,
    industryMix: 20,
  },
};
```

---

## Preview Mode Design

### State Management

```typescript
// Add to useStore.ts
interface OptimizationPreviewState {
  isPreviewMode: boolean;
  previewResult: OptimizationResult | null;
  highlightedChanges: Set<string>;
}

// Actions
setPreviewMode: (enabled: boolean) => void;
runOptimizationPreview: (options?: OptimizationOptions) => OptimizationResult;
applyPreview: () => void;
discardPreview: () => void;
```

### Visual Design

**Diff Highlighting:**
- Green glow: Guest would move to this table (improvement)
- Orange glow: Guest would move away
- Dashed outline: Proposed position
- Solid outline: Current position

```css
.guest-preview-move::after {
  content: '';
  position: absolute;
  inset: -4px;
  border: 2px dashed var(--color-primary);
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.guest-current-position {
  opacity: 0.5;
}

.guest-proposed-position {
  border: 2px solid var(--color-success);
  box-shadow: 0 0 12px var(--color-success);
}

.table-gaining-guests {
  box-shadow: inset 0 0 0 3px var(--color-success-light);
}

.table-losing-guests {
  box-shadow: inset 0 0 0 3px var(--color-warning-light);
}
```

### Preview Panel

```tsx
function OptimizationPreview({ result }: { result: OptimizationResult }) {
  return (
    <div className="optimization-preview-panel">
      <div className="preview-header">
        <h3>Preview Changes</h3>
        <div className="score-comparison">
          <span className="score-before">{result.previousScore}</span>
          <span className="score-arrow">→</span>
          <span className="score-after">{result.totalScore}</span>
          <span className="score-delta positive">
            +{result.scoreImprovement}
          </span>
        </div>
      </div>

      <div className="preview-stats">
        <div className="stat">
          <span className="stat-value">{result.movedGuests.length}</span>
          <span className="stat-label">Guests would move</span>
        </div>
      </div>

      <div className="preview-moves-list">
        {result.movedGuests.map(guestId => (
          <MoveItem key={guestId} guestId={guestId} result={result} />
        ))}
      </div>

      <div className="preview-actions">
        <button className="apply-btn" onClick={applyPreview}>Apply</button>
        <button className="discard-btn" onClick={discardPreview}>Cancel</button>
      </div>
    </div>
  );
}
```

---

## "Optimize Selection" Feature

### UI Integration

```tsx
// In SelectionToolbar.tsx
{selectedTableIds.length > 0 && (
  <button onClick={() => optimizeSelected(selectedTableIds, selectedGuestIds)}>
    <span className="icon">✨</span>
    Optimize Selected
  </button>
)}
```

### Context Menu

- Right-click table: "Optimize this table"
- Right-click selection: "Optimize selected"

---

## Score Breakdown Display

### Per-Guest Score Card

```tsx
function GuestScoreBreakdown({ score }: { score: AssignmentScore }) {
  return (
    <div className="guest-score-card">
      <div className="guest-header">
        <span className="guest-name">{guest?.name}</span>
        <span className="total-score">{score.totalScore} pts</span>
      </div>

      <div className="score-reasons">
        {score.breakdown.reasons.map((reason, idx) => (
          <div key={idx} className={`reason-item ${reason.points >= 0 ? 'positive' : 'negative'}`}>
            <span className="reason-icon">{getReasonIcon(reason.type)}</span>
            <span className="reason-text">{reason.description}</span>
            <span className="reason-points">
              {reason.points >= 0 ? '+' : ''}{reason.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Example Reasons:**
```
+100 | Partner "Jane Doe" at same table
+50  | Family member "John Sr." at same table
+40  | Same group "Bride's Family" at table
-200 | WARNING: "Mark Jones" (avoid) at same table
+15  | 3 shared interests with tablemates
```

### Per-Table Summary

```tsx
function TableScoreSummary({ tableScore }: { tableScore: TableOptimizationScore }) {
  return (
    <div className={`table-score-summary ${getGradeClass(tableScore.compatibilityScore)}`}>
      <div className="table-header">
        <span className="table-name">{tableScore.tableName}</span>
        <span className="table-occupancy">{tableScore.guestCount}/{tableScore.capacity}</span>
      </div>

      <div className="compatibility-score">
        <CircularProgress value={tableScore.compatibilityScore} />
        <span className="score-label">Compatibility</span>
      </div>

      {tableScore.issues.length > 0 && (
        <div className="table-issues">
          {tableScore.issues.map((issue, idx) => (
            <div key={idx} className="issue-item">⚠️ {issue}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add all new types |
| `src/store/useStore.ts` | Refactor optimizeSeating, add preview state |
| `src/components/OptimizeView.tsx` | Weight config, score breakdown |
| `src/components/Canvas.tsx` | Preview mode rendering |
| `src/components/Table.tsx` | Preview state rendering |
| `src/components/SelectionToolbar.tsx` | "Optimize Selection" button |

### New Files

| File | Purpose |
|------|---------|
| `src/utils/optimizationEngine.ts` | Core algorithm |
| `src/components/OptimizationPreview.tsx` | Preview panel |
| `src/components/WeightConfiguration.tsx` | Weight sliders |
| `src/components/ScoreBreakdown.tsx` | Score display |

---

## Implementation Steps

1. **Phase 1: Type Definitions** (1 hour)
   - Add types to `src/types/index.ts`
   - Define weight presets

2. **Phase 2: Optimization Engine** (4-5 hours)
   - Create `optimizationEngine.ts`
   - Implement scoring functions
   - Implement constraint graph
   - Implement greedy + local search
   - Add unit tests

3. **Phase 3: Store Integration** (2-3 hours)
   - Add weights to store state
   - Add preview state
   - Integrate new algorithm

4. **Phase 4: Weight Configuration UI** (2 hours)
   - Create WeightConfiguration component
   - Add presets
   - Integrate with OptimizeView

5. **Phase 5: Preview Mode** (3-4 hours)
   - Add preview rendering to Canvas
   - Create preview panel
   - Implement diff highlighting

6. **Phase 6: Optimize Selection** (2 hours)
   - Add button to SelectionToolbar
   - Add context menu options
   - Implement scoped optimization

7. **Phase 7: Score Breakdown** (2-3 hours)
   - Create ScoreBreakdown components
   - Add per-table and per-guest breakdowns

8. **Phase 8: Testing & Polish** (2-3 hours)
   - E2E tests
   - Performance testing
   - Accessibility review

---

## Performance Considerations

### For Large Guest Lists (500+)

1. **Algorithm Complexity:**
   - Greedy: O(G × T)
   - Local search: O(G² × I) - limit iterations

2. **Optimizations:**
   - Memoize relationship lookups
   - Use Web Workers for non-blocking UI
   - Implement progressive results
   - Cache constraint graph

3. **UI Responsiveness:**
   - Show progress indicator
   - Virtualize long lists
   - Debounce weight slider changes
   - Lazy-load detailed breakdowns

---

## Complexity Summary

| Phase | Time |
|-------|------|
| Type definitions | 1 hour |
| Optimization engine | 4-5 hours |
| Store integration | 2-3 hours |
| Weight configuration | 2 hours |
| Preview mode | 3-4 hours |
| Optimize selection | 2 hours |
| Score breakdown | 2-3 hours |
| Testing & polish | 2-3 hours |

**Total: 18-23 hours**
