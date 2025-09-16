import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const useWeeklySummary = () => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  const calculateWeeklySummary = (transactions) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= weekAgo && transactionDate <= now;
    });

    const income = weeklyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = weeklyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses, transactionCount: weeklyTransactions.length };
  };

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

  useEffect(() => {
    if (!currentUser) return;

    const checkWeeklySummary = () => {
      const lastSummaryKey = `weekly_summary_last_${currentUser.id}`;
      const lastSummaryDate = localStorage.getItem(lastSummaryKey);
      const now = new Date();
      const currentWeek = getWeekNumber(now);
      
      // Check if we should send weekly summary (once per week, on Sunday)
      if (!lastSummaryDate || getWeekNumber(new Date(lastSummaryDate)) !== currentWeek) {
        if (now.getDay() === 0) { // Sunday
          const transactions = safeLocalStorageGet(`transactions_${currentUser.id}`, []);
          const summary = calculateWeeklySummary(transactions);
          
          if (summary.transactionCount > 0) {
            const netAmount = summary.income - summary.expenses;
            const netText = netAmount >= 0 
              ? `saved ${formatRupee(netAmount)}` 
              : `overspent by ${formatRupee(Math.abs(netAmount))}`;

            addNotification({
              type: 'summary',
              title: 'Weekly Summary 📊',
              message: `This week: ${formatRupee(summary.income)} income, ${formatRupee(summary.expenses)} expenses. You ${netText}.`,
              category: 'summary'
            });
          }
          
          localStorage.setItem(lastSummaryKey, now.toISOString());
        }
      }
    };

    // Check immediately and then every hour
    checkWeeklySummary();
    const interval = setInterval(checkWeeklySummary, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [currentUser, addNotification]);

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };
};