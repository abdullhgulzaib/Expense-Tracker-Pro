import { Bell, Search } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

function Topbar() {
  const { settings } = useSettings();
  const displayName = settings.fullName?.trim() || 'Abdullah';

  return (
    <header className="topbar">
      <div className="topbar__search">
        <Search size={16} />
        <input type="text" placeholder="Search transactions" aria-label="Search transactions" />
      </div>

      <div className="topbar__actions">
        <button className="topbar__icon" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="user-pill">
          <span className="user-pill__avatar">{displayName.charAt(0).toUpperCase()}</span>
          <span>{displayName}</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
