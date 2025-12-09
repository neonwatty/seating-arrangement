import type {
  AssignmentScore,
  TableOptimizationScore,
  OptimizationViolation,
  OptimizationResult,
  Guest,
  Table,
} from '../types';
import './ScoreBreakdown.css';

// Get icon for reason type
function getReasonIcon(type: string): string {
  switch (type) {
    case 'relationship':
      return '💑';
    case 'constraint':
      return '📋';
    case 'group':
      return '👥';
    case 'interest':
      return '🎯';
    case 'penalty':
      return '⚠️';
    default:
      return '•';
  }
}

// Get grade class for compatibility score
function getGradeClass(score: number): string {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

interface GuestScoreBreakdownProps {
  score: AssignmentScore;
  guest?: Guest;
}

export function GuestScoreBreakdown({ score, guest }: GuestScoreBreakdownProps) {
  const scoreClass = score.totalScore > 0 ? 'positive' : score.totalScore < 0 ? 'negative' : 'neutral';

  return (
    <div className="guest-score-card">
      <div className="guest-score-header">
        <span className="guest-score-name">{guest?.name || 'Unknown Guest'}</span>
        <span className={`guest-total-score ${scoreClass}`}>
          {score.totalScore > 0 ? '+' : ''}
          {score.totalScore} pts
        </span>
      </div>

      <div className="score-reasons">
        {score.breakdown.reasons.map((reason, idx) => (
          <div
            key={idx}
            className={`reason-item ${reason.points >= 0 ? 'positive' : 'negative'}`}
          >
            <span className="reason-icon">{getReasonIcon(reason.type)}</span>
            <span className="reason-text">{reason.description}</span>
            <span className="reason-points">
              {reason.points >= 0 ? '+' : ''}
              {reason.points}
            </span>
          </div>
        ))}
        {score.breakdown.reasons.length === 0 && (
          <div className="reason-item neutral">
            <span className="reason-text">No specific factors</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface TableScoreSummaryProps {
  tableScore: TableOptimizationScore;
}

export function TableScoreSummary({ tableScore }: TableScoreSummaryProps) {
  const gradeClass = getGradeClass(tableScore.compatibilityScore);
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset =
    circumference - (tableScore.compatibilityScore / 100) * circumference;

  return (
    <div className="table-score-summary">
      <div className="table-score-header">
        <span className="table-score-name">{tableScore.tableName}</span>
        <span className="table-occupancy">
          {tableScore.guestCount}/{tableScore.capacity}
        </span>
      </div>

      <div className="compatibility-score">
        <div className={`compatibility-circle ${gradeClass}`}>
          <svg viewBox="0 0 48 48">
            <circle className="bg" cx="24" cy="24" r="18" />
            <circle
              className="fill"
              cx="24"
              cy="24"
              r="18"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <span className="compatibility-value">
            {Math.round(tableScore.compatibilityScore)}
          </span>
        </div>
        <span className="compatibility-label">Compatibility Score</span>
      </div>

      {tableScore.issues.length > 0 && (
        <div className="table-issues">
          {tableScore.issues.map((issue, idx) => (
            <div key={idx} className="issue-item">
              <span>⚠️</span>
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ViolationsListProps {
  violations: OptimizationViolation[];
}

export function ViolationsList({ violations }: ViolationsListProps) {
  if (violations.length === 0) return null;

  return (
    <div className="violations-list">
      {violations.map((violation, idx) => (
        <div key={idx} className={`violation-item ${violation.severity}`}>
          <span className="violation-icon">
            {violation.severity === 'critical'
              ? '🚨'
              : violation.severity === 'warning'
                ? '⚠️'
                : 'ℹ️'}
          </span>
          <span className="violation-message">{violation.message}</span>
        </div>
      ))}
    </div>
  );
}

interface MovedGuestsSummaryProps {
  result: OptimizationResult;
  guests: Guest[];
  tables: Table[];
}

export function MovedGuestsSummary({
  result,
  guests,
  tables,
}: MovedGuestsSummaryProps) {
  if (result.movedGuests.length === 0) {
    return (
      <div className="moved-guests-summary">
        <p>No guests will be moved.</p>
      </div>
    );
  }

  const getTableName = (tableId: string | undefined) => {
    if (!tableId) return 'Unassigned';
    return tables.find((t) => t.id === tableId)?.name || 'Unknown';
  };

  return (
    <div className="moved-guests-summary">
      <div className="moved-guests-header">
        <h4>Guests to Move</h4>
        <span className="moved-count">{result.movedGuests.length}</span>
      </div>
      <div className="moved-guests-list">
        {result.movedGuests.slice(0, 10).map((guestId) => {
          const guest = guests.find((g) => g.id === guestId);
          const fromTable = result.currentAssignments.get(guestId);
          const toTable = result.proposedAssignments.get(guestId);

          return (
            <div key={guestId} className="moved-guest-item">
              <span className="moved-guest-name">{guest?.name || 'Unknown'}</span>
              <span className="move-from">{getTableName(fromTable)}</span>
              <span className="move-arrow">→</span>
              <span className="move-to">{getTableName(toTable)}</span>
            </div>
          );
        })}
        {result.movedGuests.length > 10 && (
          <p className="more-guests">
            ...and {result.movedGuests.length - 10} more
          </p>
        )}
      </div>
    </div>
  );
}

interface ScoreComparisonProps {
  previousScore: number;
  newScore: number;
}

export function ScoreComparison({
  previousScore,
  newScore,
}: ScoreComparisonProps) {
  const improvement = newScore - previousScore;
  const deltaClass =
    improvement > 0 ? 'positive' : improvement < 0 ? 'negative' : 'neutral';

  return (
    <div className="score-comparison">
      <span className="score-before">{Math.round(previousScore)}</span>
      <span className="score-arrow">→</span>
      <span className="score-after">{Math.round(newScore)}</span>
      <span className={`score-delta ${deltaClass}`}>
        {improvement > 0 ? '+' : ''}
        {Math.round(improvement)}
      </span>
    </div>
  );
}
