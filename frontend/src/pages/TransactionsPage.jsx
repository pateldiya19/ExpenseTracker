import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Filter, Download, Edit, Trash2, TrendingUp, TrendingDown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getTransactions, 
  getCategories, 
  deleteTransaction, 
  restoreTransaction, 
  exportTransactionsToCSV 
} from '../utils/transactionUtils';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    categoryId: '',
    startDate: '',
    endDate: '',
  });
  const [deletedTransactions, setDeletedTransactions] = useState(new Set());
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transData, catData] = await Promise.all([
          getTransactions(currentUser?.id),
          getCategories(),
        ]);
        setTransactions(transData);
        setCategories(catData);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load transactions or categories');
      }
    };

    if (currentUser) fetchData();
  }, [currentUser]);

  // Map categories for easy lookup
  const categoryMap = useMemo(() => {
    return categories.reduce((map, cat) => {
      map[cat._id] = cat;
      return map;
    }, {});
  }, [categories]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        // Skip deleted transactions
        if (deletedTransactions.has(tx.id)) return false;

        // Type filter
        if (filters.type && tx.type !== filters.type) return false;

        // Category filter
        if (filters.categoryId && tx.category !== filters.categoryId) return false;

        // Search filter
        if (searchTerm) {
          const note = tx.note || '';
          if (!note.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        }

        // Date filter (normalize time to 00:00:00)
        const txDate = new Date(tx.date);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;

        if (startDate && txDate.setHours(0,0,0,0) < startDate.setHours(0,0,0,0)) return false;
        if (endDate && txDate.setHours(0,0,0,0) > endDate.setHours(0,0,0,0)) return false;

        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filters, searchTerm, deletedTransactions]);

  const filteredCategoriesByType = useMemo(() => {
    return categories.filter(cat => !filters.type || cat.type === filters.type);
  }, [categories, filters.type]);

  // Delete & Undo
  const handleDelete = (transactionId) => {
    const result = deleteTransaction(transactionId);
    if (result.success) {
      setDeletedTransactions(prev => new Set([...prev, transactionId]));

      toast('Transaction deleted', {
        action: {
          label: 'Undo',
          onClick: () => handleRestore(transactionId),
        },
        duration: 5000,
      });

      setTimeout(() => {
        setDeletedTransactions(prev => {
          const newSet = new Set(prev);
          newSet.delete(transactionId);
          return newSet;
        });
      }, 5000);
    } else {
      toast.error('Failed to delete transaction');
    }
  };

  const handleRestore = (transactionId) => {
    const result = restoreTransaction(transactionId);
    if (result.success) {
      setDeletedTransactions(prev => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        return newSet;
      });
      toast.success('Transaction restored');
    } else {
      toast.error('Failed to restore transaction');
    }
  };

  const handleExport = () => {
    const result = exportTransactionsToCSV(filteredTransactions, categories);
    if (result.success) toast.success('Transactions exported successfully');
    else toast.error('Failed to export transactions');
  };

  const clearFilters = () => {
    setFilters({ type: '', categoryId: '', startDate: '', endDate: '' });
    setSearchTerm('');
  };

  const hasActiveFilters = Object.values(filters).some(v => v) || searchTerm;

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <button
            onClick={handleExport}
            className="inline-flex items-center space-x-2 bg-card/5 hover:bg-card/10 text-foreground px-4 py-2 rounded-lg font-medium transition-colors border border-border/50"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <Link
            to="/app/transactions/new"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-600 hover:brightness-110 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow shadow-fuchsia-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </Link>
        </div>
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-input border border-border/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-muted transition-all duration-200"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showFilters ? 'bg-primary text-primary-foreground' : 'bg-card/5 hover:bg-card/10 text-foreground'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="self-start sm:self-auto text-muted hover:text-foreground text-sm font-medium transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-border/50"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={e => setFilters(prev => ({ ...prev, type: e.target.value, categoryId: '' }))}
                    className="block w-full px-3 py-2 bg-input border border-border/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                  >
                    <option value="">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                  <select
                    value={filters.categoryId}
                    onChange={e => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="block w-full px-3 py-2 bg-input border border-border/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                  >
                    <option value="">All Categories</option>
                    {filteredCategoriesByType.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="block w-full px-3 py-2 bg-input border border-border/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="block w-full px-3 py-2 bg-input border border-border/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-sm text-muted"
      >
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-border/30">
            {filteredTransactions.map((tx, index) => {
              const category = categoryMap[tx.category];
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 hover:bg-card/5 transition-colors"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {tx.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{tx.note || 'No description'}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                          <span className="text-sm text-muted truncate">{category?.name || 'Unknown Category'}</span>
                          <span className="text-sm text-muted">{new Date(tx.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right min-w-[5.5rem]">
                        <p className={`font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type === 'income' ? '+' : '-'}{tx.amountMinor / 100}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link to={`/app/transactions/${tx.id}/edit`} className="p-1 text-muted hover:text-foreground transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1 text-muted hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-card/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No transactions found</h3>
            <p className="text-muted mb-4">
              {hasActiveFilters ? 'Try adjusting your search and filters' : 'Start by adding your first transaction'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
