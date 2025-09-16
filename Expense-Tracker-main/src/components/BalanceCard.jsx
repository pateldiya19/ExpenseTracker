import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../utils/transactionUtils';

export default function BalanceCard({ balance, income, expenses }) {
  const isPositive = balance >= 0;
  const incomeAmount = income || 0;
  const expenseAmount = expenses || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="balance-card p-6 relative overflow-hidden"
    >
      {/* Gradient overlay for enhanced visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <h3 className="text-white/95 text-sm font-medium">Total Balance</h3>
          <p className="text-xs text-white/75">Current account balance</p>
        </div>
        <div className="w-12 h-12 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
          <IndianRupee className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Balance Amount */}
      <div className="mb-6 relative z-10">
        <motion.h2
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-3xl sm:text-4xl font-heading font-bold text-white mb-3 drop-shadow-sm"
        >
          {formatCurrency(balance, 'INR')}
        </motion.h2>
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          isPositive 
            ? 'bg-green-500/20 text-green-100' 
            : 'bg-red-500/20 text-red-100'
        }`}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{isPositive ? 'Positive' : 'Negative'} Balance</span>
        </div>
      </div>

      {/* Income & Expenses */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-300" />
            </div>
            <span className="text-white/90 text-sm font-medium">Income</span>
          </div>
          <p className="text-white font-semibold text-lg">
            {formatCurrency(incomeAmount, 'INR')}
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 bg-red-400/20 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-300" />
            </div>
            <span className="text-white/90 text-sm font-medium">Expenses</span>
          </div>
          <p className="text-white font-semibold text-lg">
            {formatCurrency(expenseAmount, 'INR')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}