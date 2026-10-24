import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  DollarSign,
  TrendingUp,
  Percent,
  ShieldCheck,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { socket } from '../../lib/socket';
import { useAuth } from '../../stores/useAuthStore';
import { useNotificationStore, type AppNotification } from '../../stores/useNotificationStore';

export const NotificationBell: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll } =
    useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join', user.id);

    const handleNewNotification = (notif: Omit<AppNotification, 'read'>) => {
      addNotification(notif);
      toast.success(`${notif.title}: ${notif.message}`, {
        duration: 4000,
        position: 'top-right',
      });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [isAuthenticated, user?.id, addNotification]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isAuthenticated) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="h-4 w-4 text-(--success)" />;
      case 'investment':
        return <TrendingUp className="h-4 w-4 text-(--warning)" />;
      case 'dividend':
        return <Percent className="h-4 w-4 text-(--accent-primary)" />;
      case 'kyc':
        return <ShieldCheck className="h-4 w-4 text-(--info)" />;
      default:
        return <Info className="h-4 w-4 text-(--text-secondary)" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-lg border border-(--border) p-2 text-(--text-secondary) hover:bg-(--bg-secondary) hover:text-(--text) transition-colors"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Real-time notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-(--accent-primary) px-1 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-(--border) bg-(--bg) p-3 shadow-2xl z-50">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-(--border)">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-(--text)">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-(--accent-primary)/10 px-2 py-0.5 text-[10px] font-semibold text-(--accent-primary)">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={() => markAllAsRead()}
                    className="p-1 text-xs text-(--text-secondary) hover:text-(--text) rounded hover:bg-(--bg-secondary)"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => clearAll()}
                    className="p-1 text-xs text-(--text-secondary) hover:text-(--error) rounded hover:bg-(--bg-secondary)"
                    title="Clear all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-(--text-secondary)">
                <Bell className="mx-auto h-6 w-6 opacity-30 mb-2" />
                <p>No notifications yet</p>
                <p className="text-[11px] mt-1 opacity-70">
                  Real-time payment and activity alerts will appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`flex items-start gap-3 rounded-lg p-2.5 text-left transition-colors cursor-pointer ${
                    item.read
                      ? 'bg-transparent hover:bg-(--bg-secondary)/50 opacity-70'
                      : 'bg-(--bg-secondary) hover:bg-(--bg-secondary)/80'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 rounded-md bg-(--bg) p-1.5 border border-(--border)">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-(--text) truncate">{item.title}</p>
                      <span className="text-[10px] text-(--text-secondary) shrink-0">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-(--text-secondary) leading-relaxed mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                  {!item.read && (
                    <span className="h-2 w-2 rounded-full bg-(--accent-primary) shrink-0 self-center" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
