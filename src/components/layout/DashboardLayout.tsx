import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../../hooks/useAuth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { pendingOrdersCount, showLoginToast, dismissLoginToast } = useAuth();

  useEffect(() => {
    if (showLoginToast) {
      const timer = setTimeout(() => {
        dismissLoginToast();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [showLoginToast, dismissLoginToast]);

  return (
    <div className="flex min-h-screen bg-[#F6F1EB] text-[#000000] max-w-full overflow-x-hidden relative">
      {/* Non-intrusive one-time login toast notification */}
      <AnimatePresence>
        {showLoginToast && pendingOrdersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 right-4 sm:right-8 z-50 bg-[#000000] text-[#FFFDF7] border border-[#3d2500]/60 p-3.5 rounded-2xl shadow-2xl flex items-center space-x-3.5 max-w-sm backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-bold text-[#FFFDF7]">New Orders Waiting</p>
              <p className="text-[11px] text-[#FFFDF7]/75 truncate">
                You have <span className="font-bold text-amber-400">{pendingOrdersCount}</span> new order{pendingOrdersCount > 1 ? 's' : ''} waiting
              </p>
            </div>
            <button
              onClick={() => {
                dismissLoginToast();
                navigate('/orders?status=pending');
              }}
              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
            >
              View
            </button>
            <button
              onClick={dismissLoginToast}
              className="text-[#FFFDF7]/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden">
        <Topbar onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)} />
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto custom-scrollbar min-w-0 max-w-full">
          <motion.div
            key={location.pathname}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-full w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
