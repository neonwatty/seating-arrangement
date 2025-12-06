import { useStore } from '../store/useStore';
import './ViewToggle.css';

interface ViewToggleProps {
  showRelationships?: boolean;
  onToggleRelationships?: () => void;
}

export function ViewToggle({ showRelationships, onToggleRelationships }: ViewToggleProps) {
  const { activeView, setActiveView } = useStore();
  const isCanvasView = activeView === 'canvas';

  return (
    <div className="view-toggle-container">
      <div className="view-toggle-switch">
        <button
          className={`toggle-option ${isCanvasView ? 'active' : ''}`}
          onClick={() => setActiveView('canvas')}
        >
          Canvas
        </button>
        <button
          className={`toggle-option ${!isCanvasView ? 'active' : ''}`}
          onClick={() => setActiveView('guests')}
        >
          Guest List
        </button>
      </div>
      {onToggleRelationships && (
        <button
          className={`toggle-option relationships ${showRelationships ? 'active' : ''}`}
          onClick={onToggleRelationships}
        >
          Relationships
        </button>
      )}
    </div>
  );
}
