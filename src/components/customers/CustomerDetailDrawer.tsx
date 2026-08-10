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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end">
      <div className="bg-[#1c1b1b] border-l border-[#52443d] w-full max-w-lg h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto custom-scrollbar">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#353534] pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#6e4025] text-[#eeae8b] border border-[#fab895]/30 flex items-center justify-center font-bold text-lg">
                {customer.full_name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-base text-[#e5e2e1]">{customer.full_name}</h3>
                <p className="text-xs text-[#9f8d85]">Customer Profile #{customer.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-[#9f8d85] hover:text-[#e5e2e1] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#131313] border border-[#2a2a2a] p-3 rounded-xl">
              <span className="text-[10px] text-[#9f8d85] font-label-caps uppercase">
                Total Orders
              </span>
              <p className="text-lg font-bold text-[#e5e2e1]">{customer.total_orders}</p>
            </div>
            <div className="bg-[#131313] border border-[#2a2a2a] p-3 rounded-xl">
              <span className="text-[10px] text-[#9f8d85] font-label-caps uppercase">
                Total Spent
              </span>
              <p className="text-lg font-bold text-[#fab895]">
                {formatCurrency(customer.total_spent)}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-[#131313] border border-[#2a2a2a] p-4 rounded-xl space-y-2 text-xs mb-6">
            <div className="flex items-center space-x-2 text-[#e5e2e1]">
              <Phone className="w-4 h-4 text-[#fab895]" />
              <span>{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center space-x-2 text-[#e5e2e1]">
                <Mail className="w-4 h-4 text-[#fab895]" />
                <span>{customer.email}</span>
              </div>
            )}
            <div className="flex items-start space-x-2 text-[#e5e2e1] pt-1 border-t border-[#2a2a2a]">
              <MapPin className="w-4 h-4 text-[#fab895] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{customer.default_area || 'F-7'}</p>
                <p className="text-[11px] text-[#9f8d85]">{customer.default_address || 'No address saved.'}</p>
              </div>
            </div>
          </div>

          {/* Past Order History */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase text-[#9f8d85] font-label-caps">
              Recent Order History ({customerOrders.length})
            </h4>

            {customerOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[#201f1f] border border-[#353534] p-3 rounded-xl space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#e5e2e1]">
                    #{order.order_number}
                  </span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex justify-between text-[11px] text-[#9f8d85]">
                  <span>{formatDate(order.created_at)}</span>
                  <span className="font-semibold text-[#fab895]">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            ))}

            {customerOrders.length === 0 && (
              <div className="py-8 text-center text-[#9f8d85] text-xs">
                No orders recorded for this customer yet.
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-[#353534]">
          <button
            onClick={onClose}
            className="w-full bg-[#131313] hover:bg-[#201f1f] text-[#e5e2e1] py-2.5 rounded-xl font-bold text-xs cursor-pointer"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
