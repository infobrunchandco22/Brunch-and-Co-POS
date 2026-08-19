import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { RecentOrdersTable } from '../components/dashboard/RecentOrdersTable';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';
import { useOrders } from '../hooks/useOrders';
import { Order, OrderStatus } from '../types/database.types';
import { Search, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { exportOrdersToExcel } from '../lib/exportToExcel';

const STATUS_TABS: { label: string; value: string; isIssueTab?: boolean }[] = [
  { label: 'All Orders', value: 'all' },
  { label: '⚠️ Order Issues', value: 'issues', isIssueTab: true },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

export const Orders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);

  // Realtime subscription explicitly disabled on Orders screen (staff manually refresh)
  const { orders, updateOrderStatus, isLoading, isFetching, refetch } = useOrders(activeTab, {
    enableRealtime: false,
  });

  const filteredOrders = orders.filter((o) => {
    // If activeTab is 'issues' and not filtered at query level
    if (activeTab === 'issues' && !o.has_issue) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      o.order_number.toString().includes(q) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
      (o.guest_name && o.guest_name.toLowerCase().includes(q)) ||
      (o.delivery_phone && o.delivery_phone.includes(q)) ||
      (o.delivery_address && o.delivery_address.toLowerCase().includes(q)) ||
      (o.delivery_area && o.delivery_area.toLowerCase().includes(q))
    );
  });

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    updateOrderStatus.mutate({ orderId, status: nextStatus });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline-lg font-bold text-2xl text-[#e5e2e1] tracking-tight">
              Order Lifecycle Directory
            </h2>
            <p className="text-xs text-[#9f8d85] mt-1">
              Manual lifecycle dashboard • Click Refresh to pull incoming orders
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Manual Refresh Button */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center space-x-1.5 text-xs font-bold text-[#e5e2e1] bg-[#1c1b1b] hover:bg-[#252424] border border-[#353534] hover:border-[#fab895]/40 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow"
              title="Manually check and fetch latest orders"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#fab895] ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            {/* Export Excel Button */}
            <button
              onClick={() => exportOrdersToExcel(filteredOrders, activeTab)}
              className="flex items-center space-x-1.5 text-xs font-bold text-[#eeae8b] bg-[#6e4025]/40 hover:bg-[#6e4025] border border-[#fab895]/30 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              title="Export visible orders to Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-[#fab895]" />
              <span>Export</span>
            </button>

            {/* Partial Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9f8d85]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order #, name, phone..."
                className="w-full bg-[#1c1b1b] border border-[#353534] rounded-xl pl-9 pr-4 py-2 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
              />
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar border-b border-[#353534]">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.value
                  ? tab.isIssueTab
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-600/70 shadow'
                    : 'bg-[#6e4025] text-[#eeae8b] border border-[#fab895]/30 shadow'
                  : tab.isIssueTab
                  ? 'bg-[#1c1b1b] text-rose-400 hover:text-rose-300 border border-rose-900/50'
                  : 'bg-[#1c1b1b] text-[#9f8d85] hover:text-[#e5e2e1] border border-[#353534]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <RecentOrdersTable
          orders={filteredOrders}
          onUpdateStatus={handleUpdateStatus}
          onViewReceipt={(order) => setSelectedDetailOrder(order)}
        />
      </div>

      {/* Comprehensive Order Detail & Issue Modal */}
      {selectedDetailOrder && (
        <OrderDetailModal
          order={selectedDetailOrder}
          onClose={() => setSelectedDetailOrder(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </DashboardLayout>
  );
};

export default Orders;
