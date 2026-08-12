import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '../../types/database.types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Eye, ChevronRight, Clock, CheckCircle2, Truck, AlertCircle, XCircle } from 'lucide-react';

interface RecentOrdersTableProps {
  orders: Order[];
  onUpdateStatus?: (orderId: string, nextStatus: OrderStatus) => void;
  onViewReceipt?: (order: Order) => void;
  limit?: number;
}

export const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center space-x-1 bg-amber-950/60 text-amber-400 border border-amber-800/50 px-2.5 py-1 rounded-full text-xs font-medium">
          <Clock className="w-3 h-3" />
          <span>Pending</span>
        </span>
      );
    case 'confirmed':
      return (
        <span className="inline-flex items-center space-x-1 bg-blue-950/60 text-blue-400 border border-blue-800/50 px-2.5 py-1 rounded-full text-xs font-medium">
          <CheckCircle2 className="w-3 h-3" />
          <span>Confirmed</span>
        </span>
      );
    case 'preparing':
      return (
        <span className="inline-flex items-center space-x-1 bg-purple-950/60 text-purple-400 border border-purple-800/50 px-2.5 py-1 rounded-full text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          <span>Preparing</span>
        </span>
      );
    case 'out_for_delivery':
      return (
        <span className="inline-flex items-center space-x-1 bg-indigo-950/60 text-indigo-400 border border-indigo-800/50 px-2.5 py-1 rounded-full text-xs font-medium">
          <Truck className="w-3 h-3" />
          <span>On the Way</span>
        </span>
      );
    case 'delivered':
      return (
        <span className="inline-flex items-center space-x-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-2.5 py-1 rounded-full text-xs font-medium">
          <CheckCircle2 className="w-3 h-3" />
          <span>Delivered</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center space-x-1 bg-rose-950/60 text-rose-400 border border-rose-800/50 px-2.5 py-1 rounded-full text-xs font-medium">
          <XCircle className="w-3 h-3" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return null;
  }
};

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  orders,
  onUpdateStatus,
  onViewReceipt,
  limit,
}) => {
  const navigate = useNavigate();

  const displayedOrders = limit ? orders.slice(0, limit) : orders;

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'preparing';
      case 'preparing':
        return 'out_for_delivery';
      case 'out_for_delivery':
        return 'delivered';
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#1c1b1b] border border-[#353534] rounded-2xl overflow-hidden shadow-lg">
      <div className="p-5 border-b border-[#353534] flex items-center justify-between">
        <div>
          <h3 className="font-headline-lg font-bold text-base text-[#e5e2e1]">
            Recent Orders Lifecycle
          </h3>
          <p className="text-xs text-[#9f8d85]">Live updates and status controls</p>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="text-xs font-medium text-[#fab895] hover:text-[#eeae8b] flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <span>View All Orders</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-table-data text-[#d6c3b9]">
          <thead className="bg-[#131313] text-[#9f8d85] font-label-caps uppercase text-[10px] tracking-wider border-b border-[#353534]">
            <tr>
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {displayedOrders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              return (
                <tr
                  key={order.id}
                  onClick={() => onViewReceipt && onViewReceipt(order)}
                  className="hover:bg-[#201f1f] transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#e5e2e1]">
                    #{order.order_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-[#e5e2e1] truncate max-w-[160px]">
                      {order.customer_name || order.guest_name || 'Walk-in'}
                    </p>
                    <p className="text-[10px] text-[#fab895] font-mono">
                      {order.delivery_phone || 'No phone'}
                    </p>
                    <p className="text-[10px] text-[#9f8d85] truncate max-w-[180px]">
                      {order.delivery_area ? `${order.delivery_area} • ` : ''}{order.delivery_address}
                    </p>
                    {order.notes && (
                      <p className="text-[9px] text-amber-300 font-medium truncate max-w-[180px] bg-amber-950/50 px-1 py-0.5 rounded border border-amber-800/40 mt-0.5">
                        Note: {order.notes}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#e5e2e1]">
                    {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#fab895]">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : order.payment_status === 'partial'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {order.payment_status} ({order.payment_method})
                    </span>
                    {order.payment_status === 'partial' && (
                      <p className="text-[10px] text-amber-400 font-semibold mt-0.5 whitespace-nowrap">
                        Balance Due: {formatCurrency(order.total - order.paid_amount)}
                      </p>
                    )}
                    {order.payment_status === 'unpaid' && (
                      <p className="text-[10px] text-rose-400 font-semibold mt-0.5 whitespace-nowrap">
                        Balance Due: {formatCurrency(order.total)}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>
                  <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                    {onViewReceipt && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewReceipt(order);
                        }}
                        title="Print / View Receipt"
                        className="p-1.5 text-[#9f8d85] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {onUpdateStatus && nextStatus && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(order.id, nextStatus);
                        }}
                        className="bg-[#6e4025] hover:bg-[#804b2b] text-[#eeae8b] px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Advance &rarr;
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {displayedOrders.length === 0 && (
          <div className="py-12 text-center text-[#9f8d85] text-xs">
            No orders yet — create your first order in POS.
          </div>
        )}
      </div>
    </div>
  );
};
