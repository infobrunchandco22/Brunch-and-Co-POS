import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CustomerTable } from '../components/customers/CustomerTable';
import { CustomerDetailDrawer } from '../components/customers/CustomerDetailDrawer';
import { useCustomers } from '../hooks/useCustomers';
import { useOrders } from '../hooks/useOrders';
import { Customer } from '../types/database.types';
import { Search } from 'lucide-react';

export const Customers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { customers } = useCustomers(searchQuery);
  const { orders } = useOrders();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline-lg font-bold text-2xl text-[#e5e2e1] tracking-tight">
              Customer Directory
            </h2>
            <p className="text-xs text-[#9f8d85] mt-1">
              Registered customers, delivery addresses, and spending metrics
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9f8d85]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, email..."
              className="w-full bg-[#1c1b1b] border border-[#353534] rounded-xl pl-9 pr-4 py-2 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
            />
          </div>
        </div>

        {/* Customer Directory Table */}
        <CustomerTable
          customers={customers}
          onSelectCustomer={(cust) => setSelectedCustomer(cust)}
        />
      </div>

      {/* Customer Detail History Drawer */}
      {selectedCustomer && (
        <CustomerDetailDrawer
          customer={selectedCustomer}
          orders={orders}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </DashboardLayout>
  );
};
