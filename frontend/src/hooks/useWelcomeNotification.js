import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const useWelcomeNotification = () => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (currentUser) {
      const welcomeShownKey = `welcome_shown_${currentUser.id}`;
      const welcomeShown = localStorage.getItem(welcomeShownKey);
      
      if (!welcomeShown) {
        // Add welcome notification after a short delay
        const timer = setTimeout(() => {
          addNotification({
            type: 'welcome',
            title: 'Welcome to ExpenseTracker! 👋',
            message: `Hi ${currentUser.name?.split(' ')[0] || 'there'}! We're excited to help you manage your finances. Start by adding your first transaction!`,
            category: 'system'
          });
          
          localStorage.setItem(welcomeShownKey, 'true');
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [currentUser, addNotification]);
};