import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatCard } from '../components/dashboard/StatCard';
import { OrdersChart } from '../components/dashboard/OrdersChart';
import { RecentOrdersTable } from '../components/dashboard/RecentOrdersTable';
import { ReceiptView } from '../components/orders/ReceiptView';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useOrders } from '../hooks/useOrders';
import { formatCurrency } from '../lib/utils';
import { Order, OrderStatus } from '../types/database.types';
import { DollarSign, ShoppingBag, TrendingUp, Bike, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading, refetch } = useDashboardStats();
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title & Refetch */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-lg font-bold text-2xl text-[#e5e2e1] tracking-tight">
              Dashboard Overview
            </h2>
            <p className="text-xs text-[#9f8d85] mt-1">
              Real-time revenue, order metrics, and kitchen workflow
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center space-x-1.5 text-xs text-[#d6c3b9] bg-[#1c1b1b] border border-[#353534] hover:bg-[#201f1f] px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#fab895]" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue > 0 ? formatCurrency(stats.totalRevenue) : '—'}
            changePct={stats.revenueChangePct}
            icon={DollarSign}
            subtitle={stats.totalRevenue > 0 ? "Today's sales" : "Connect a database to see live stats."}
          />
          <StatCard
            title="Total Orders"
            value={stats.ordersCount > 0 ? `${stats.ordersCount} orders` : '—'}
            changePct={stats.ordersCountChangePct}
            icon={ShoppingBag}
            subtitle={stats.ordersCount > 0 ? "Today's count" : "Connect a database to see live stats."}
          />
          <StatCard
            title="Avg Order Value"
            value={stats.avgOrderValue > 0 ? formatCurrency(stats.avgOrderValue) : '—'}
            changePct={stats.avgOrderValueChangePct}
            icon={TrendingUp}
            subtitle={stats.avgOrderValue > 0 ? "Per basket" : "Connect a database to see live stats."}
          />
          <StatCard
            title="Active Couriers"
            value={stats.totalCouriers > 0 ? `${stats.activeCouriers} / ${stats.totalCouriers}` : '—'}
            changePct={0}
            icon={Bike}
            subtitle={stats.totalCouriers > 0 ? "Riders on road" : "Connect a database to see live stats."}
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
              <p className="text-xs text-[#9f8d85] mb-4">Highest volume ordered today</p>

              <div className="space-y-3">
                {stats.topItems.length === 0 ? (
                  <div className="py-8 text-center text-[#9f8d85] text-xs">
                    No items sold yet. Connect a database to see live stats.
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

      {/* Thermal Receipt Modal Viewer */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative">
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
