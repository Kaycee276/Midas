import { create } from 'zustand';

export interface AppNotification {
  id: string;
  type: 'payment' | 'investment' | 'dividend' | 'kyc' | 'general';
  title: string;
  message: string;
  amount?: number;
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const STORAGE_KEY = 'midas_notifications';

function loadStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotifications(notifications: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 30)));
  } catch {
    // Storage full or unavailable
  }
}

const initialNotifications = loadStoredNotifications();

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: initialNotifications,
  unreadCount: initialNotifications.filter((n) => !n.read).length,

  addNotification: (notif) => {
    set((state) => {
      // Prevent duplicates if already present
      if (state.notifications.some((n) => n.id === notif.id)) {
        return state;
      }
      const newNotification: AppNotification = { ...notif, read: false };
      const updated = [newNotification, ...state.notifications].slice(0, 30);
      saveNotifications(updated);
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(updated);
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return {
        notifications: updated,
        unreadCount: 0,
      };
    });
  },

  clearAll: () => {
    saveNotifications([]);
    set({ notifications: [], unreadCount: 0 });
  },
}));
