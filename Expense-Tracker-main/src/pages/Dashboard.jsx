import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Receipt, TrendingUp, TrendingDown, User, ArrowRight } from 'lucide-react';
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

  // --- STATE MANAGEMENT for ASYNC DATA ---
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- DATA FETCHING with useEffect ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both transactions and categories at the same time
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

  // --- DERIVED DATA with useMemo ---
const { income, expenses, balance, recentTransactions, categoryMap } = useMemo(() => {
  // If loading or there's an error, return a default structure
  if (loading || error || !transactions || !categories) {
    return {
      income: 0,
      expenses: 0,
      balance: 0,
      recentTransactions: [],
      categoryMap: {},
    };
  }

  // This part remains the same
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

  // --- LOADING AND ERROR STATES ---
  if (loading) {
    return <div className="text-center p-10">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  // --- QUICK STATS (depends on derived data) ---
  const quickStats = [
    {
      label: 'Total Transactions',
      value: transactions.length,
      icon: Receipt,
      color: 'text-blue-400',
    },
    {
      label: 'Total Income',
      value: formatCurrency(income),
      icon: TrendingUp,
      color: 'text-green-400',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(expenses),
      icon: TrendingDown,
      color: 'text-red-400',
    },
  ];

  // --- RENDER ---
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BalanceCard balance={balance} income={income} expenses={expenses} />
          <TransactionChart transactions={transactions} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {quickStats.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="pro-card p-5 group cursor-pointer"
              >
                <div className="flex items-center space-x-4 w-full">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground opacity-80">{stat.label}</p>
                    <p className="font-bold text-foreground mt-1 text-lg">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <div className="flex flex-col h-full">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pro-card p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-foreground">Recent Transactions</h3>
              <Link to="/transactions" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center space-x-1 transition-colors">
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentTransactions && recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction._id || transaction.id} // Use _id from MongoDB
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between py-2 border-b border-border/30 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{transaction.note || 'No description'}</p>
                        <p className="text-xs text-muted">{categoryMap[transaction.category]?.name || transaction.category || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amountMinor)}
                      </p>
                      <p className="text-xs text-muted">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-muted text-sm">No transactions yet</p>
                  <Link to="/transactions/new" className="text-primary hover:text-primary/80 text-sm font-medium mt-2 inline-block">
                    Add your first transaction
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
          {/* Profile Card and other components can remain as they are */}
        </div>
      </div>
    </div>
  );
}