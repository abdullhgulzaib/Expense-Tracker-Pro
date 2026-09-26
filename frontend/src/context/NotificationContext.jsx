import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

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
    message: `Hello ${userName || 'User'}! Your cross-user proof verifications and alert notifications will appear here.`,
    timestamp: Date.now() - 5 * 60 * 1000,
    unread: false,
    type: 'welcome',
  },
];

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const isFetchingRef = useRef(false);

  // Fetch real-time notifications from MongoDB backend
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?._id || isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      const res = await api.get('/notifications');
      if (Array.isArray(res.data)) {
        const formatted = res.data.map((n) => ({
          id: n._id || String(n.createdAt),
          title: n.title,
          message: n.message,
          timestamp: new Date(n.createdAt).getTime(),
          unread: Boolean(n.unread),
          type: n.type || 'info',
          metadata: n.metadata,
        }));
        setNotifications(formatted);
      }
    } catch (err) {
      // Fallback silently if offline
    } finally {
      isFetchingRef.current = false;
    }
  }, [isAuthenticated, user?._id]);

  // Initial fetch and 8-second polling for true real-time cross-user notifications
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 8000);
      return () => clearInterval(interval);
    } else {
      setNotifications(getDefaultNotifications(''));
    }
  }, [isAuthenticated, fetchNotifications]);

  const addNotification = async ({ title, message, type = 'info' }) => {
    const localItem = {
      id: String(Date.now()),
      title: title || 'Alert',
      message: message || '',
      timestamp: Date.now(),
      unread: true,
      type,
    };
    setNotifications((prev) => [localItem, ...prev]);
  };

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    try {
      await api.put(`/notifications/${id}/read`);
    } catch {
      // Ignore network errors
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    try {
      await api.put('/notifications/read-all');
    } catch {
      // Ignore network errors
    }
  };

  const clearAll = async () => {
    setNotifications([]);
    try {
      await api.delete('/notifications');
    } catch {
      // Ignore network errors
    }
  };

  const removeNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await api.delete(`/notifications/${id}`);
    } catch {
      // Ignore network errors
    }
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
        refetchNotifications: fetchNotifications,
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
