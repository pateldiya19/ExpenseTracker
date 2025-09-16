import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/use-mobile';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { toast } from '../hooks/use-toast';
import { useWelcomeNotification } from '../hooks/useWelcomeNotification';
import { useWeeklySummary } from '../hooks/useWeeklySummary';
import { useSpendingLimitCheck } from '../hooks/useSpendingLimitCheck';
import { useNotifications } from '../context/NotificationContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Initialize notification hooks
  useWelcomeNotification();
  useWeeklySummary();
  useSpendingLimitCheck();

  useEffect(() => {
    function handleBalance(e) {
      try {
        const { userId, balance } = e.detail || {};
        const key = `reminders_${userId || 'anon'}`;
        const reminder = safeLocalStorageGet(key, null);
        if (!reminder) return;
        const threshold = reminder.thresholdMinor || 0;
        const type = reminder.type || 'above';
        const meets = type === 'above' ? balance >= threshold : balance <= threshold;
        if (meets) {
          toast({
            title: 'Balance Reminder',
            description: `Your balance is ${formatRupee(balance)} which ${type === 'above' ? 'exceeds' : 'is below'} your reminder threshold`,
          });
        }
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener('balanceUpdated', handleBalance);
    return () => window.removeEventListener('balanceUpdated', handleBalance);
  }, []);

  function formatRupee(minor) {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(minor / 100);
    } catch { return `₹${(minor/100).toFixed(2)}` }
  }

  // --- Sidebar layout mode: 'overlay' overlays the navbar, 'below-navbar' sits below fixed navbar ---
  // To switch modes, change the value below:
  const sidebarMode = 'overlay'; // 'overlay' or 'below-navbar'
  const navbarHeight = 64; // px, for below-navbar mode
  const [sidebarWidth, setSidebarWidth] = useState(240);

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Ambient gradient field */}
      <div className="pointer-events-none absolute inset-0 opacity-70 mix-blend-lighten [background:radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(circle_at_85%_35%,rgba(217,70,239,0.18),transparent_65%),radial-gradient(circle_at_50%_85%,rgba(34,211,238,0.15),transparent_60%)]" />
      {/* Enhanced grid overlay - more visible */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:40px_40px]" />
      {/* Diagonal accent lines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(-45deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:80px_80px]" />
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
        mode={sidebarMode}
        navbarHeight={navbarHeight}
        onSidebarWidthChange={setSidebarWidth}
      />

      <div
        className="flex-1 flex flex-col min-w-0"
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          ...(sidebarMode === 'below-navbar' ? { marginTop: navbarHeight } : {}),
          transition: 'margin 0.3s cubic-bezier(0.4,0,0.2,1)'
        }}
      >
        <TopBar
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}