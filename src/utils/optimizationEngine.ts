/**
 * Advanced Seating Optimization Engine
 *
 * This engine provides configurable weight-based optimization for seating arrangements.
 * It uses a greedy algorithm with local search refinement.
 */

import type {
  Guest,
  Table,
  Constraint,
  OptimizationWeights,
  OptimizationOptions,
  OptimizationResult,
  AssignmentScore,
  ScoreReason,
  TableOptimizationScore,
  OptimizationViolation,
  RelationshipType,
} from '../types';

interface GuestGroup {
  guestIds: string[];
  priority: number; // Higher = should be placed first
}

// ===== Scoring Functions =====

/**
 * Calculate score for a relationship between two guests
 */
function getRelationshipScore(
  type: RelationshipType,
  weights: OptimizationWeights
): number {
  return weights.relationships[type] || 0;
}

/**
 * Calculate the score for a single guest at a specific table
 */
function calculateGuestScore(
  guestId: string,
  tableId: string,
  assignments: Map<string, string>,
  guests: Guest[],
  constraints: Constraint[],
  weights: OptimizationWeights
): AssignmentScore {
  const guest = guests.find((g) => g.id === guestId);
  if (!guest) {
    return {
      guestId,
      tableId,
      totalScore: 0,
      breakdown: {
        relationshipScore: 0,
        constraintScore: 0,
        groupCohesionScore: 0,
        interestScore: 0,
        reasons: [],
      },
    };
  }

  const reasons: ScoreReason[] = [];
  let relationshipScore = 0;
  let constraintScore = 0;
  let groupCohesionScore = 0;
  let interestScore = 0;

  // Get all guests at this table
  const tableGuests = guests.filter(
    (g) => assignments.get(g.id) === tableId && g.id !== guestId
  );

  // Calculate relationship scores
  for (const tableGuest of tableGuests) {
    const relationship = guest.relationships.find(
      (r) => r.guestId === tableGuest.id
    );
    if (relationship) {
      const score = getRelationshipScore(relationship.type, weights);
      relationshipScore += score;
      reasons.push({
        type: 'relationship',
        description: `${relationship.type === 'avoid' ? 'Avoid' : capitalize(relationship.type)} "${tableGuest.name}" at same table`,
        points: score,
        involvedGuestIds: [tableGuest.id],
      });
    }
  }

  // Check if partner is at a different table (penalty)
  const partnerRelation = guest.relationships.find((r) => r.type === 'partner');
  if (partnerRelation) {
    const partnerTableId = assignments.get(partnerRelation.guestId);
    if (partnerTableId && partnerTableId !== tableId) {
      const penalty = -Math.abs(weights.relationships.partner) / 2;
      relationshipScore += penalty;
      const partnerGuest = guests.find((g) => g.id === partnerRelation.guestId);
      reasons.push({
        type: 'penalty',
        description: `Partner "${partnerGuest?.name || 'Unknown'}" at different table`,
        points: penalty,
        involvedGuestIds: [partnerRelation.guestId],
      });
    }
  }

  // Calculate group cohesion score
  if (guest.group) {
    const sameGroupCount = tableGuests.filter(
      (g) => g.group === guest.group
    ).length;
    if (sameGroupCount > 0) {
      const groupBonus = sameGroupCount * weights.groupCohesion;
      groupCohesionScore = groupBonus;
      reasons.push({
        type: 'group',
        description: `${sameGroupCount} member(s) of "${guest.group}" at same table`,
        points: groupBonus,
      });
    }
  }

  // Calculate interest match score
  if (guest.interests && guest.interests.length > 0) {
    let sharedInterests = 0;
    for (const tableGuest of tableGuests) {
      if (tableGuest.interests) {
        const matches = guest.interests.filter((i) =>
          tableGuest.interests?.includes(i)
        ).length;
        sharedInterests += matches;
      }
    }
    if (sharedInterests > 0) {
      const interestBonus = sharedInterests * weights.interestMatch;
      interestScore = interestBonus;
      reasons.push({
        type: 'interest',
        description: `${sharedInterests} shared interest(s) with tablemates`,
        points: interestBonus,
      });
    }
  }

  // Calculate constraint scores
  for (const constraint of constraints) {
    if (!constraint.guestIds.includes(guestId)) continue;

    const otherGuestIds = constraint.guestIds.filter((id) => id !== guestId);
    const otherGuestsAtTable = otherGuestIds.filter(
      (id) => assignments.get(id) === tableId
    );

    let constraintBonus = 0;
    let constraintMet = false;

    switch (constraint.type) {
      case 'must_sit_together':
      case 'same_table':
        if (otherGuestsAtTable.length === otherGuestIds.length) {
          constraintBonus = weights.constraints[constraint.priority];
          constraintMet = true;
        }
        break;
      case 'must_not_sit_together':
      case 'different_table':
        if (otherGuestsAtTable.length === 0) {
          constraintBonus = weights.constraints[constraint.priority];
          constraintMet = true;
        } else {
          constraintBonus = -weights.constraints[constraint.priority];
        }
        break;
    }

    if (constraintBonus !== 0) {
      constraintScore += constraintBonus;
      const otherNames = otherGuestIds
        .map((id) => guests.find((g) => g.id === id)?.name || 'Unknown')
        .join(', ');
      reasons.push({
        type: 'constraint',
        description: `${constraintMet ? '✓' : '✗'} ${constraint.type.replace(/_/g, ' ')}: ${otherNames}`,
        points: constraintBonus,
        involvedGuestIds: otherGuestIds,
      });
    }
  }

  const totalScore =
    relationshipScore + constraintScore + groupCohesionScore + interestScore;

  return {
    guestId,
    tableId,
    totalScore,
    breakdown: {
      relationshipScore,
      constraintScore,
      groupCohesionScore,
      interestScore,
      reasons,
    },
  };
}

