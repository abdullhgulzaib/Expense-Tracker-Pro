import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const getDefaultNotifications = (userName) => [
  {
    id: 'welcome-alert',
    title: 'Welcome to Expense Tracker Pro',
    message: `Hello ${userName || 'User'}! Your financial activity and alert notifications will appear here.`,
    time: 'Just now',
    timestamp: Date.now(),
    unread: true,
    type: 'welcome',
  },
  {
    id: 'tip-alert',
    title: 'Quick Tip',
    message: 'You can export your transactions anytime using the "Export Data" button.',
    time: '1h ago',
    timestamp: Date.now() - 3600000,
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
      time: 'Just now',
      timestamp: Date.now(),
      unread: true,
      type,
    };

    const updated = [newNotification, ...notifications.slice(0, 29)]; // Keep max 30 items
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

export default NotificationContext;
