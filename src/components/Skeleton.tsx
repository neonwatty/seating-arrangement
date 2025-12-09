import './Skeleton.css';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  className = '',
  width,
  height,
  borderRadius,
  style,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
        ...style,
      }}
    />
  );
}

// Text skeleton with size variants
interface SkeletonTextProps extends SkeletonProps {
  lines?: number;
  size?: 'short' | 'medium' | 'long';
}

export function SkeletonText({
  lines = 1,
  size = 'medium',
  className = '',
  ...props
}: SkeletonTextProps) {
  if (lines === 1) {
    return <Skeleton className={`skeleton-text ${size} ${className}`} {...props} />;
  }

  return (
    <div className="skeleton-text-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`skeleton-text ${i === lines - 1 ? 'short' : size} ${className}`}
          {...props}
        />
      ))}
    </div>
  );
}

// Circle skeleton (avatars, icons)
interface SkeletonCircleProps extends SkeletonProps {
  size?: number;
}

export function SkeletonCircle({
  size = 40,
  className = '',
  ...props
}: SkeletonCircleProps) {
  return (
    <Skeleton
      className={`skeleton-circle ${className}`}
      width={size}
      height={size}
      {...props}
    />
  );
}

// Button skeleton
interface SkeletonButtonProps extends SkeletonProps {
  variant?: 'default' | 'small' | 'large';
}

export function SkeletonButton({
  variant = 'default',
  className = '',
  ...props
}: SkeletonButtonProps) {
  const heights = {
    small: 32,
    default: 40,
    large: 48,
  };

  return (
    <Skeleton
      className={`skeleton-button ${className}`}
      height={heights[variant]}
      width={120}
      {...props}
    />
  );
}

// Guest list item skeleton
export function SkeletonGuestItem({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton-guest-item ${className}`}>
      <div className="skeleton skeleton-avatar" />
      <div className="skeleton-info">
        <Skeleton className="skeleton-text medium" />
        <Skeleton className="skeleton-text short" style={{ opacity: 0.6 }} />
      </div>
    </div>
  );
}

// Guest list skeleton
interface SkeletonGuestListProps {
  count?: number;
  className?: string;
}

export function SkeletonGuestList({
  count = 5,
  className = '',
}: SkeletonGuestListProps) {
  return (
    <div className={`skeleton-guest-list ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonGuestItem key={i} />
      ))}
    </div>
  );
}

// Dashboard stat card skeleton
export function SkeletonStatCard({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton-stat ${className}`}>
      <Skeleton className="skeleton-value" />
      <Skeleton className="skeleton-label" />
    </div>
  );
}

// Table row skeleton
export function SkeletonTableRow({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton-table-row ${className}`}>
      <Skeleton className="skeleton-circle" width={32} height={32} />
      <Skeleton className="skeleton-text long" />
      <Skeleton className="skeleton-text short" width={60} />
    </div>
  );
}

// Table skeleton
interface SkeletonTableProps {
  rows?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, className = '' }: SkeletonTableProps) {
  return (
    <div className={`skeleton-table ${className}`}>
      <div className="skeleton-table-header">
        <Skeleton className="skeleton-text medium" width={150} />
        <Skeleton className="skeleton-text short" width={80} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </div>
  );
}

// Optimization result skeleton
export function SkeletonOptimization({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton-optimization ${className}`}>
      <Skeleton className="skeleton-score-circle" />
      <div className="skeleton-breakdown">
        {['Constraints', 'Relationships', 'Groups', 'Capacity'].map((_, i) => (
          <div key={i} className="skeleton-breakdown-item">
            <Skeleton className="skeleton-text short" width={100} />
            <Skeleton className="skeleton-breakdown-bar" />
          </div>
        ))}
      </div>
      <Skeleton className="skeleton-button" width="100%" />
    </div>
  );
}

// Canvas table skeleton
interface SkeletonCanvasTableProps {
  x: number;
  y: number;
  width: number;
  height: number;
  shape?: 'round' | 'rectangle' | 'square';
}

export function SkeletonCanvasTable({
  x,
  y,
  width,
  height,
  shape = 'round',
}: SkeletonCanvasTableProps) {
  return (
    <div
      className={`skeleton-canvas-table ${shape}`}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
    />
  );
}

// Canvas skeleton with example tables
export function SkeletonCanvas({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton-canvas ${className}`}>
      <SkeletonCanvasTable x={100} y={100} width={120} height={120} shape="round" />
      <SkeletonCanvasTable x={300} y={80} width={180} height={80} shape="rectangle" />
      <SkeletonCanvasTable x={200} y={280} width={100} height={100} shape="square" />
    </div>
  );
}
