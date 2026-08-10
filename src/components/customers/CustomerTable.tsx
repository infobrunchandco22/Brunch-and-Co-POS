import React from 'react';
import { Customer } from '../../types/database.types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Eye, Phone, MapPin, Mail, ShoppingBag } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onSelectCustomer,
}) => {
  return (
    <div className="bg-[#1c1b1b] border border-[#353534] rounded-2xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-table-data text-[#d6c3b9]">
          <thead className="bg-[#131313] text-[#9f8d85] font-label-caps uppercase text-[10px] tracking-wider border-b border-[#353534]">
            <tr>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Default Area / Address</th>
              <th className="py-3 px-4">Total Orders</th>
              <th className="py-3 px-4">Lifetime Spent</th>
              <th className="py-3 px-4">Joined</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-[#201f1f] transition-colors">
                <td className="py-3.5 px-4 font-bold text-[#e5e2e1]">
                  <p className="text-sm">{customer.full_name}</p>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-1 text-[#e5e2e1]">
                    <Phone className="w-3 h-3 text-[#fab895]" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <p className="text-[10px] text-[#9f8d85] mt-0.5">{customer.email}</p>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-[#fab895]">{customer.default_area || 'F-7'}</span>
                  <p className="text-[10px] text-[#9f8d85] truncate max-w-xs">
                    {customer.default_address || 'No address saved.'}
                  </p>
                </td>
                <td className="py-3.5 px-4 font-bold text-[#e5e2e1]">
                  {customer.total_orders} orders
                </td>
                <td className="py-3.5 px-4 font-bold text-[#fab895]">
                  {formatCurrency(customer.total_spent)}
                </td>
                <td className="py-3.5 px-4 text-[#9f8d85]">
                  {formatDate(customer.created_at)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onSelectCustomer(customer)}
                    className="p-1.5 text-[#9f8d85] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] rounded-lg transition-colors cursor-pointer"
                    title="View Customer Order History"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#9f8d85] text-xs">
                  No customers yet — registered customers will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
