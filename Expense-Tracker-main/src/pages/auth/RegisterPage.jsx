import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, User, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await signup(data);
    
    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/app/dashboard');
    } else {
      toast.error(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2 bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
            Create account
          </h1>
          <p className="text-muted">Start tracking your expenses today</p>
        </div>

        {/* Registration Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full name
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
                Email address
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

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-muted" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-10 pr-10 py-3 bg-input border border-border/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-muted transition-all duration-200"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-muted hover:text-foreground transition-colors" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted hover:text-foreground transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-600 hover:brightness-110 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow shadow-fuchsia-600/30"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-border mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-muted">
              Already have an account?{' '}
              <Link 
                to="/auth/login" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
            <div className="mt-4 pt-4 border-t border-border/50">
              <Link 
                to="/" 
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}