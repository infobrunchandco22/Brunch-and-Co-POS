import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatCard } from '../components/dashboard/StatCard';
import { OrdersChart } from '../components/dashboard/OrdersChart';
import { RecentOrdersTable } from '../components/dashboard/RecentOrdersTable';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useOrders } from '../hooks/useOrders';
import { formatCurrency } from '../lib/utils';
import { Order, OrderStatus } from '../types/database.types';
import { DollarSign, ShoppingBag, TrendingUp, Bike, RefreshCw, Calendar, Download, Coins } from 'lucide-react';
import { exportOrdersToExcel } from '../lib/exportToExcel';

export const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('7d');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const { data: stats, isLoading, refetch } = useDashboardStats(dateRange, customStart, customEnd);
  const { orders, updateOrderStatus } = useOrders();
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  if (isLoading || !stats) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 text-[#9f8d85] text-xs">
          <img src="/logo.svg" alt="BR&CO CAFE" className="w-12 h-12 animate-pulse mb-3 object-contain" />
          <span>Loading analytics & live orders...</span>
        </div>
      </DashboardLayout>
    );
  }

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    updateOrderStatus.mutate({ orderId, status: nextStatus });
  };

  const handleExportExcel = () => {
    // Filter orders by date range for export
    let filtered = [...orders];
    const now = new Date();
    if (dateRange === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      filtered = filtered.filter((o) => new Date(o.created_at).getTime() >= todayStart);
    } else if (dateRange === 'this_month' || dateRange === '30d') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      filtered = filtered.filter((o) => new Date(o.created_at).getTime() >= monthStart);
    } else if (dateRange === 'custom' && customStart && customEnd) {
      const s = new Date(customStart).getTime();
      const e = new Date(customEnd).getTime();
      filtered = filtered.filter((o) => {
        const t = new Date(o.created_at).getTime();
        return t >= s && t <= e;
      });
    }

    exportOrdersToExcel(filtered, dateRange);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header & Date Range Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1c1b1b] p-4 rounded-2xl border border-[#353534]">
          <div>
            <h2 className="font-headline-lg font-bold text-2xl text-[#e5e2e1] tracking-tight">
              Dashboard Overview
            </h2>
            <p className="text-xs text-[#9f8d85] mt-0.5">
              Real-time revenue, order metrics, and kitchen workflow
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date Range Selector Buttons */}
            <div className="flex items-center bg-[#131313] p-1 rounded-xl border border-[#353534] text-xs">
              <button
                onClick={() => setDateRange('today')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  dateRange === 'today'
                    ? 'bg-[#6e4025] text-[#eeae8b]'
                    : 'text-[#9f8d85] hover:text-[#e5e2e1]'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateRange('7d')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  dateRange === '7d'
                    ? 'bg-[#6e4025] text-[#eeae8b]'
                    : 'text-[#9f8d85] hover:text-[#e5e2e1]'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setDateRange('this_month')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  dateRange === 'this_month'
                    ? 'bg-[#6e4025] text-[#eeae8b]'
                    : 'text-[#9f8d85] hover:text-[#e5e2e1]'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setDateRange('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  dateRange === 'all'
                    ? 'bg-[#6e4025] text-[#eeae8b]'
                    : 'text-[#9f8d85] hover:text-[#e5e2e1]'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setDateRange('custom')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  dateRange === 'custom'
                    ? 'bg-[#6e4025] text-[#eeae8b]'
                    : 'text-[#9f8d85] hover:text-[#e5e2e1]'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom Date Inputs if Custom selected */}
            {dateRange === 'custom' && (
              <div className="flex items-center space-x-2 bg-[#131313] px-3 py-1 border border-[#353534] rounded-xl text-xs">
                <Calendar className="w-3.5 h-3.5 text-[#fab895]" />
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-transparent text-[#e5e2e1] text-xs focus:outline-none"
                />
                <span className="text-[#9f8d85]">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-transparent text-[#e5e2e1] text-xs focus:outline-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <button
              onClick={handleExportExcel}
              className="flex items-center space-x-1.5 text-xs font-bold text-[#eeae8b] bg-[#6e4025]/40 hover:bg-[#6e4025] border border-[#fab895]/30 px-3 py-2 rounded-xl transition-all cursor-pointer"
              title="Export filtered orders to Excel spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-[#fab895]" />
              <span>Export to Excel</span>
            </button>

            <button
              onClick={() => refetch()}
              className="flex items-center space-x-1.5 text-xs text-[#d6c3b9] bg-[#131313] border border-[#353534] hover:bg-[#201f1f] px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#fab895]" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            changePct={stats.revenueChangePct}
            icon={DollarSign}
            subtitle="Delivered orders"
          />
          <StatCard
            title="Net Profit"
            value={formatCurrency(stats.totalProfit)}
            changePct={stats.profitChangePct}
            icon={Coins}
            subtitle="Revenue minus cost"
          />
          <StatCard
            title="Total Orders"
            value={`${stats.ordersCount} orders`}
            changePct={stats.ordersCountChangePct}
            icon={ShoppingBag}
            subtitle="All statuses in period"
          />
          <StatCard
            title="Avg Order Value"
            value={formatCurrency(stats.avgOrderValue)}
            changePct={stats.avgOrderValueChangePct}
            icon={TrendingUp}
            subtitle="Delivered orders avg"
          />
          <StatCard
            title="Active Couriers"
            value={`${stats.activeCouriers} / ${stats.totalCouriers}`}
            changePct={0}
            icon={Bike}
            subtitle="Riders on road"
          />
        </div>

        {/* Charts & Top Sellers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OrdersChart data={stats.ordersOverTime} />
          </div>

          {/* Top Selling Items Card */}
          <div className="bg-[#1c1b1b] border border-[#353534] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="font-headline-lg font-bold text-base text-[#e5e2e1] mb-1">
                Top Popular Items
              </h3>
              <p className="text-xs text-[#9f8d85] mb-4">Highest volume ordered in period</p>

              <div className="space-y-3">
                {stats.topItems.length === 0 ? (
                  <div className="py-8 text-center text-[#9f8d85] text-xs">
                    No items sold in selected period.
                  </div>
                ) : (
                  stats.topItems.map((item, idx) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between bg-[#131313] border border-[#2a2a2a] p-2.5 rounded-xl text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-5 font-bold font-mono text-[#fab895]">#{idx + 1}</span>
                        <div>
                          <p className="font-semibold text-[#e5e2e1]">{item.product.name}</p>
                          <p className="text-[10px] text-[#9f8d85]">
                            {formatCurrency(item.product.base_price)}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#eeae8b] bg-[#6e4025]/50 px-2 py-1 rounded-lg">
                        {item.orderCount} sold
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Lifecycle Table */}
        <RecentOrdersTable
          orders={orders}
          limit={6}
          onUpdateStatus={handleUpdateStatus}
          onViewReceipt={(order) => setSelectedReceiptOrder(order)}
        />
      </div>

      {/* Order Detail & Receipt Modal Viewer */}
      {selectedReceiptOrder && (
        <OrderDetailModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </DashboardLayout>
  );
};

