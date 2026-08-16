import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { RecentOrdersTable } from '../components/dashboard/RecentOrdersTable';
import { ReceiptView } from '../components/orders/ReceiptView';
import { useOrders } from '../hooks/useOrders';
import { Order, OrderStatus } from '../types/database.types';
import { Search, Filter, Plus, Download } from 'lucide-react';
import { exportOrdersToExcel } from '../lib/exportToExcel';

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All Orders', value: 'all' },
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
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  const { orders, updateOrderStatus, isLoading } = useOrders(activeTab);

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.order_number.toString().includes(q) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
      o.delivery_phone.includes(q) ||
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
              Track live kitchen status, delivery dispatch, and payment settlements
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => exportOrdersToExcel(filteredOrders, activeTab)}
              className="flex items-center space-x-1.5 text-xs font-bold text-[#eeae8b] bg-[#6e4025]/40 hover:bg-[#6e4025] border border-[#fab895]/30 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              title="Export visible orders to Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-[#fab895]" />
              <span>Export to Excel</span>
            </button>

            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9f8d85]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order #, phone, area..."
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
                  ? 'bg-[#6e4025] text-[#eeae8b] border border-[#fab895]/30'
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
          onViewReceipt={(order) => setSelectedReceiptOrder(order)}
        />
      </div>

      {/* Thermal Receipt Modal Viewer */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
          <div className="relative w-full max-w-lg my-auto bg-[#1c1b1b] border border-[#353534] rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
            <ReceiptView
              order={selectedReceiptOrder}
              onClose={() => setSelectedReceiptOrder(null)}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
