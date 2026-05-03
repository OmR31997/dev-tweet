import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, handleFirestoreError, OperationType, fetchNotifications, markNotificationRead, clearNotifications } from '../apiClient';
import { getSocket } from '../socketClient';
import { Notification } from '../types';
import { Bell, Heart, MessageCircle, UserPlus, CheckCircle, UserMinus, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PageLoader from './ui/PageLoader';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    let mounted = true;
    const load = async () => {
      try {
        const notifs = (await fetchNotifications()) as Notification[];
        if (mounted) setNotifications(notifs);
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'notifications');
        if (mounted) setLoading(false);
      }
    };
    void load();
    const onFocus = () => void load();
    window.addEventListener('focus', onFocus);

    const socket = getSocket();
    const handleCreated = () => void load();
    const handleReconnect = () => void load();
    socket?.on('notification.created', handleCreated);
    socket?.io.on('reconnect', handleReconnect);

    return () => {
      mounted = false;
      window.removeEventListener('focus', onFocus);
      socket?.off('notification.created', handleCreated);
      socket?.io.off('reconnect', handleReconnect);
    };
  }, [auth.currentUser?.uid]);

  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications/' + id);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0 || clearing) return;
    if (!window.confirm('Clear all notifications?')) return;
    setClearing(true);
    try {
      await clearNotifications();
      setNotifications([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'notifications/clear');
    } finally {
      setClearing(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={18} className="text-primary" fill="currentColor" />;
      case 'comment':
        return <MessageCircle size={18} className="text-black" />;
      case 'follow':
        return <UserPlus size={18} className="text-black" />;
      case 'unfollow':
        return <UserMinus size={18} className="text-black" />;
      case 'follow_accept':
        return <Check size={18} className="text-black" />;
      case 'message':
        return <MessageCircle size={18} className="text-black" />;
      case 'post':
        return <Bell size={18} className="text-black" />;
      default:
        return <Bell size={18} className="text-muted" />;
    }
  };

  if (loading) {
    return <PageLoader variant="notifications" />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <motion.div
        className="surface-card flex items-center justify-between p-4 sm:p-5"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="heading text-lg sm:text-xl">Notifications</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleClearAll()}
            disabled={notifications.length === 0 || clearing}
            className="btn-secondary px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
          >
            {clearing ? 'Clearing...' : 'Clear all'}
          </button>
          <Bell size={20} className="text-muted" strokeWidth={1.75} />
        </div>
      </motion.div>

      {notifications.length > 0 ? (
        notifications.map((notif, i) => (
          <motion.button
            key={notif.id}
            type="button"
            onClick={() => !notif.read && markAsRead(notif.id)}
            className={`surface-card flex w-full min-w-0 cursor-pointer items-start gap-3 p-3 text-left sm:gap-4 sm:p-4 ${
              !notif.read
                ? 'surface-card-active border-primary/40 bg-primary/15'
                : ''
            }`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: notif.read ? 0.75 : 1, y: 0 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 28 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.995 }}
          >
            <div className="shrink-0 rounded-xl bg-black/5 p-2.5">{getIcon(notif.type)}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-normal leading-snug text-[var(--text-primary)] sm:text-base">
                <span className="font-semibold">{notif.senderName}</span>
                {notif.type === 'like' && ' liked your post'}
                {notif.type === 'comment' && ' commented on your post'}
                {notif.type === 'follow' && ' started following you'}
                {notif.type === 'unfollow' && ' unfollowed you'}
                {notif.type === 'follow_accept' && ' followed you back'}
                {notif.type === 'message' && ' sent you a message'}
                {notif.type === 'post' && ' posted a new update'}
              </p>
              <p className="mt-1 text-xs text-muted">
                {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt as unknown as string)) + ' ago' : 'Just now'}
              </p>
            </div>
            {!notif.read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary shadow-sm" />}
          </motion.button>
        ))
      ) : (
        <motion.div
          className="surface-card p-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CheckCircle size={44} className="mx-auto mb-3 text-black/20" strokeWidth={1.25} />
          <p className="heading text-muted text-base">You're all caught up</p>
        </motion.div>
      )}
    </div>
  );
}
