import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getTransactions,
  getCategories,
  deleteTransaction,
  filterTransactions,
  exportTransactionsToCSV,
  formatCurrency
} from '../utils/transactionUtils';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const { currentUser } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: '', categoryId: '', startDate: '', endDate: '' });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [transData, catData] = await Promise.all([
        getTransactions(currentUser?.id),
        getCategories()
      ]);
      setTransactions(Array.isArray(transData) ? transData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      console.log('transactions:', transData);
      console.log('categories:', catData);
    } catch (err) {
      setError('Failed to load data.');
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  const filteredTransactions = useMemo(() => {
    if (loading || !Array.isArray(transactions)) return [];
    const searchFilters = { ...filters, search: searchTerm };
    return filterTransactions(transactions, searchFilters)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filters, searchTerm, loading]);

  // Map categories by name string for lookup, since tx.category is name string
  const categoryMap = useMemo(() => {
    if (loading || !Array.isArray(categories)) return {};
    return categories.reduce((map, cat) => {
      map[cat.name] = cat;
      return map;
    }, {});
  }, [categories, loading]);

  // Debug mapping check
  console.log('mapped categories:', filteredTransactions.map(tx => ({
    id: tx._id || tx.id,
    category: tx.category,
    categoryName: categoryMap[tx.category]?.name || 'Unknown'
  })));

  const handleDelete = async (transactionId) => {
    try {
      await deleteTransaction(transactionId);
      toast.success('Transaction deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleExport = () => {
    const result = exportTransactionsToCSV(filteredTransactions, categories);
    if (result.success) {
      toast.success('Transactions exported successfully');
    } else {
      toast.error('Failed to export transactions');
    }
  };

  const clearFilters = () => {
    setFilters({ type: '', categoryId: '', startDate: '', endDate: '' });
    setSearchTerm('');
  };

  const hasActiveFilters = Object.values(filters).some(value => value) || searchTerm;

  if (loading) return <div className="p-10 text-center">Loading transactions...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

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
            Transactions
          </h1>
          <p className="text-muted mt-1">Manage your income and expenses</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 sm:mt-0">
          <button onClick={handleExport} className="inline-flex items-center space-x-2 bg-card/5 hover:bg-card/10 text-foreground px-4 py-2 rounded-lg font-medium transition-colors border border-border/50">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <Link to="/app/transactions/new" className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-600 hover:brightness-110 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow shadow-fuchsia-600/30">
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </Link>
        </div>
      </motion.div>

      <ul>
        {filteredTransactions.length === 0 ? (
          <li className="text-gray-500 p-4">No transactions found.</li>
        ) : (
          filteredTransactions.map(tx => (
            <li key={tx._id || tx.id} className="border-b border-gray-300 py-3 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-semibold">{tx.note || "No description"}</span>
                <span className="text-sm text-gray-600">{categoryMap[tx.category]?.name || "Unknown Category"}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className={`font-semibold ${tx.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                  {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amountMinor)}
                </span>
                <span className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
