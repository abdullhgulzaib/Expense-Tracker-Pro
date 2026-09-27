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

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const storageKey = user?._id ? `et_notifications_${user._id}` : 'et_notifications_guest';

  // Load from localStorage on initialization so notifications are instantly available across reloads
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastAlert, setToastAlert] = useState(null); // { id, title, message, type }
  const isFetchingRef = useRef(false);
  const knownNotificationIdsRef = useRef(new Set());
  const initialLoadDoneRef = useRef(false);

  // Sync with localStorage whenever user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        parsed.forEach((n) => knownNotificationIdsRef.current.add(String(n.id)));
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    }
  }, [storageKey]);

  // Persistent Toast Notification Banner:
  // Strictly remains visible until the user explicitly dismisses it (NO auto-clear timeout!)
  const showToast = useCallback((item) => {
    setToastAlert(item);
  }, []);

  const dismissToast = useCallback(() => {
    setToastAlert(null);
  }, []);

  // Fetch real-time notifications from MongoDB backend
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?._id || isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      const res = await api.get('/notifications');
      if (Array.isArray(res.data)) {
        const backendFormatted = res.data.map((n) => ({
          id: n._id || String(n.createdAt),
          title: n.title,
          message: n.message,
          timestamp: new Date(n.createdAt).getTime(),
          unread: Boolean(n.unread),
          type: n.type || 'info',
          metadata: n.metadata || {},
        }));

        // Detect new unread incoming notifications
        if (initialLoadDoneRef.current) {
          const newIncoming = backendFormatted.filter(
            (b) => b.unread && !knownNotificationIdsRef.current.has(String(b.id))
          );
          if (newIncoming.length > 0) {
            // Display toast banner - remains on screen until user dismisses!
            showToast(newIncoming[0]);
          }
        } else {
          initialLoadDoneRef.current = true;
        }

        // Update known IDs
        backendFormatted.forEach((b) => knownNotificationIdsRef.current.add(String(b.id)));

        // Merge backend list with any local items
        setNotifications((prev) => {
          const tempPending = prev.filter((p) => String(p.id).startsWith('temp-'));
          const backendIds = new Set(backendFormatted.map((b) => String(b.id)));
          const uniqueTemps = tempPending.filter((t) => !backendIds.has(String(t.id)));
          const merged = [...uniqueTemps, ...backendFormatted];
          try {
            localStorage.setItem(storageKey, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch (err) {
      // Offline fallback: keep existing localStorage notifications intact
    } finally {
      isFetchingRef.current = false;
    }
  }, [isAuthenticated, user?._id, showToast, storageKey]);

  // Polling for responsive real-time updates across multiple accounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 3500);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      knownNotificationIdsRef.current.clear();
      initialLoadDoneRef.current = false;
    }
  }, [isAuthenticated, fetchNotifications]);

  // Add persistent notification
  const addNotification = async ({ title, message, type = 'info', metadata = {} }) => {
    const tempId = 'temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    const localItem = {
      id: tempId,
      title: title || 'Alert',
      message: message || '',
      timestamp: Date.now(),
      unread: true,
      type,
      metadata,
    };

    // Show floating toast banner immediately - stays until explicitly dismissed
    showToast(localItem);

    // Optimistically update notifications list and save to localStorage
    setNotifications((prev) => {
      const updated = [localItem, ...prev];
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Persist to MongoDB backend
    if (isAuthenticated) {
      try {
        const res = await api.post('/notifications', { title, message, type, metadata });
        if (res.data?._id) {
          const realId = res.data._id;
          knownNotificationIdsRef.current.add(String(realId));
          setNotifications((prev) => {
            const updated = prev.map((n) => (n.id === tempId ? { ...n, id: realId } : n));
            try {
              localStorage.setItem(storageKey, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      } catch (err) {
        console.error('Failed to persist notification:', err?.response?.data || err.message);
      }
    }
  };

  const markAsRead = async (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, unread: false } : n));
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      if (!String(id).startsWith('temp-')) {
        await api.put(`/notifications/${id}/read`);
      }
    } catch {
      // Ignore network errors
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, unread: false }));
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      await api.put('/notifications/read-all');
    } catch {
      // Ignore network errors
    }
  };

  const clearAll = async () => {
    setNotifications([]);
    knownNotificationIdsRef.current.clear();
    setToastAlert(null);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    try {
      await api.delete('/notifications');
    } catch {
      // Ignore network errors
    }
  };

  const removeNotification = async (id) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    knownNotificationIdsRef.current.delete(String(id));
    if (toastAlert && toastAlert.id === id) {
      setToastAlert(null);
    }
    try {
      if (!String(id).startsWith('temp-')) {
        await api.delete(`/notifications/${id}`);
      }
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
        toastAlert,
        dismissToast,
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
      {/* Global Real-Time Notification Banner Toast */}
      {toastAlert && (
        <div
          className="notification-banner-toast"
          role="alert"
          aria-live="assertive"
        >
          <div className="notification-banner-toast__icon">🔔</div>
          <div className="notification-banner-toast__content">
            <div className="notification-banner-toast__title">
              {toastAlert.title}
            </div>
            <div className="notification-banner-toast__message">
              {toastAlert.message}
            </div>
          </div>
          <button
            type="button"
            onClick={dismissToast}
            className="notification-banner-toast__close"
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}
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
