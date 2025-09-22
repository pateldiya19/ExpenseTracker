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
      try {
        setLoading(true);
        const [transData, catData] = await Promise.all([
          getTransactions(),
          getCategories()
        ]);
        setTransactions(transData);
        setCategories(catData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Could not load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const { income, expenses, balance, recentTransactions, categoryMap } = useMemo(() => {
    if (loading || error || !transactions || !categories) {
      return { income: 0, expenses: 0, balance: 0, recentTransactions: [], categoryMap: {} };
    }

    const income = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amountMinor, 0);

    const expenses = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amountMinor, 0);

    const balance = calculateBalance(transactions);
    const recentTransactions = getRecentTransactions(transactions, 5);

    const categoryMap = categories.reduce((map, cat) => {
      map[cat.id] = cat;
      return map;
    }, {});

    return { income, expenses, balance, recentTransactions, categoryMap };
  }, [transactions, categories, loading, error]);

  if (loading) {
    return <div className="text-center p-10">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top: Balance */}
      <BalanceCard balance={balance} income={income} expenses={expenses} />

      {/* Middle: Charts (left) + Recent Transactions (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <TransactionChart transactions={transactions} />
        </div>

        {/* Recent Transactions */}
        <div className="flex flex-col h-full">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card rounded-2xl shadow p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-foreground">
                Recent Transactions
              </h3>
              <Link
                to="/app/transactions"
                className="text-primary hover:text-primary/80 text-sm font-medium flex items-center space-x-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentTransactions && recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction._id || transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between py-2 border-b border-border/30 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === 'income'
                            ? 'bg-green-100'
                            : 'bg-red-100'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {transaction.note || 'No description'}
                        </p>
                        <p className="text-xs text-muted">
                          {categoryMap[transaction.category]?.name ||
                            transaction.category ||
                            'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          transaction.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amountMinor)}
                      </p>
                      <p className="text-xs text-muted">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-muted text-sm">No transactions yet</p>
                  <Link
                    to="/app/transactions/new"
                    className="text-primary hover:text-primary/80 text-sm font-medium mt-2 inline-block"
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
