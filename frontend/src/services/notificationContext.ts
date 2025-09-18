import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { reminderService } from '../services/reminderService';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext(null);

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

  // Load initial data when user changes
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

      // Fetch notifications
      try {
        const data = await notificationService.fetchNotifications();
        setNotifications((data || []).slice(0, MAX_NOTIFICATIONS));
      } catch (e) {
        console.error('Failed to load notifications:', e);
      }
    };
    
    fetchInitial();
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

  // Add a new reminder
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
      
      // Map backend response to frontend format
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

  // Update an existing reminder
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
      await reminderService.deleteReminder(reminderId);
      setReminders(prev => prev.filter(rem => rem.id !== reminderId));
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      throw error;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markRead([notificationId]);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const ids = notifications.filter(n => !n.read).map(n => n.id);
      if (ids.length) {
        await notificationService.markRead(ids);
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  const value = {
    notifications,
    reminders,
    addReminder,
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