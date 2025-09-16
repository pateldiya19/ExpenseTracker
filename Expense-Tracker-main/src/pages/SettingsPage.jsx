import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Shield, 
  Save
} from 'lucide-react';
import { exportTransactionsToCSV, getTransactions, getCategories } from '../utils/transactionUtils';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { currentUser, changePassword } = useAuth();
  const [pwLoading, setPwLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleExportData = () => {
    const transactions = getTransactions(currentUser?.id);
    const categories = getCategories();
    const result = exportTransactionsToCSV(transactions, categories);
    
    if (result.success) {
      toast.success('Data exported successfully!');
    } else {
      toast.error('Failed to export data');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwLoading(true);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match');
      setPwLoading(false);
      return;
    }
    const result = await changePassword(pwForm.oldPassword, pwForm.newPassword);
    if (result.success) {
      toast.success('Password changed successfully!');
      setShowPasswordForm(false);
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(result.error || 'Failed to change password');
    }
    setPwLoading(false);
  };


  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-heading font-bold mb-2 bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted">
          Manage your app preferences and data
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-indigo-300" />
            <span className="bg-gradient-to-r from-indigo-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">Data Management</span>
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {/* Export Data */}
            <div className="bg-card/5 rounded-lg p-4 border border-border/50">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <Download className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Export Data</h4>
                  <p className="text-sm text-muted">Download your transactions as CSV</p>
                </div>
              </div>
              <button
                onClick={handleExportData}
                className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Export CSV
              </button>
            </div>

          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Password</p>
                <p className="text-sm text-muted">Keep your account secure</p>
              </div>
              <button
                type="button"
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                onClick={() => setShowPasswordForm((v) => !v)}
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            {showPasswordForm && (
              <form className="mt-4 space-y-4" onSubmit={handlePasswordChange}>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Current Password</label>
                  <input
                    type="password"
                    className="block w-full px-3 py-2 bg-input border border-border/50 rounded-lg text-foreground"
                    value={pwForm.oldPassword}
                    onChange={e => setPwForm(f => ({ ...f, oldPassword: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
                  <input
                    type="password"
                    className="block w-full px-3 py-2 bg-input border border-border/50 rounded-lg text-foreground"
                    value={pwForm.newPassword}
                    onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                    minLength={8}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="block w-full px-3 py-2 bg-input border border-border/50 rounded-lg text-foreground"
                    value={pwForm.confirmPassword}
                    onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    minLength={8}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-600 hover:brightness-110 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow shadow-fuchsia-600/30"
                  >
                    <Save className="w-4 h-4" />
                    <span>{pwLoading ? 'Saving...' : 'Save Password'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}