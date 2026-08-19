import { Bell, Search } from 'lucide-react';

function Topbar() {
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
          <span className="user-pill__avatar">A</span>
          <span>Abdullah</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
