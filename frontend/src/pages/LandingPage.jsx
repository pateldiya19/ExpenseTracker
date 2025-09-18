import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Shield, 
  PieChart, 
  Smartphone,
  ChevronRight,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const features = [
  {
    icon: TrendingUp,
    title: 'Track Expenses Easily',
    description: 'Add income and expenses, organize by category, and keep things simple.',
  },
  {
    icon: PieChart,
    title: 'Simple Charts',
    description: 'See basic summaries and charts to understand where money goes.',
  },
  {
    icon: Shield,
    title: 'Data Stays Local',
    description: 'This demo stores data in your browser’s local storage—no servers.',
  },
  {
    icon: Smartphone,
    title: 'Responsive UI',
    description: 'Works well on phones, tablets, and desktops.',
  },
];

// Testimonials and marketing stats removed per request

export default function LandingPage() {
  const { setTheme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleCheckDemo = async () => {
    const result = await login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
    if (result.success) {
      toast.success('Logged in to demo');
      navigate('/app/dashboard');
    } else {
      toast.error(result.error || 'Demo login failed');
    }
  };
  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f17] via-[#0d1421] to-[#121b2d] text-foreground">
      {/* Navigation */}
  <nav className="sticky top-0 z-50 backdrop-blur-lg bg-black/40 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow shadow-fuchsia-500/40">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-300 via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">ExpenseTracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth/login" className="text-gray-300 hover:text-white font-medium transition-colors">
                Sign In
              </Link>
              <Link to="/auth/register">
                <Button className="bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:from-indigo-400 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-fuchsia-600/30">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.25),transparent_60%),radial-gradient(circle_at_75%_40%,rgba(217,70,239,0.25),transparent_65%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Take Control of Your
                <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-fuchsia-400 bg-clip-text text-transparent"> Finances</span>
              </h1>
              <p className="text-xl text-gray-300 mt-6 leading-relaxed max-w-xl">
                Track your income and expenses quickly. View simple summaries and charts to understand your spending.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link to="/auth/register">
                    <Button size="lg" className="bg-card/95 text-indigo-600 hover:bg-card px-8 py-4 text-lg font-semibold shadow">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button onClick={handleCheckDemo} variant="outline" size="lg" className="px-8 py-4 text-lg border-border/50 text-gray-200 hover:bg-card/10">
                    <CheckCircle className="mr-2 w-5 h-5" /> 
                    Check Demo
                </Button>
              </div>
              <div className="flex items-center mt-8 space-x-6">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-600 border-2 border-indigo-300/30 flex items-center justify-center text-white text-sm font-medium shadow shadow-fuchsia-600/30">
                      {i}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Try the demo — no signup needed</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#1c2536]/80 via-[#1a2232]/70 to-[#141c29]/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-400/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full shadow shadow-green-400/40"></div>
                      <span className="font-medium text-gray-100">Salary Income</span>
                    </div>
                    <span className="text-green-400 font-bold">+₹5,200</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-400/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-400 rounded-full shadow shadow-red-400/40"></div>
                      <span className="font-medium text-gray-100">Rent Payment</span>
                    </div>
                    <span className="text-red-400 font-bold">-₹1,200</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-400/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full shadow shadow-blue-400/40"></div>
                      <span className="font-medium text-gray-100">Groceries</span>
                    </div>
                    <span className="text-blue-400 font-bold">-₹350</span>
                  </div>
                </div>
              </div>
              
              {/* Floating stats */}
              <div className="absolute -top-4 -right-4 rounded-lg shadow-lg p-4 border border-border/50 bg-[#1d2635] backdrop-blur-xl">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Monthly Savings</p>
                    <p className="font-bold text-green-400">+23%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section removed */}

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-[#101927] via-[#111d2c] to-[#0d1421]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
              Everything you need to manage your finances
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Powerful features designed to give you complete control over your financial life.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="rounded-xl p-6 bg-[#1a2332]/70 backdrop-blur-xl border border-border/50 shadow-lg hover:shadow-fuchsia-500/20 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center mb-4 shadow-md shadow-fuchsia-600/30">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section removed */}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to take control of your finances?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already managing their expenses smarter with ExpenseTracker.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-card/95 text-indigo-600 hover:bg-card px-8 py-4 text-lg font-semibold shadow">
                <Link to="/auth/register">
                  Start Your Free Trial
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border/50 text-white hover:bg-card/10 px-8 py-4 text-lg">
                <Link to="/auth/login">Sign In</Link>
              </Button>
            </div>
            <p className="text-blue-100 mt-4 text-sm">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
  <footer className="bg-[#0b111b] text-white py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow shadow-fuchsia-600/30">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-lg font-bold">ExpenseTracker</span>
              </div>
              <p className="text-gray-400 text-sm">
                Smart expense tracking for better financial decisions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 ExpenseTracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}