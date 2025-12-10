import { useStore } from '../store/useStore';
import { version } from '../../package.json';
import { UpdatesButton } from './UpdatesPopup';
import './Header.css';

interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  const { event, setEventName } = useStore();

  return (
    <header className="header">
      <div className="header-left">
        <h1
          className="logo"
          onClick={onLogoClick}
          style={{ cursor: onLogoClick ? 'pointer' : 'default' }}
          title="Back to home"
        >TableCraft</h1>
        <span className="version-badge">v{version}</span>
        <UpdatesButton variant="header" />
        <div className="event-info">
          <input
            type="text"
            value={event.name}
            onChange={(e) => setEventName(e.target.value)}
            className="event-name-input"
          />
        </div>
      </div>
    </header>
  );
}
