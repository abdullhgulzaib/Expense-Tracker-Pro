import { Bell, Menu, Search, LogOut, User, Shield } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";

function Topbar({ onMenuClick }) {
  const { settings } = useSettings();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = user?.name?.trim() || settings.fullName?.trim() || "User";
  const userEmail = user?.email || "user@expensetracker.pro";

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && searchValue.trim()) {
      navigate(
        `/transactions?search=${encodeURIComponent(searchValue.trim())}`,
      );
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
        <button className="topbar__icon" aria-label="Notifications" title="Notifications">
          <Bell size={18} />
        </button>

        {/* User Pill & Dropdown */}
        <div 
          className="user-pill" 
          ref={dropdownRef} 
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          title="Account options"
        >
          <span className="user-pill__avatar">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <span>{displayName}</span>

          {isDropdownOpen && (
            <div className="user-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="user-dropdown__header">
                <div className="user-dropdown__name">{displayName}</div>
                <div className="user-dropdown__email">{userEmail}</div>
              </div>

              <button
                type="button"
                className="user-dropdown__item"
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/settings');
                }}
              >
                <User size={15} />
                <span>Preferences</span>
              </button>

              <button
                type="button"
                className="user-dropdown__item"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
