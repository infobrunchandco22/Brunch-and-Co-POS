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
    <div className="bg-[#FFFFFF] border border-[#000000]/10 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-table-data text-[#000000]">
          <thead className="bg-[#F6F1EB] text-[#7a4900] font-label-caps uppercase text-[10px] tracking-wider border-b border-[#000000]/10">
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
          <tbody className="divide-y divide-[#000000]/5">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-[#F6F1EB]/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-[#000000]">
                  <p className="text-sm">{customer.full_name}</p>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-1 text-[#000000]">
                    <Phone className="w-3 h-3 text-[#3d2500]" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <p className="text-[10px] text-[#7a4900] mt-0.5">{customer.email}</p>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-[#3d2500]">{customer.default_area || 'F-7'}</span>
                  <p className="text-[10px] text-[#7a4900] truncate max-w-xs">
                    {customer.default_address || 'No address saved.'}
                  </p>
                </td>
                <td className="py-3.5 px-4 font-bold text-[#000000]">
                  {customer.total_orders} orders
                </td>
                <td className="py-3.5 px-4 font-bold text-[#000000]">
                  {formatCurrency(customer.total_spent)}
                </td>
                <td className="py-3.5 px-4 text-[#7a4900]">
                  {formatDate(customer.created_at)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onSelectCustomer(customer)}
                    className="p-1.5 text-[#3d2500] hover:text-[#000000] hover:bg-[#F6F1EB] rounded-lg transition-colors cursor-pointer"
                    title="View Customer Order History"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#7a4900] text-xs">
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
