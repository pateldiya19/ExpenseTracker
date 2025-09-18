import { useState } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export default function NotificationBell() {
  const { notifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const unreadCount = getUnreadCount();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'welcome':
        return '👋';
      case 'summary':
        return '📊';
      case 'reminder':
        return '⏰';
      case 'spending_limit':
        return '💰';
      default:
        return '📢';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-card/5 transition-colors relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-muted" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-primary text-[10px] leading-4 font-medium text-white rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[999999]">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.2 }}
              className="fixed right-4 top-16 w-80 max-h-[80vh] bg-background border border-border/50 rounded-lg shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/5">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <>
                      <button
                        onClick={markAllAsRead}
                        className="p-1.5 rounded-md hover:bg-card/10 transition-colors"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-4 h-4 text-muted" />
                      </button>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/app/notifications');
                        }}
                        className="p-1.5 rounded-md hover:bg-card/10 transition-colors"
                        title="Open notifications page"
                      >
                        <ArrowRight className="w-4 h-4 text-muted" />
                      </button>
                      <button
                        onClick={clearAllNotifications}
                        className="p-1.5 rounded-md hover:bg-card/10 transition-colors"
                        title="Clear all"
                      >
                        <Trash2 className="w-4 h-4 text-muted" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-md hover:bg-card/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-muted" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-border/30 hover:bg-card/5 transition-colors ${
                        !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-foreground">
                                {notification.title}
                              </h4>
                              <p className="text-xs text-muted mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted/70 mt-1">
                                {formatTime(notification.timestamp)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 rounded hover:bg-card/10 transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3 text-primary" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 rounded hover:bg-card/10 transition-colors"
                                title="Delete"
                              >
                                <X className="w-3 h-3 text-muted" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}