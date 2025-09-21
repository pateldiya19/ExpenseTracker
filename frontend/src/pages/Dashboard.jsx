import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Receipt, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getTransactions,
  getCategories,
  calculateBalance,
  getRecentTransactions,
  formatCurrency
} from '../utils/transactionUtils';
import BalanceCard from '../components/BalanceCard';
import TransactionChart from '../components/TransactionChart';

export default function Dashboard() {
  const { currentUser } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.id) return;

      try {
        setLoading(true);
        const [transData, catData] = await Promise.all([
          getTransactions(currentUser.id),
          getCategories()
        ]);

        setTransactions(Array.isArray(transData) ? transData : []);
        setCategories(Array.isArray(catData) ? catData : []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Could not load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Safe memoized calculations
  const { income, expenses, balance, recentTransactions, categoryMap } = useMemo(() => {
    const safeTransactions = transactions || [];
    const safeCategories = categories || [];

    const income = safeTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + (tx.amountMinor || 0), 0);

    const expenses = safeTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + (tx.amountMinor || 0), 0);

    const balance = calculateBalance(safeTransactions);
    const recentTransactions = getRecentTransactions(safeTransactions, 5);

    const categoryMap = safeCategories.reduce((map, cat) => {
      map[cat.id] = cat;
      return map;
    }, {});

    return { income, expenses, balance, recentTransactions, categoryMap };
  }, [transactions, categories]);

  if (!currentUser) {
    return <div className="text-center p-10 text-gray-700 dark:text-gray-300">Loading user info...</div>;
  }

  if (loading) {
    return <div className="text-center p-10 text-gray-700 dark:text-gray-300">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top: Balance */}
      <BalanceCard
        balance={balance}
        income={income}
        expenses={expenses}
        className="bg-white dark:bg-gray-800 shadow-md"
        textClass="text-gray-800 dark:text-gray-100"
      />

      {/* Middle: Charts + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <TransactionChart
            transactions={transactions}
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg"
          />
        </div>

        {/* Recent Transactions */}
        <div className="flex flex-col h-full">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-gray-800 dark:text-gray-100">
                Recent Transactions
              </h3>
              <Link
                to="/app/transactions"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.id || tx._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          tx.type === 'income'
                            ? 'bg-green-100 dark:bg-green-900'
                            : 'bg-red-100 dark:bg-red-900'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          {tx.note || 'No description'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {categoryMap[tx.categoryId]?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          tx.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amountMinor)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No transactions yet</p>
                  <Link
                    to="/app/transactions/new"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium mt-2 inline-block"
                  >
                    Add your first transaction
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
