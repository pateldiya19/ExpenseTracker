import { motion } from 'framer-motion';
import { Bell, CheckCircle2, Trash2, Clock, MessageSquare, TrendingUp } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationsPage() {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications 
  } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'welcome':
        return '👋';
      case 'summary':
        return <TrendingUp className="w-5 h-5 text-white" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-white" />;
      case 'spending_limit':
        return '💰';
      default:
        return <Bell className="w-5 h-5 text-white" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-muted mt-1">View and manage system messages</p>
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <button 
              onClick={markAllAsRead} 
              className="px-4 py-2 text-xs rounded-lg bg-card/5 hover:bg-card/10 text-foreground transition-colors"
            >
              Mark all read
            </button>
            <button 
              onClick={clearAllNotifications} 
              className="px-4 py-2 text-xs rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear all
            </button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-6"
      >
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-10 h-10 text-muted mx-auto mb-4" />
            <p className="text-muted">No notifications yet</p>
            <p className="text-sm text-muted/70 mt-2">You'll see welcome messages, reminders, and summaries here</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {notifications.map((notification, i) => (
              <motion.li
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={`py-4 flex items-start gap-4 ${!notification.read ? 'bg-card/5 rounded-lg px-4 -mx-4' : 'px-0'}`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-600 flex items-center justify-center flex-shrink-0">
                  {typeof getNotificationIcon(notification.type) === 'string' ? (
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  ) : (
                    getNotificationIcon(notification.type)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{notification.title}</h3>
                    {!notification.read && <span className="inline-block w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{notification.message}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-muted">
                    <span>{formatTime(notification.timestamp)}</span>
                    <button 
                      onClick={() => markAsRead(notification.id)} 
                      className="uppercase tracking-wide hover:text-foreground transition-colors"
                    >
                      {notification.read ? 'Read' : 'Mark Read'}
                    </button>
                    <button 
                      onClick={() => deleteNotification(notification.id)} 
                      className="uppercase tracking-wide hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {notification.read && <CheckCircle2 className="w-4 h-4 text-green-400 mt-1" />}
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
