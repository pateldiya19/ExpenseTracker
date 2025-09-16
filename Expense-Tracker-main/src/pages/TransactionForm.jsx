import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowLeft, IndianRupee, Calendar, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getTransaction, 
  saveTransaction, 
  getCategories
} from '../utils/transactionUtils';
import { toast } from 'sonner';

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'digital_wallet', label: 'Digital Wallet' },
  { value: 'check', label: 'Check' },
  { value: 'other', label: 'Other' },
];

export default function TransactionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const isEditing = Boolean(id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: 'expense',
      amountMinor: '',
      categoryId: '',
      note: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'card',
    },
  });

  const watchType = watch('type');

  useEffect(() => {
    const loadData = async () => {
      try {
        setPageLoading(true);
        const cats = await getCategories();
        setCategories(cats);

        if (isEditing) {
          const transaction = await getTransaction(id);
          if (transaction) {
            setValue('type', transaction.type);
            setValue('amountMinor', (transaction.amountMinor / 100).toString());
            setValue('categoryId', transaction.category); // this should be the _id string
            setValue('note', transaction.note || '');
            setValue('date', new Date(transaction.date).toISOString().split('T')[0]);
            setValue('paymentMethod', transaction.paymentMethod || 'card');
          } else {
            toast.error('Transaction not found');
            navigate('/app/transactions');
          }
        }
      } catch (err) {
        toast.error("Failed to load form data.");
        navigate('/app/transactions');
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [id, isEditing, setValue, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const transactionData = {
        note: data.note,
        type: data.type,
        amountMinor: Math.round(parseFloat(data.amountMinor) * 100),
        date: new Date(data.date).toISOString(),
        category: data.categoryId,
        paymentMethod: data.paymentMethod,
      };

      if (isEditing) {
        transactionData.id = id;
      }

      await saveTransaction(transactionData);
      toast.success(isEditing ? 'Transaction updated!' : 'Transaction created!');
      navigate('/app/transactions');
    } catch (error) {
      toast.error(error.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === watchType);

  if (pageLoading) {
    return <div className="p-10 text-center">Loading form...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-4 mb-6"
      >
        <Link
          to="/app/transactions"
          className="p-2 hover:bg-card/5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
          </h1>
          <p className="text-muted">
            {isEditing ? 'Update transaction details' : 'Record a new income or expense'}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-6"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative">
                <input
                  {...register('type', { required: 'Type is required' })}
                  type="radio"
                  value="expense"
                  className="sr-only peer"
                />
                <div className="p-4 border border-border/50 rounded-lg cursor-pointer transition-all peer-checked:border-red-400 peer-checked:bg-red-400/10 hover:border-border">
                  <p className="font-medium text-foreground">Expense</p>
                </div>
              </label>
              <label className="relative">
                <input
                  {...register('type', { required: 'Type is required' })}
                  type="radio"
                  value="income"
                  className="sr-only peer"
                />
                <div className="p-4 border border-border/50 rounded-lg cursor-pointer transition-all peer-checked:border-green-400 peer-checked:bg-green-400/10 hover:border-border">
                  <p className="font-medium text-foreground">Income</p>
                </div>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IndianRupee className="w-5 h-5 text-muted" />
              </div>
              <input
                {...register('amountMinor', { required: 'Amount is required', valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="block w-full pl-10 pr-3 py-3 bg-input border border-border/50 rounded-lg"
              />
            </div>
            {errors.amountMinor && <p className="mt-2 text-sm text-destructive">{errors.amountMinor.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="w-5 h-5 text-muted" />
              </div>
              <select
                {...register('categoryId', { required: 'Category is required' })}
                className="block w-full pl-10 pr-3 py-3 bg-input border border-border/50 rounded-lg"
              >
                <option value="">Select a category</option>
                {filteredCategories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.categoryId && <p className="mt-2 text-sm text-destructive">{errors.categoryId.message}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-5 h-5 text-muted" />
              </div>
              <input
                {...register('date', { required: 'Date is required' })}
                type="date"
                className="block w-full pl-10 pr-3 py-3 bg-input border border-border/50 rounded-lg"
              />
            </div>
            {errors.date && <p className="mt-2 text-sm text-destructive">{errors.date.message}</p>}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Note (Optional)</label>
            <textarea
              {...register('note')}
              rows={3}
              placeholder="Add a description..."
              className="block w-full px-3 py-3 bg-input border border-border/50 rounded-lg"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-border/50">
            <Link to="/app/transactions" className="px-6 py-3 border border-border/50 text-foreground hover:bg-card/5 rounded-lg font-medium">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white font-medium rounded-lg"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Transaction' : 'Create Transaction')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
