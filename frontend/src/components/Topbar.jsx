import { Bell, Menu, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

function Topbar({ onMenuClick }) {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const displayName = settings.fullName?.trim() || "Abdullah";

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && searchValue.trim()) {
      navigate(
        `/transactions?search=${encodeURIComponent(searchValue.trim())}`,
      );
    }
  };

  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar__hamburger"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      <div className="topbar__search">
        <Search size={16} />
        <input
          type="text"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search transactions"
          aria-label="Search transactions"
        />
      </div>

      <div className="topbar__actions">
        <button className="topbar__icon" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="user-pill">
          <span className="user-pill__avatar">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <span>{displayName}</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
