import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Plus, User, LogOut, Sun, Moon, AlarmClock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { createPortal } from 'react-dom';
import NotificationBell from './notifications/NotificationBell';

export default function TopBar({ onSidebarToggle, sidebarOpen }) {
  const { currentUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userButtonRef = useRef(null);
  const userMenuRef = useRef(null);
  const interactionRef = useRef(false);
  const [buttonRect, setButtonRect] = useState(null);

  useEffect(() => {
    if (showUserMenu && userButtonRef.current) {
      const rect = userButtonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }
  }, [showUserMenu]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If we're interacting inside the menu, don't close it
      if (interactionRef.current) return;
      const clickTarget = event.target;
      const clickedTrigger = userButtonRef.current?.contains(clickTarget);
      const clickedMenu = userMenuRef.current?.contains(clickTarget);
      if (!clickedTrigger && !clickedMenu) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu]);

  // Hide theme toggle on landing page
  const isLandingPage = location.pathname === '/';

  return (
    <header className="sticky top-0 z-[100] glass-card border-b border-border/50 px-6 py-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onSidebarToggle}
            className="p-2 rounded-lg hover:bg-card/5 transition-colors md:hidden"
          >
            <Menu className="w-5 h-5 text-muted" />
          </button>
          
          <div className="hidden md:block">
            <h1 className="text-xl font-heading font-semibold text-foreground">
              Good morning, {currentUser?.name?.split(' ')[0]}!
            </h1>
            <p className="text-sm text-muted">Here's your financial overview</p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Quick Add Button */}
          <Link
            to="/app/transactions/new"
            className="hidden sm:flex items-center space-x-2 bg-gradient-primary hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </Link>

          {/* Mobile Quick Add */}
          <Link
            to="/app/transactions/new"
            className="sm:hidden p-2 bg-gradient-primary hover:opacity-90 text-white rounded-lg transition-all duration-200 shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </Link>

          {/* Theme Toggle (hidden on landing page) */}
          {!isLandingPage && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-card/5 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-muted" />
              ) : (
                <Moon className="w-5 h-5 text-muted" />
              )}
            </button>
          )}


          {/* Reminder Alarm Icon */}
          <button
            onClick={() => {
              if (location.pathname !== '/app/set-reminder') navigate('/app/set-reminder');
            }}
            className="p-2 rounded-lg hover:bg-card/5 transition-colors"
            title="Set Reminder"
          >
            <AlarmClock className="w-5 h-5 text-primary" />
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          <div className="relative">
            <button
              ref={userButtonRef}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-card/5 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-foreground">
                {currentUser?.name}
              </span>
            </button>

            {showUserMenu && buttonRect && createPortal(
              <AnimatePresence>
                <motion.div
                  ref={userMenuRef}
                  onMouseDown={() => { interactionRef.current = true; }}
                  onMouseUp={() => { setTimeout(() => { interactionRef.current = false; }, 0); }}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="fixed w-48 glass-card border border-border/50 rounded-lg shadow-lg bg-background backdrop-blur-sm"
                  style={{
                    top: buttonRect.bottom + 8,
                    right: window.innerWidth - buttonRect.right,
                    zIndex: 1000001,
                  }}
                >
                  <div className="p-2">
                      <button
                        onClick={() => {
                          navigate('/app/profile');
                          setTimeout(() => setShowUserMenu(false), 100);
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-foreground hover:bg-card/5 rounded-md transition-colors"
                        data-testid="go-to-profile"
                      >
                        <User className="w-4 h-4" />
                        <span>Go to Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          navigate('/auth/login');
                          setTimeout(() => setShowUserMenu(false), 100);
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 mt-1 text-sm text-foreground hover:bg-card/5 rounded-md transition-colors"
                        data-testid="sign-out"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                  </div>
                </motion.div>
              </AnimatePresence>,
              document.body
            )}
          </div>
        </div>
      </div>
    </header>
  );
}