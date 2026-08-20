import React from 'react';
import { Customer, Order } from '../../types/database.types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { getStatusBadge } from '../dashboard/RecentOrdersTable';
import { X, User, Phone, MapPin, Mail, ShoppingBag, DollarSign } from 'lucide-react';

interface CustomerDetailDrawerProps {
  customer: Customer;
  orders: Order[];
  onClose: () => void;
}

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  customer,
  orders,
  onClose,
}) => {
  const customerOrders = orders.filter((o) => o.customer_id === customer.id);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end animate-fade-in">
      <div className="bg-[#FFFFFF] border-l border-[#000000]/10 w-full max-w-lg h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto custom-scrollbar">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#000000]/10 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#3d2500] text-[#FFFDF7] flex items-center justify-center font-bold text-lg shadow-xs">
                {customer.full_name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-base text-[#000000]">{customer.full_name}</h3>
                <p className="text-xs text-[#7a4900]">Customer Profile #{customer.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-[#7a4900] hover:text-[#000000] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#F6F1EB] border border-[#000000]/10 p-3 rounded-xl">
              <span className="text-[10px] text-[#7a4900] font-label-caps uppercase">
                Total Orders
              </span>
              <p className="text-lg font-bold text-[#000000]">{customer.total_orders}</p>
            </div>
            <div className="bg-[#F6F1EB] border border-[#000000]/10 p-3 rounded-xl">
              <span className="text-[10px] text-[#7a4900] font-label-caps uppercase">
                Total Spent
              </span>
              <p className="text-lg font-bold text-[#000000]">
                {formatCurrency(customer.total_spent)}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-[#F6F1EB] border border-[#000000]/10 p-4 rounded-xl space-y-2 text-xs mb-6">
            <div className="flex items-center space-x-2 text-[#000000]">
              <Phone className="w-4 h-4 text-[#3d2500]" />
              <span>{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center space-x-2 text-[#000000]">
                <Mail className="w-4 h-4 text-[#3d2500]" />
                <span>{customer.email}</span>
              </div>
            )}
            <div className="flex items-start space-x-2 text-[#000000] pt-1 border-t border-[#000000]/10">
              <MapPin className="w-4 h-4 text-[#3d2500] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#3d2500]">{customer.default_area || 'F-7'}</p>
                <p className="text-[11px] text-[#7a4900]">{customer.default_address || 'No address saved.'}</p>
              </div>
            </div>
          </div>

          {/* Past Order History */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase text-[#7a4900] font-label-caps">
              Recent Order History ({customerOrders.length})
            </h4>

            {customerOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[#FFFFFF] border border-[#000000]/10 p-3 rounded-xl space-y-1 text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#000000]">
                    #{order.order_number}
                  </span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex justify-between text-[11px] text-[#7a4900]">
                  <span>{formatDate(order.created_at)}</span>
                  <span className="font-semibold text-[#000000]">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            ))}

            {customerOrders.length === 0 && (
              <div className="py-8 text-center text-[#7a4900] text-xs">
                No orders recorded for this customer yet.
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-[#000000]/10">
          <button
            onClick={onClose}
            className="w-full bg-[#000000] hover:bg-[#3d2500] text-[#FFFDF7] py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
