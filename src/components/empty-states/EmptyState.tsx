import './EmptyState.css';

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
  variant?: 'default' | 'compact' | 'inline' | 'canvas-empty';
  className?: string;
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  if (variant === 'inline') {
    return (
      <div className={`empty-state inline ${className}`}>
        <div className="empty-state-illustration">
          {illustration}
        </div>
        <div className="empty-state-content">
          <h3 className="empty-state-title">{title}</h3>
          <p className="empty-state-description">{description}</p>
          <div className="empty-state-actions">
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
        </div>
      </div>
    );
  }

  return (
    <div className={`empty-state ${variant} ${className}`}>
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
