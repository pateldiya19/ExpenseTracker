import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Settings,
  TrendingUp,
  X,
  Bell,
  Bell as BellIcon,
  AlarmClock
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: Receipt,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    name: 'Set Reminder',
    href: '/set-reminder',
    icon: AlarmClock,
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
];

import { useEffect } from 'react';
export default function Sidebar({ open, onToggle, isMobile, mode = 'overlay', navbarHeight = 64, onSidebarWidthChange }) {
  // mode: 'overlay' or 'below-navbar'.
  // navbarHeight: px value for below-navbar mode.
  const [isHovered, setIsHovered] = useState(false);
  const expanded = isMobile ? open : isHovered;
  const sidebarId = 'sidebar-fixed-rail';

  // Notify parent of sidebar width for dynamic margin
  useEffect(() => {
    if (onSidebarWidthChange) {
      onSidebarWidthChange(expanded ? 240 : 64);
    }
  }, [expanded, onSidebarWidthChange]);

  // Layout mode switch (see comments below)
  // --- Overlay mode (sidebar overlays navbar, fixed at top:0) ---
  // --- Below-navbar mode (sidebar starts below navbar, fixed at top:navbarHeight) ---
  const fixedStyles = mode === 'overlay'
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 2000,
      }
    : {
        position: 'fixed',
        top: navbarHeight,
        left: 0,
        height: `calc(100vh - ${navbarHeight}px)`,
        zIndex: 2000,
      };

  return (
    <>
      <motion.div
        id={sidebarId}
        style={fixedStyles}
        className={`icon-rail border-r border-border/50 flex flex-col bg-background shadow-lg
          ${expanded ? '' : 'items-center'}
        `}
        animate={{
          width: expanded ? 240 : 64,
          x: isMobile && !open ? -240 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        tabIndex={-1}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          {/* Logo reveal: show only icon when collapsed, icon+text when expanded */}
          <AnimatePresence mode="wait">
            {expanded ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="font-heading font-semibold text-foreground">
                  ExpenseTracker
                </span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                {/* Only show the TrendingUp icon in the gradient box when collapsed */}
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Pin/Unpin toggle for desktop */}
          {/* Pin/unpin button removed to eliminate extra icon in header */}
          {isMobile && (
            <button
              onClick={onToggle}
              aria-label="Close sidebar"
              aria-expanded={open}
              className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4 text-muted" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 flex flex-col overflow-y-auto focus:outline-none" tabIndex={-1}>
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href.startsWith('/app') ? item.href : `/app${item.href}`}
                  onClick={() => {
                    if (isMobile) onToggle();
                  }}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm sidebar-active-pill'
                        : 'text-muted hover:bg-white/5 hover:text-foreground'
                    }`
                  }
                  tabIndex={0}
                >
                  <item.icon className={`flex-shrink-0 w-5 h-5 ${expanded ? 'mr-3' : 'mx-auto'}`} />
                  <AnimatePresence mode="wait">
                    {expanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-4 text-[10px] text-center text-muted/60">
            <span className="tracking-wider">© {new Date().getFullYear()}</span>
          </div>
        </nav>
      </motion.div>
    </>
  );
}