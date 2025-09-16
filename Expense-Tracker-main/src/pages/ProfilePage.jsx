import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Mail, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

// Currency selection removed – app locked to INR.

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      // currency fixed to INR
      preferredCurrency: 'INR',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await updateProfile(data);
    if (result.success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-heading font-bold mb-2 bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
          Profile Settings
        </h1>
        <p className="text-muted">
          Manage your account information and preferences
        </p>
      </motion.div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-6"
      >
        {/* Avatar Section (display only) */}
        <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-border/50">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-fuchsia-600/30">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {currentUser?.name}
            </h3>
            <p className="text-muted">{currentUser?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-muted" />
              </div>
              <input
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                type="text"
                className="block w-full pl-10 pr-3 py-3 bg-input border border-border/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-muted transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-muted" />
              </div>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                className="block w-full pl-10 pr-3 py-3 bg-input border border-border/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-muted transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Currency (fixed) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Currency
            </label>
            <div className="p-3 bg-input border border-border/50 rounded-lg text-sm text-foreground">
              Indian Rupee (INR ₹)
            </div>
          </div>

          {/* Account Statistics */}
          <div className="bg-card/5 rounded-lg p-4 border border-border/50">
            <h4 className="text-sm font-medium text-foreground mb-3">Account Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted">Member since</span>
                <p className="text-foreground font-medium">January 2024</p>
              </div>
              <div>
                <span className="text-muted">Account status</span>
                <p className="text-green-400 font-medium">Active</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-border/50">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-600 hover:brightness-110 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow shadow-fuchsia-600/30"
            >
              <Save className="w-4 h-4" />
              <span>
                {loading ? 'Saving...' : 'Save Changes'}
              </span>
            </button>
          </div>
        </form>
      </motion.div>

      {/* Security section removed; moved to Settings */}
    </div>
  );
}