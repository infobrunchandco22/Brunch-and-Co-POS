import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  PlusCircle,
  Receipt,
  UtensilsCrossed,
  Image as ImageIcon,
  Gift,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  ChefHat,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, adminOnly: false },
    { label: 'Create Order (POS)', path: '/orders/new', icon: PlusCircle, adminOnly: false },
    { label: 'Orders', path: '/orders', icon: Receipt, adminOnly: false },
    { label: 'Products & Menu', path: '/products', icon: UtensilsCrossed, adminOnly: false },
    { label: 'Homepage Banners', path: '/banners', icon: ImageIcon, adminOnly: true },
    { label: 'Rewards & Perks', path: '/rewards', icon: Gift, adminOnly: true },
    { label: 'Customer Directory', path: '/customers', icon: Users, adminOnly: false },
    { label: 'Settings', path: '/settings', icon: Settings, adminOnly: true },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FFFDF7] border-r border-[#000000]/10 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-[#000000]/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/logo.jpeg" alt="Brunch & Co" className="w-10 h-10 object-contain rounded-xl shadow-xs" />
          <div>
            <h1 className="font-headline-lg text-lg font-bold text-[#000000] tracking-tight leading-tight">
              Brunch<span className="text-[#7a4900]">&</span>Co
            </h1>
            <p className="text-[11px] font-label-caps text-[#7a4900] uppercase tracking-wider">
              Internal POS & Admin
            </p>
          </div>
        </div>

        {/* Mobile Close Drawer Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-[#7a4900] hover:text-[#000000] rounded-lg transition-colors cursor-pointer"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Indicator */}
      <div className="px-4 py-3 bg-[#F6F1EB] border-b border-[#000000]/10 flex items-center">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#3d2500]" />
          <span className="text-xs font-medium text-[#7a4900]">Role:</span>
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded uppercase bg-[#3d2500] text-[#FFFDF7]">
            {role ? role.toUpperCase() : 'STAFF'}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isAllowed = !item.adminOnly || role === 'admin';
          const Icon = item.icon;

          if (!isAllowed) {
            return (
              <div
                key={item.path}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-[#7a4900]/40 cursor-not-allowed group relative"
                title="Admin access required"
              >
                <div className="flex items-center space-x-3 opacity-50">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[9px] font-label-caps bg-[#F6F1EB] text-[#7a4900]/60 px-1.5 py-0.5 rounded border border-[#000000]/10">
                  ADMIN
                </span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (onClose) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#3d2500] text-[#FFFDF7] font-semibold shadow-sm'
                    : 'text-[#7a4900] hover:bg-[#F6F1EB] hover:text-[#000000]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#000000]/10 bg-[#FFFDF7] flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#F6F1EB] text-[#3d2500] flex items-center justify-center font-bold text-xs shrink-0 border border-[#000000]/10">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#000000] truncate">{user?.full_name || 'Staff Member'}</p>
            <p className="text-[10px] text-[#7a4900] truncate">{user?.phone || user?.role || 'Staff'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 text-[#7a4900] hover:text-[#b91c1c] hover:bg-[#F6F1EB] rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (>1024px) */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 z-30 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Slide-in Drawer (<1024px) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