/**
 * Calculate total score for all assignments
 */
function calculateTotalScore(
  assignments: Map<string, string>,
  guests: Guest[],
  constraints: Constraint[],
  weights: OptimizationWeights
): { total: number; scores: AssignmentScore[] } {
  const scores: AssignmentScore[] = [];
  let total = 0;

  for (const [guestId, tableId] of assignments) {
    const score = calculateGuestScore(
      guestId,
      tableId,
      assignments,
      guests,
      constraints,
      weights
    );
    scores.push(score);
    total += score.totalScore;
  }

  return { total, scores };
}

// ===== Guest Grouping =====

/**
 * Extract partner pairs from guests (must stay together)
 */
function extractPartnerPairs(guests: Guest[]): Map<string, string> {
  const pairs = new Map<string, string>();

  for (const guest of guests) {
    const partnerRel = guest.relationships.find((r) => r.type === 'partner');
    if (partnerRel) {
      // Ensure we don't duplicate pairs
      if (!pairs.has(partnerRel.guestId)) {
        pairs.set(guest.id, partnerRel.guestId);
      }
    }
  }

  return pairs;
}

/**
 * Group guests by priority for assignment
 */
function groupGuestsByPriority(
  guests: Guest[],
  partnerPairs: Map<string, string>,
  constraints: Constraint[]
): GuestGroup[] {
  const groups: GuestGroup[] = [];
  const assigned = new Set<string>();

  // Priority 1: Partner pairs (highest priority)
  for (const [guest1Id, guest2Id] of partnerPairs) {
    if (!assigned.has(guest1Id) && !assigned.has(guest2Id)) {
      groups.push({ guestIds: [guest1Id, guest2Id], priority: 100 });
      assigned.add(guest1Id);
      assigned.add(guest2Id);
    }
  }

  // Priority 2: Required constraint groups
  for (const constraint of constraints) {
    if (
      constraint.priority === 'required' &&
      (constraint.type === 'must_sit_together' ||
        constraint.type === 'same_table')
    ) {
      const unassignedInGroup = constraint.guestIds.filter(
        (id) => !assigned.has(id)
      );
      if (unassignedInGroup.length > 0) {
        groups.push({ guestIds: unassignedInGroup, priority: 80 });
        unassignedInGroup.forEach((id) => assigned.add(id));
      }
    }
  }

  // Priority 3: Remaining individuals by relationship count
  const remainingGuests = guests.filter((g) => !assigned.has(g.id));
  remainingGuests.sort(
    (a, b) => b.relationships.length - a.relationships.length
  );

  for (const guest of remainingGuests) {
    groups.push({ guestIds: [guest.id], priority: 10 + guest.relationships.length });
  }

  // Sort groups by priority (highest first)
  groups.sort((a, b) => b.priority - a.priority);

  return groups;
}

