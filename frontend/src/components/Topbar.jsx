import { Bell, Menu, Search, LogOut, User, ChevronDown, CheckCheck, Trash2, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

function Topbar({ onMenuClick }) {
  const { settings } = useSettings();
  const { user, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
  } = useNotifications();

  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const displayName = settings.fullName?.trim() || user?.name?.trim() || "User";
  const userEmail = settings.email?.trim() || user?.email || "user@expensetracker.pro";

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && searchValue.trim()) {
      navigate(
        `/transactions?search=${encodeURIComponent(searchValue.trim())}`,
      );
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate("/login");
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'expense':
      case 'expense-add':
        return '💳';
      case 'expense-edit':
        return '✏️';
      case 'expense-delete':
        return '🗑️';
      case 'export':
        return '📊';
      case 'welcome':
        return '👋';
      case 'alert':
      case 'spike':
        return '⚠️';
      case 'tip':
        return '💡';
      default:
        return '🔔';
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
        {/* Notification Bell & Dropdown */}
        <div className="notification-wrapper" ref={notificationRef}>
          <button
            type="button"
            className={`topbar__icon ${isNotificationOpen ? 'topbar__icon--active' : ''}`}
            aria-label="Notifications"
            title="Notifications"
            onClick={() => {
              setIsNotificationOpen((prev) => !prev);
              setIsDropdownOpen(false);
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-dot" />}
          </button>

          {isNotificationOpen && (
            <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="notification-dropdown__header">
                <div className="notification-dropdown__title-row">
                  <span className="notification-dropdown__title">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount} new</span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="notification-action-btn"
                    onClick={clearAll}
                    title="Clear all notifications"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="notification-dropdown__list">
                {notifications.length === 0 ? (
                  <div className="notification-dropdown__empty">
                    <p>No notifications right now.</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`notification-item ${item.unread ? 'notification-item--unread' : ''}`}
                      onClick={() => markAsRead(item.id)}
                    >
                      <div className="notification-item__icon">
                        {getNotificationIcon(item.type)}
                      </div>
                      <div className="notification-item__content">
                        <div className="notification-item__header">
                          <span className="notification-item__title">{item.title}</span>
                          <span className="notification-item__time">{item.time}</span>
                        </div>
                        <p className="notification-item__message">{item.message}</p>
                      </div>
                      <button
                        type="button"
                        className="notification-item__dismiss"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(item.id);
                        }}
                        title="Dismiss"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {unreadCount > 0 && (
                <div className="notification-dropdown__footer">
                  <button
                    type="button"
                    className="notification-mark-all-btn"
                    onClick={markAllAsRead}
                  >
                    <CheckCheck size={14} />
                    <span>Mark all as read</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Pill & Floating Dropdown */}
        <div 
          className={`user-pill ${isDropdownOpen ? 'user-pill--active' : ''}`}
          ref={dropdownRef} 
          onClick={() => {
            setIsDropdownOpen((prev) => !prev);
            setIsNotificationOpen(false);
          }}
          title="Account menu"
          role="button"
          tabIndex={0}
        >
          <span className="user-pill__avatar">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <span className="user-pill__name">{displayName}</span>
          <ChevronDown size={14} className={`user-pill__chevron ${isDropdownOpen ? 'rotate-180' : ''}`} />

          {isDropdownOpen && (
            <div className="user-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="user-dropdown__header">
                <div className="user-dropdown__name">{displayName}</div>
                <div className="user-dropdown__email" title={userEmail}>{userEmail}</div>
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
                <span>Account Preferences</span>
              </button>

              <button
                type="button"
                className="user-dropdown__item user-dropdown__item--danger"
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
