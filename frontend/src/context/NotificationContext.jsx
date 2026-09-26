import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const formatNotificationTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  const timeNum = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  if (isNaN(timeNum)) return 'Just now';

  const diff = Date.now() - timeNum;
  if (diff < 60 * 1000) return 'Just now';
  if (diff < 60 * 60 * 1000) {
    const mins = Math.max(1, Math.floor(diff / (60 * 1000)));
    return `${mins}m ago`;
  }
  if (diff < 24 * 60 * 60 * 1000) {
    const hrs = Math.floor(diff / (60 * 60 * 1000));
    return `${hrs}h ago`;
  }
  if (diff < 48 * 60 * 60 * 1000) {
    return 'Yesterday';
  }
  const d = new Date(timeNum);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getDefaultNotifications = (userName) => [
  {
    id: 'welcome-alert',
    title: 'Welcome to Expense Tracker Pro',
    message: `Hello ${userName || 'User'}! Your financial activity and alert notifications will appear here.`,
    timestamp: Date.now() - 5 * 60 * 1000, // 5m ago
    unread: true,
    type: 'welcome',
  },
  {
    id: 'tip-alert',
    title: 'Quick Tip',
    message: 'You can export your transactions anytime using the "Export Data" button.',
    timestamp: Date.now() - 3600000, // 1h ago
    unread: true,
    type: 'tip',
  },
];

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const storageKey = user?._id ? `appNotifications_${user._id}` : 'appNotifications_guest';

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return getDefaultNotifications(user?.name);
  });

  // Re-sync notifications when authenticated user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        const defaults = getDefaultNotifications(user?.name);
        setNotifications(defaults);
        localStorage.setItem(storageKey, JSON.stringify(defaults));
      }
    } catch {
      setNotifications(getDefaultNotifications(user?.name));
    }
  }, [user?._id, user?.name, storageKey]);

  // Persist notifications on change
  const persistNotifications = (updated) => {
    setNotifications(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
  };

  const addNotification = ({ title, message, type = 'info' }) => {
    const newNotification = {
      id: String(Date.now()),
      title: title || 'Alert',
      message: message || '',
      timestamp: Date.now(),
      unread: true,
      type,
    };

    const updated = [newNotification, ...notifications.slice(0, 29)];
    persistNotifications(updated);
  };

  const markAsRead = (id) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, unread: false } : n));
    persistNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    persistNotifications(updated);
  };

  const clearAll = () => {
    persistNotifications([]);
  };

  const removeNotification = (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    persistNotifications(updated);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        removeNotification,
        formatNotificationTime,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
