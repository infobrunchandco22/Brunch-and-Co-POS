import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Printer, Bell, Flame, Menu } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';

interface TopbarProps {
  onToggleMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { orders } = useOrders();

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing'
  ).length;

  return (
    <header className="h-16 bg-[#FFFDF7]/95 backdrop-blur-md border-b border-[#000000]/10 sticky top-0 z-20 px-3 sm:px-6 flex items-center justify-between gap-2">
      {/* Left: Mobile Menu Toggle + Global Search Bar */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 max-w-xs sm:max-w-md">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-[#7a4900] hover:text-[#000000] hover:bg-[#F6F1EB] rounded-xl transition-colors cursor-pointer shrink-0"
            title="Open menu drawer"
          >
            <Menu className="w-5 h-5 text-[#3d2500]" />
          </button>
        )}

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7a4900]" />
          <input
            type="text"
            placeholder="Search order #..."
            className="w-full bg-[#FFFFFF] border border-[#000000]/15 rounded-xl pl-9 pr-3 py-1.5 sm:py-2 text-xs text-[#000000] placeholder-[#7a4900]/50 focus:outline-none focus:border-[#3d2500] focus:ring-1 focus:ring-[#3d2500] transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value;
                if (val) {
                  navigate(`/orders?search=${encodeURIComponent(val)}`);
                }
              }
            }}
          />
        </div>
      </div>

      {/* Center & Right Status Indicators & Quick Action */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Active Kitchen Status Badge */}
        <div className="hidden md:flex items-center space-x-2 bg-[#F6F1EB] border border-[#000000]/10 px-3 py-1.5 rounded-full text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3d2500] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3d2500]"></span>
          </span>
          <Flame className="w-3.5 h-3.5 text-[#3d2500]" />
          <span className="text-[#000000] font-medium">Kitchen Live</span>
          <span className="bg-[#3d2500] text-[#FFFDF7] font-bold text-[10px] px-1.5 py-0.2 rounded-full">
            {activeOrdersCount} Active
          </span>
        </div>

        {/* Thermal Printer Status Indicator */}
        <div
          title="Thermal Receipt Printer Status"
          className="hidden xl:flex items-center space-x-1.5 text-xs text-[#7a4900] bg-[#F6F1EB] border border-[#000000]/10 px-2.5 py-1.5 rounded-lg"
        >
          <Printer className="w-3.5 h-3.5 text-[#3d2500]" />
          <span>80mm Thermal</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
        </div>

        {/* Notifications Icon */}
        <button
          title="Notifications"
          className="p-2 text-[#7a4900] hover:text-[#000000] hover:bg-[#F6F1EB] rounded-xl transition-colors relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3d2500]"></span>
        </button>

        {/* Quick Create Order Button */}
        <button
          onClick={() => navigate('/orders/new')}
          className="flex items-center space-x-1.5 sm:space-x-2 bg-[#000000] hover:bg-[#3d2500] text-[#FFFDF7] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Order</span>
          <span className="sm:hidden">POS</span>
        </button>
      </div>
    </header>
  );
};
