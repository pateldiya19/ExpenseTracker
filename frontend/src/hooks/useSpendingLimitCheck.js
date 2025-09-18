import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getTransactions } from '../utils/transactionUtils';
import { toast } from './use-toast';

export const useSpendingLimitCheck = () => {
  const { currentUser } = useAuth();
  const { addNotification, reminders } = useNotifications();
  
  // We no longer need to fetch transactions here, as this hook should
  // ideally receive transactions as an argument to be more reusable.
  // However, to fix it with minimal changes, we'll fetch inside.

  const formatRupee = (amount) => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount / 100);
    } catch {
      return `₹${(amount / 100).toFixed(2)}`;
    }
  };

  const calculateTotalSpending = (transactions) => {
    // Add a guard clause to ensure transactions is an array
    if (!Array.isArray(transactions)) {
      return 0;
    }
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= startOfMonth)
      .reduce((total, t) => total + (t.amountMinor || 0), 0);
  };

  useEffect(() => {
    if (!currentUser) return;

    // Make the function async to await the API call
    const checkSpendingLimits = async () => {
      try {
        // Await the promise to get the actual array of transactions
        const transactions = await getTransactions(); 
        const totalSpending = calculateTotalSpending(transactions);
        
        const spendingLimitReminders = reminders.filter(
          r => r.type === 'spending_limit' && r.active
        );

        spendingLimitReminders.forEach(reminder => {
          const limitAmount = reminder.amount * 100;
          const lastNotifiedKey = `spending_limit_notified_${reminder.id}`;
          const lastNotified = localStorage.getItem(lastNotifiedKey);
          const currentMonth = new Date().getMonth();
          const lastNotifiedMonth = lastNotified ? new Date(lastNotified).getMonth() : -1;
          
          if (totalSpending >= limitAmount && currentMonth !== lastNotifiedMonth) {
            addNotification({
              type: 'spending_limit',
              title: 'Spending Limit Exceeded! 💰',
              message: `You've spent ${formatRupee(totalSpending)} this month, which exceeds your limit of ${formatRupee(limitAmount)}.`,
              category: 'alert'
            });
            toast({ title: 'Spending Limit Exceeded', description: `You've spent ${formatRupee(totalSpending)} this month (limit ${formatRupee(limitAmount)}).` });
            // Fire a custom event so other components (e.g., a global modal) can react
            window.dispatchEvent(new CustomEvent('notifications:spending_limit_exceeded', { detail: { totalSpending, limitAmount } }));
            localStorage.setItem(lastNotifiedKey, new Date().toISOString());
          }
        });
      } catch (error) {
          console.error("Error checking spending limits:", error);
      }
    };

    // Call the async function
    checkSpendingLimits();

    // The 'balanceUpdated' event is likely obsolete now.
    // This effect will re-run whenever 'reminders' change, which is a better pattern.

  }, [currentUser, reminders, addNotification]); // Dependencies are correct
};