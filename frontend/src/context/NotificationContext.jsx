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
  const [notifications, setNotifications] = useState([]);
  const [toastAlert, setToastAlert] = useState(null); // { id, title, message, type }
  const isFetchingRef = useRef(false);
  const knownNotificationIdsRef = useRef(new Set());
  const initialLoadDoneRef = useRef(false);
  const toastTimeoutRef = useRef(null);

  // Helper to show a floating banner toast that auto-slides away after 4.5 seconds
  // Note: Toast disappearing does NOT delete the notification from the bell/dropdown!
  const showToast = useCallback((item) => {
    clearTimeout(toastTimeoutRef.current);
    setToastAlert(item);
    toastTimeoutRef.current = setTimeout(() => {
      setToastAlert(null);
    }, 4500);
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

        // Check for new incoming cross-user notifications to trigger toast
        if (initialLoadDoneRef.current) {
          const newIncoming = backendFormatted.filter(
            (b) => b.unread && !knownNotificationIdsRef.current.has(b.id)
          );
          if (newIncoming.length > 0) {
            // Trigger toast for the latest unread incoming item
            const latest = newIncoming[0];
            showToast({
              id: latest.id,
              title: latest.title,
              message: latest.message,
              type: latest.type,
            });
          }
        } else {
          initialLoadDoneRef.current = true;
        }

        // Update known IDs
        backendFormatted.forEach((b) => knownNotificationIdsRef.current.add(b.id));

        // Merge: keep any optimistic items that haven't completed POST yet
        setNotifications((prev) => {
          const tempPending = prev.filter((p) => String(p.id).startsWith('temp-'));
          const backendIds = new Set(backendFormatted.map((b) => String(b.id)));
          const uniqueTemps = tempPending.filter((t) => !backendIds.has(String(t.id)));
          return [...uniqueTemps, ...backendFormatted];
        });
      }
    } catch (err) {
      // Fallback silently if offline
    } finally {
      isFetchingRef.current = false;
    }
  }, [isAuthenticated, user?._id, showToast]);

  // Initial fetch and 3.5-second polling for responsive real-time updates across multiple accounts
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

  // Add persistent notification (saves to MongoDB and updates state)
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

    // Show floating toast immediately
    showToast(localItem);

    // Optimistically update notifications list
    setNotifications((prev) => [localItem, ...prev]);

    // Persist to MongoDB backend
    if (isAuthenticated) {
      try {
        const res = await api.post('/notifications', { title, message, type, metadata });
        if (res.data?._id) {
          const realId = res.data._id;
          knownNotificationIdsRef.current.add(realId);
          setNotifications((prev) =>
            prev.map((n) => (n.id === tempId ? { ...n, id: realId } : n))
          );
        }
      } catch (err) {
        console.error('Failed to persist notification:', err?.response?.data || err.message);
      }
    }
  };

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    try {
      if (!String(id).startsWith('temp-')) {
        await api.put(`/notifications/${id}/read`);
      }
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
    knownNotificationIdsRef.current.clear();
    try {
      await api.delete('/notifications');
    } catch {
      // Ignore network errors
    }
  };

  const removeNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    knownNotificationIdsRef.current.delete(id);
    try {
      if (!String(id).startsWith('temp-')) {
        await api.delete(`/notifications/${id}`);
      }
    } catch {
      // Ignore network errors
    }
  };

  const dismissToast = () => {
    setToastAlert(null);
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
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            background: 'var(--color-card, #0f172a)',
            color: 'var(--text-primary, #ffffff)',
            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
            borderLeft: '4px solid #38bdf8',
            borderRadius: 14,
            padding: '14px 18px',
            maxWidth: 420,
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.15)',
            animation: 'fadeInSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ fontSize: 20, lineHeight: 1 }}>🔔</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: 'var(--text-primary, #ffffff)',
                marginBottom: 2,
              }}
            >
              {toastAlert.title}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: 'var(--text-muted, #94a3b8)',
                lineHeight: 1.4,
              }}
            >
              {toastAlert.message}
            </div>
          </div>
          <button
            type="button"
            onClick={dismissToast}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted, #94a3b8)',
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: 1,
              padding: 2,
            }}
            title="Dismiss notification"
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
