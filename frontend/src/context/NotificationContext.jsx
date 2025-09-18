import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { reminderService } from '../services/reminderService';
import { notificationService } from '../services/notificationService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const NotificationContext = createContext();

const MAX_NOTIFICATIONS = 10;

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);

  // Load notifications and reminders from backend
  useEffect(() => {
    const fetchInitial = async () => {
      if (!currentUser) return;

      // Fetch reminders from backend
      try {
        const backendReminders = await reminderService.getReminders();
        // Map backend format to frontend format
        const mappedReminders = backendReminders.map(rem => ({
          id: rem._id,
          type: rem.type, 
          description: rem.title || rem.description,
          amount: rem.amount,
          scheduledTime: rem.time,
          scheduledDate: rem.reminderTime ? new Date(rem.reminderTime).toISOString().split('T')[0] : undefined,
          active: rem.active,
          createdAt: rem.createdAt
        }));
        setReminders(mappedReminders);
      } catch (error) {
        console.error('Failed to load reminders:', error);
      }

      // Fetch notifications from backend 
      try {
        const data = await notificationService.fetchNotifications();
        setNotifications((data || []).slice(0, MAX_NOTIFICATIONS));
      } catch (e) {
        console.error('Failed to load notifications:', e);
      }
    };
    fetchInitial();

    // Listen for external events (e.g., new transaction created) to refresh notifications immediately
    const onTxCreated = async () => {
      try {
        const data = await notificationService.fetchNotifications();
        setNotifications((data || []).slice(0, MAX_NOTIFICATIONS));
      } catch (e) {
        console.error('Failed to refresh notifications after tx created:', e);
      }
    };
    window.addEventListener('transactions:created', onTxCreated);

    return () => window.removeEventListener('transactions:created', onTxCreated);
  }, [currentUser]);

  // Poll notifications periodically
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(async () => {
      try {
        const data = await notificationService.fetchNotifications();
        setNotifications((data || []).slice(0, MAX_NOTIFICATIONS));
      } catch (e) {}
    }, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);



  const addNotification = (notification) => {
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Keep only the latest 10 notifications
      return updated.slice(0, MAX_NOTIFICATIONS);
    });
  };

  const markAsRead = (notificationId) => {
    // Mark locally and send to backend
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    try {
      notificationService.markRead([notificationId]);
    } catch (e) {
      console.error('Failed to mark notification read:', e);
    }
  };

  const markAllAsRead = () => {
    const ids = notifications.filter(n => !n.read).map(n => n.id);
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    if (ids.length) notificationService.markRead(ids).catch(e => console.error('Failed to mark all as read', e));
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addReminder = async (reminder) => {
    try {
      // Map frontend data to backend format
      const reminderData = {
        type: reminder.type,
        title: reminder.description || 'Reminder',
        description: reminder.description,
        active: true,
        message: reminder.description || "Don't forget to add today's spending!"
      };

      // Handle different reminder types
      if (reminder.type === 'spending_limit') {
        reminderData.amount = parseFloat(reminder.amount);
      } else if (reminder.type === 'daily') {
        reminderData.time = reminder.scheduledTime || '17:00';
      } else if (reminder.type === 'custom') {
        reminderData.reminderTime = new Date(`${reminder.scheduledDate}T${reminder.scheduledTime}`).toISOString();
      }

      // Create reminder on backend
      const response = await reminderService.createReminder(reminderData);
      
      // Map backend response to frontend format for local state
      const newReminder = {
        id: response._id,
        type: response.type,
        description: response.title || response.description,
        amount: response.amount,
        scheduledTime: response.time,
        scheduledDate: response.reminderTime ? new Date(response.reminderTime).toISOString().split('T')[0] : undefined,
        active: response.active,
        createdAt: response.createdAt
      };

      setReminders(prev => [...prev, newReminder]);
      return newReminder.id;
    } catch (error) {
      console.error('Failed to create reminder:', error);
      throw error;
    }
  };

  const updateReminder = async (reminderId, updates) => {
    try {
      // Map frontend updates to backend format
      const reminderData = {
        active: updates.active,
        title: updates.description,
        description: updates.description
      };

      // Handle different reminder types based on the update
      if ('amount' in updates) {
        reminderData.amount = parseFloat(updates.amount);
      }
      if ('scheduledTime' in updates) {
        reminderData.time = updates.scheduledTime;
      }
      if (updates.scheduledDate && updates.scheduledTime) {
        reminderData.reminderTime = new Date(`${updates.scheduledDate}T${updates.scheduledTime}`).toISOString();
      }

      // Update on backend
      const response = await reminderService.updateReminder(reminderId, reminderData);
      
      // Map backend response to frontend format and update local state
      const updatedReminder = {
        id: response._id,
        type: response.type,
        description: response.title || response.description,
        amount: response.amount,
        scheduledTime: response.time,
        scheduledDate: response.reminderTime ? new Date(response.reminderTime).toISOString().split('T')[0] : undefined,
        active: response.active,
        createdAt: response.createdAt
      };

      setReminders(prev =>
        prev.map(reminder =>
          reminder.id === reminderId ? { ...reminder, ...updatedReminder } : reminder
        )
      );
    } catch (error) {
      console.error('Failed to update reminder:', error);
      throw error;
    }
  };

  const deleteReminder = async (reminderId) => {
    try {
      // Delete from backend
      await reminderService.deleteReminder(reminderId);
      
      // Update local state
      setReminders(prev =>
        prev.filter(reminder => reminder.id !== reminderId)
      );
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      throw error;
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  // Check for scheduled reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      reminders.forEach(reminder => {
        if (!reminder.active) return;
        
        if (reminder.type === 'custom' && reminder.scheduledDate) {
          const scheduledDate = new Date(reminder.scheduledDate);
          const timeDiff = Math.abs(now - scheduledDate);
          
          // If we're within 1 minute of the scheduled time
          if (timeDiff <= 60000 && scheduledDate <= now) {
            addNotification({
              type: 'reminder',
              title: 'Custom Reminder',
              message: reminder.description,
              category: 'reminder'
            });
            
            // Deactivate the reminder
            updateReminder(reminder.id, { active: false });
          }
        }
        
        if (reminder.type === 'daily' && reminder.time) {
          const [hours, minutes] = reminder.time.split(':');
          const scheduledTime = new Date();
          scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          const timeDiff = Math.abs(now - scheduledTime);
          
          // If we're within 1 minute of the scheduled time
          if (timeDiff <= 60000 && scheduledTime <= now) {
            const lastTriggered = localStorage.getItem(`daily_reminder_${reminder.id}_last`);
            const today = now.toDateString();
            
            if (lastTriggered !== today) {
              addNotification({
                type: 'reminder',
                title: 'Daily Reminder',
                message: "Don't forget to add today's spending!",
                category: 'reminder'
              });
              
              localStorage.setItem(`daily_reminder_${reminder.id}_last`, today);
            }
          }
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    
    // Check immediately
    checkReminders();
    
    return () => clearInterval(interval);
  }, [reminders]);

  const value = {
    notifications,
    reminders,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addReminder,
    updateReminder,
    deleteReminder,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
