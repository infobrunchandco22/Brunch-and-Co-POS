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
    <div className="flex flex-col h-full bg-[#1c1b1b] border-r border-[#353534] select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-[#353534] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/logo.svg" alt="BR&CO CAFE" className="w-10 h-10 object-contain rounded-xl" />
          <div>
            <h1 className="font-headline-lg text-lg font-bold text-[#e5e2e1] tracking-tight leading-tight">
              Brunch<span className="text-[#fab895]">&</span>Co
            </h1>
            <p className="text-[11px] font-label-caps text-[#9f8d85] uppercase tracking-wider">
              Internal POS & Admin
            </p>
          </div>
        </div>

        {/* Mobile Close Drawer Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-[#9f8d85] hover:text-[#e5e2e1] rounded-lg transition-colors cursor-pointer"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Indicator */}
      <div className="px-4 py-3 bg-[#131313]/60 border-b border-[#353534]/50 flex items-center">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#fab895]" />
          <span className="text-xs font-medium text-[#d6c3b9]">Role:</span>
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded uppercase bg-[#6e4025] text-[#eeae8b] border border-[#fab895]/30">
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
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-[#52443d] cursor-not-allowed group relative"
                title="Admin access required"
              >
                <div className="flex items-center space-x-3 opacity-50">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[9px] font-label-caps bg-[#131313] text-[#52443d] px-1.5 py-0.5 rounded border border-[#353534]">
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
                    ? 'bg-[#6e4025] text-[#eeae8b] font-semibold border border-[#fab895]/30 shadow-sm'
                    : 'text-[#d6c3b9] hover:bg-[#201f1f] hover:text-[#e5e2e1]'
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
      <div className="p-4 border-t border-[#353534] bg-[#1c1b1b] flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#353534] text-[#fab895] flex items-center justify-center font-bold text-xs shrink-0 border border-[#52443d]">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#e5e2e1] truncate">{user?.full_name || 'Staff Member'}</p>
            <p className="text-[10px] text-[#9f8d85] truncate">{user?.phone || user?.role || 'Staff'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 text-[#9f8d85] hover:text-[#ffb4ab] hover:bg-[#2a2a2a] rounded-lg transition-colors cursor-pointer shrink-0"
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