// ===== Assignment Algorithm =====

/**
 * Check if placing a guest at a table would violate any "avoid" relationships
 */
function hasForbiddenConflict(
  guestIds: string[],
  tableId: string,
  assignments: Map<string, string>,
  guests: Guest[]
): boolean {
  const tableGuestIds = new Set<string>();
  for (const [gId, tId] of assignments) {
    if (tId === tableId) tableGuestIds.add(gId);
  }

  for (const guestId of guestIds) {
    const guest = guests.find((g) => g.id === guestId);
    if (!guest) continue;

    const avoidRelations = guest.relationships.filter((r) => r.type === 'avoid');
    for (const rel of avoidRelations) {
      if (tableGuestIds.has(rel.guestId)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Score a group of guests at a specific table
 */
function scoreGroupAtTable(
  guestIds: string[],
  tableId: string,
  currentAssignments: Map<string, string>,
  guests: Guest[],
  constraints: Constraint[],
  weights: OptimizationWeights
): number {
  // Create temporary assignments with this group at the table
  const tempAssignments = new Map(currentAssignments);
  for (const guestId of guestIds) {
    tempAssignments.set(guestId, tableId);
  }

  let totalScore = 0;
  for (const guestId of guestIds) {
    const score = calculateGuestScore(
      guestId,
      tableId,
      tempAssignments,
      guests,
      constraints,
      weights
    );
    totalScore += score.totalScore;
  }

  return totalScore;
}

/**
 * Greedy assignment algorithm
 */
function greedyAssignment(
  groupedGuests: GuestGroup[],
  tables: Table[],
  guests: Guest[],
  constraints: Constraint[],
  weights: OptimizationWeights
): Map<string, string> {
  const assignments = new Map<string, string>();
  const tableOccupancy = new Map<string, number>();

  // Initialize occupancy
  for (const table of tables) {
    tableOccupancy.set(table.id, 0);
  }

  // Sort tables by capacity (largest first)
  const sortedTables = [...tables].sort((a, b) => b.capacity - a.capacity);

  for (const group of groupedGuests) {
    let bestTable: Table | null = null;
    let bestScore = -Infinity;

    for (const table of sortedTables) {
      const currentOccupancy = tableOccupancy.get(table.id) || 0;

      // Check capacity
      if (currentOccupancy + group.guestIds.length > table.capacity) continue;

      // Check forbidden pairs (avoid placing people who avoid each other)
      if (hasForbiddenConflict(group.guestIds, table.id, assignments, guests)) {
        continue;
      }

      // Score this assignment
      const score = scoreGroupAtTable(
        group.guestIds,
        table.id,
        assignments,
        guests,
        constraints,
        weights
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

/**
 * Local search improvement - try pairwise swaps
 */
function localSearchImprove(
  currentAssignments: Map<string, string>,
  guests: Guest[],
  _tables: Table[], // Used for potential future capacity checks
  constraints: Constraint[],
  weights: OptimizationWeights
): Map<string, string> | null {
  const guestIds = [...currentAssignments.keys()];
  const currentScore = calculateTotalScore(
    currentAssignments,
    guests,
    constraints,
    weights
  ).total;

  // Try pairwise swaps
  for (let i = 0; i < guestIds.length; i++) {
    for (let j = i + 1; j < guestIds.length; j++) {
      const guest1 = guestIds[i];
      const guest2 = guestIds[j];
      const table1 = currentAssignments.get(guest1);
      const table2 = currentAssignments.get(guest2);

      if (!table1 || !table2 || table1 === table2) continue;

      // Try swap
      const newAssignments = new Map(currentAssignments);
      newAssignments.set(guest1, table2);
      newAssignments.set(guest2, table1);

      // Check if swap violates forbidden pairs
      if (
        hasForbiddenConflict([guest1], table2, newAssignments, guests) ||
        hasForbiddenConflict([guest2], table1, newAssignments, guests)
      ) {
        continue;
      }

      const newScore = calculateTotalScore(
        newAssignments,
        guests,
        constraints,
        weights
      ).total;

      if (newScore > currentScore) {
        return newAssignments;
      }
    }
  }

  return null;
}

// ===== Violation Detection =====

function detectViolations(
  assignments: Map<string, string>,
  constraints: Constraint[],
  guests: Guest[]
): OptimizationViolation[] {
  const violations: OptimizationViolation[] = [];

  for (const constraint of constraints) {
    const guestTableIds = constraint.guestIds.map((id) => assignments.get(id));
    const uniqueTables = new Set(guestTableIds.filter(Boolean));

    let violated = false;
    let message = '';

    switch (constraint.type) {
      case 'must_sit_together':
      case 'same_table':
        if (uniqueTables.size > 1) {
          violated = true;
          const names = constraint.guestIds
            .map((id) => guests.find((g) => g.id === id)?.name || 'Unknown')
            .join(', ');
          message = `Guests should sit together but are at different tables: ${names}`;
        }
        break;
      case 'must_not_sit_together':
      case 'different_table':
        if (uniqueTables.size === 1 && guestTableIds.every(Boolean)) {
          violated = true;
          const names = constraint.guestIds
            .map((id) => guests.find((g) => g.id === id)?.name || 'Unknown')
            .join(', ');
          message = `Guests should not sit together but are at the same table: ${names}`;
        }
        break;
    }

    if (violated) {
      violations.push({
        severity:
          constraint.priority === 'required'
            ? 'critical'
            : constraint.priority === 'preferred'
              ? 'warning'
              : 'info',
        message,
        guestIds: constraint.guestIds,
        constraintId: constraint.id,
      });
    }
  }

  // Check for avoid relationships
  for (const guest of guests) {
    const guestTableId = assignments.get(guest.id);
    if (!guestTableId) continue;

    const avoidRelations = guest.relationships.filter((r) => r.type === 'avoid');
    for (const rel of avoidRelations) {
      const otherTableId = assignments.get(rel.guestId);
      if (otherTableId === guestTableId) {
        const otherGuest = guests.find((g) => g.id === rel.guestId);
        violations.push({
          severity: 'warning',
          message: `"${guest.name}" and "${otherGuest?.name || 'Unknown'}" should avoid each other but are at the same table`,
          guestIds: [guest.id, rel.guestId],
        });
      }
    }
  }

  return violations;
}

// ===== Table Score Aggregation =====

function aggregateTableScores(
  assignmentScores: AssignmentScore[],
  tables: Table[]
): Map<string, TableOptimizationScore> {
  const tableScores = new Map<string, TableOptimizationScore>();

  for (const table of tables) {
    const tableGuestScores = assignmentScores.filter(
      (s) => s.tableId === table.id
    );
    const totalScore = tableGuestScores.reduce(
      (sum, s) => sum + s.totalScore,
      0
    );
    const avgScore =
      tableGuestScores.length > 0 ? totalScore / tableGuestScores.length : 0;

    // Normalize to 0-100 scale
    const compatibilityScore = Math.max(0, Math.min(100, 50 + avgScore / 2));

    const issues: string[] = [];
    if (tableGuestScores.length > table.capacity) {
      issues.push('Over capacity');
    }
    for (const score of tableGuestScores) {
      const negativeReasons = score.breakdown.reasons.filter(
        (r) => r.points < 0
      );
      for (const reason of negativeReasons) {
        if (reason.type === 'penalty' || reason.type === 'constraint') {
          issues.push(reason.description);
        }
      }
    }

    tableScores.set(table.id, {
      tableId: table.id,
      tableName: table.name,
      compatibilityScore,
      guestCount: tableGuestScores.length,
      capacity: table.capacity,
      issues: [...new Set(issues)], // Dedupe
      guestScores: tableGuestScores,
    });
  }

  return tableScores;
}

// ===== Main Optimization Function =====

/**
 * Run advanced seating optimization
 */
export function optimizeSeatingAdvanced(
  guests: Guest[],
  tables: Table[],
  constraints: Constraint[],
  weights: OptimizationWeights,
  options: OptimizationOptions = {}
): OptimizationResult {
  // Phase 1: Prepare eligible guests/tables
  const eligibleGuests = options.selectedGuestIds
    ? guests.filter((g) => options.selectedGuestIds!.includes(g.id))
    : guests.filter((g) => g.rsvpStatus !== 'declined');

  const eligibleTables = options.selectedTableIds
    ? tables.filter((t) => options.selectedTableIds!.includes(t.id))
    : tables;

  // Get current assignments for comparison
  const currentAssignments = new Map<string, string | undefined>();
  for (const guest of guests) {
    currentAssignments.set(guest.id, guest.tableId);
  }

  // Calculate current score
  const currentScoreResult = calculateTotalScore(
    new Map(
      guests
        .filter((g) => g.tableId)
        .map((g) => [g.id, g.tableId!])
    ),
    guests,
    constraints,
    weights
  );
  const previousScore = currentScoreResult.total;

  // Phase 2: Extract partner pairs
  const partnerPairs = extractPartnerPairs(eligibleGuests);

  // Phase 3: Group guests by priority
  const groupedGuests = groupGuestsByPriority(
    eligibleGuests,
    partnerPairs,
    constraints
  );

  // Phase 4: Initial greedy assignment
  let assignments = greedyAssignment(
    groupedGuests,
    eligibleTables,
    eligibleGuests,
    constraints,
    weights
  );

  // Phase 5: Local search refinement
  const maxIterations = options.maxIterations || 10;
  for (let i = 0; i < maxIterations; i++) {
    const improved = localSearchImprove(
      assignments,
      eligibleGuests,
      eligibleTables,
      constraints,
      weights
    );
    if (!improved) break;
    assignments = improved;
  }

  // Phase 6: Calculate detailed scores
  const { total: totalScore, scores: assignmentScores } = calculateTotalScore(
    assignments,
    eligibleGuests,
    constraints,
    weights
  );

  // Phase 7: Detect violations
  const violations = detectViolations(assignments, constraints, eligibleGuests);

  // Phase 8: Aggregate table scores
  const tableScores = aggregateTableScores(
    assignmentScores,
    eligibleTables
  );

  // Phase 9: Identify moved guests
  const movedGuests: string[] = [];
  for (const [guestId, newTableId] of assignments) {
    const currentTableId = currentAssignments.get(guestId);
    if (currentTableId !== newTableId) {
      movedGuests.push(guestId);
    }
  }

  return {
    proposedAssignments: assignments,
    currentAssignments,
    totalScore,
    previousScore,
    scoreImprovement: totalScore - previousScore,
    assignmentScores,
    tableScores,
    violations,
    movedGuests,
  };
}

// ===== Helper Functions =====

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
