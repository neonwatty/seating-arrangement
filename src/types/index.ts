export type RelationshipType =
  | 'family'
  | 'friend'
  | 'colleague'
  | 'acquaintance'
  | 'partner'
  | 'avoid';

export interface Relationship {
  guestId: string;
  type: RelationshipType;
  strength: number; // 1-5, higher = stronger preference
}

export interface Guest {
  id: string;
  name: string;
  email?: string;

  // Profile data (from survey or LinkedIn)
  company?: string;
  jobTitle?: string;
  industry?: string;
  interests?: string[];
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];

  // Relationships with other guests
  relationships: Relationship[];

  // Condensed profile from LLM
  profileSummary?: string;

  // Seating assignment
  tableId?: string;
  seatIndex?: number;

  // Canvas position (for unassigned guests)
  canvasX?: number;
  canvasY?: number;

  // Metadata
  group?: string; // e.g., "Bride's family", "Marketing team"
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  notes?: string;
}

export type TableShape = 'round' | 'rectangle' | 'square' | 'oval' | 'half-round' | 'serpentine';

export interface Table {
  id: string;
  name: string;
  shape: TableShape;
  capacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

// Venue elements (non-seating items like dance floors, stages, etc.)
export type VenueElementType =
  | 'dance-floor'
  | 'stage'
  | 'dj-booth'
  | 'bar'
  | 'buffet'
  | 'entrance'
  | 'exit'
  | 'photo-booth';

export interface VenueElement {
  id: string;
  type: VenueElementType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface Constraint {
  id: string;
  type: 'must_sit_together' | 'must_not_sit_together' | 'same_table' | 'different_table' | 'near_front' | 'accessibility';
  guestIds: string[];
  priority: 'required' | 'preferred' | 'optional';
  description?: string;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiselect' | 'single_select' | 'relationship';
  options?: string[];
  required: boolean;
}

export interface SurveyResponse {
  guestId: string;
  questionId: string;
  answer: string | string[];
}

export interface Event {
  id: string;
  name: string;
  date?: string;
  type: 'wedding' | 'corporate' | 'social' | 'other';
  tables: Table[];
  guests: Guest[];
  constraints: Constraint[];
  surveyQuestions: SurveyQuestion[];
  surveyResponses: SurveyResponse[];
  venueElements: VenueElement[];
}

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  selectedTableIds: string[];
  selectedGuestIds: string[];
  selectedVenueElementId: string | null;
}

export interface CanvasPreferences {
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: 20 | 40 | 80;
  showAlignmentGuides: boolean;
}

export interface AlignmentGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
}

export interface ConstraintViolation {
  constraintId: string;
  constraintType: Constraint['type'];
  priority: Constraint['priority'];
  description: string;
  guestIds: string[];
  tableIds: string[];
}

// ===== Optimization Types =====

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
}

export interface ScoreReason {
  type: 'relationship' | 'constraint' | 'group' | 'interest' | 'penalty';
  description: string;
  points: number;
  involvedGuestIds?: string[];
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

export interface OptimizationResult {
  proposedAssignments: Map<string, string>;
  currentAssignments: Map<string, string | undefined>;
  totalScore: number;
  previousScore: number;
  scoreImprovement: number;
  assignmentScores: AssignmentScore[];
  tableScores: Map<string, TableOptimizationScore>;
  violations: OptimizationViolation[];
  movedGuests: string[];
}

export interface OptimizationOptions {
  selectedGuestIds?: string[];
  selectedTableIds?: string[];
  preserveCurrentAssignments?: boolean;
  maxIterations?: number;
}

// Optimization weight presets
export type OptimizationPreset = 'wedding' | 'corporate' | 'networking' | 'custom';

export const DEFAULT_OPTIMIZATION_WEIGHTS: OptimizationWeights = {
  relationships: {
    partner: 100,
    family: 50,
    friend: 30,
    colleague: 10,
    acquaintance: 5,
    avoid: -200,
  },
  constraints: {
    required: 1000,
    preferred: 50,
    optional: 10,
  },
  groupCohesion: 40,
  interestMatch: 5,
};

export const OPTIMIZATION_PRESETS: Record<Exclude<OptimizationPreset, 'custom'>, OptimizationWeights> = {
  wedding: {
    relationships: { partner: 200, family: 80, friend: 40, colleague: 10, acquaintance: 5, avoid: -300 },
    constraints: { required: 1000, preferred: 60, optional: 15 },
    groupCohesion: 60,
    interestMatch: 3,
  },
  corporate: {
    relationships: { partner: 50, family: 20, friend: 30, colleague: 40, acquaintance: 10, avoid: -150 },
    constraints: { required: 1000, preferred: 50, optional: 10 },
    groupCohesion: 30,
    interestMatch: 8,
  },
  networking: {
    relationships: { partner: 30, family: 10, friend: 20, colleague: 15, acquaintance: 5, avoid: -100 },
    constraints: { required: 1000, preferred: 40, optional: 10 },
    groupCohesion: 10,
    interestMatch: 15,
  },
};
