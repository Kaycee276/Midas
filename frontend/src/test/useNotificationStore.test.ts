import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '../stores/useNotificationStore';

describe('useNotificationStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useNotificationStore.getState().clearAll();
  });

  it('initializes with empty notifications', () => {
    const { notifications, unreadCount } = useNotificationStore.getState();
    expect(notifications).toEqual([]);
    expect(unreadCount).toBe(0);
  });

  it('adds a new notification and increments unreadCount', () => {
    useNotificationStore.getState().addNotification({
      id: 'test-1',
      type: 'payment',
      title: 'Payment Confirmed',
      message: 'Deposit of ₦5,000 received',
      timestamp: new Date().toISOString(),
    });

    const state = useNotificationStore.getState();
    expect(state.notifications.length).toBe(1);
    expect(state.unreadCount).toBe(1);
    expect(state.notifications[0].title).toBe('Payment Confirmed');
    expect(state.notifications[0].read).toBe(false);
  });

  it('marks a specific notification as read', () => {
    useNotificationStore.getState().addNotification({
      id: 'test-1',
      type: 'payment',
      title: 'Payment Confirmed',
      message: 'Deposit received',
      timestamp: new Date().toISOString(),
    });

    useNotificationStore.getState().markAsRead('test-1');
    const state = useNotificationStore.getState();
    expect(state.unreadCount).toBe(0);
    expect(state.notifications[0].read).toBe(true);
  });

  it('marks all as read and clears notifications', () => {
    useNotificationStore.getState().addNotification({
      id: 'test-1',
      type: 'payment',
      title: 'Payment 1',
      message: 'Deposit 1',
      timestamp: new Date().toISOString(),
    });
    useNotificationStore.getState().addNotification({
      id: 'test-2',
      type: 'investment',
      title: 'Investment 2',
      message: 'Investment 2',
      timestamp: new Date().toISOString(),
    });

    expect(useNotificationStore.getState().unreadCount).toBe(2);

    useNotificationStore.getState().markAllAsRead();
    expect(useNotificationStore.getState().unreadCount).toBe(0);
    expect(useNotificationStore.getState().notifications.every((n) => n.read)).toBe(true);

    useNotificationStore.getState().clearAll();
    expect(useNotificationStore.getState().notifications).toEqual([]);
    expect(useNotificationStore.getState().unreadCount).toBe(0);
  });
});
