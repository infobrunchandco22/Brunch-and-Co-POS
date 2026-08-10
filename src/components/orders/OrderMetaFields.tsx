import React, { useState } from 'react';
import { Customer, Staff } from '../../types/database.types';
import { User, MapPin, Phone, UserPlus, StickyNote, Building2 } from 'lucide-react';

interface OrderMetaFieldsProps {
  customers: Customer[];
  staffList: Staff[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  guestName: string;
  onChangeGuestName: (val: string) => void;
  deliveryAddress: string;
  onChangeDeliveryAddress: (val: string) => void;
  deliveryArea: string;
  onChangeDeliveryArea: (val: string) => void;
  deliveryPhone: string;
  onChangeDeliveryPhone: (val: string) => void;
  selectedStaffId: string;
  onChangeStaffId: (val: string) => void;
  orderNotes: string;
  onChangeOrderNotes: (val: string) => void;
  onAddNewCustomer: (cust: { full_name: string; phone: string; address: string; area: string }) => void;
}

const AREAS = ['F-7', 'F-8', 'F-10', 'E-11', 'G-11', 'Blue Area', 'I-8', 'DHA Phase 2', 'Counter Pickup'];

export const OrderMetaFields: React.FC<OrderMetaFieldsProps> = ({
  customers,
  staffList,
  selectedCustomer,
  onSelectCustomer,
  guestName,
  onChangeGuestName,
  deliveryAddress,
  onChangeDeliveryAddress,
  deliveryArea,
  onChangeDeliveryArea,
  deliveryPhone,
  onChangeDeliveryPhone,
  selectedStaffId,
  onChangeStaffId,
  orderNotes,
  onChangeOrderNotes,
  onAddNewCustomer,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustArea, setNewCustArea] = useState('F-7');

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    if (!custId) {
      onSelectCustomer(null);
      return;
    }
    const found = customers.find((c) => c.id === custId);
    if (found) {
      onSelectCustomer(found);
      onChangeGuestName(found.full_name);
      onChangeDeliveryAddress(found.default_address || '');
      onChangeDeliveryArea(found.default_area || 'F-7');
      onChangeDeliveryPhone(found.phone || '');
    }
  };

  const handleCreateNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;
    onAddNewCustomer({
      full_name: newCustName,
      phone: newCustPhone,
      address: newCustAddress,
      area: newCustArea,
    });
    onChangeGuestName(newCustName);
    setShowAddModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
  };

  return (
    <div className="bg-[#1c1b1b] border border-[#353534] rounded-2xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#353534]">
        <h4 className="font-bold text-xs text-[#e5e2e1] uppercase font-label-caps">
          Customer & Delivery Info
        </h4>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-[11px] text-[#fab895] hover:text-[#eeae8b] flex items-center space-x-1 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Customer Profile & Guest Name Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-[#9f8d85] block mb-1">Customer Profile</label>
          <div className="relative">
            <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9f8d85]" />
            <select
              value={selectedCustomer?.id || ''}
              onChange={handleCustomerSelect}
              className="w-full bg-[#131313] border border-[#353534] rounded-xl pl-9 pr-2 py-1.5 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
            >
              <option value="">Walk-in / Anonymous Guest</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.phone})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-[#9f8d85] block mb-1">
            Guest Name <span className="text-rose-400 font-bold">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9f8d85]" />
            <input
              type="text"
              value={guestName}
              onChange={(e) => onChangeGuestName(e.target.value)}
              placeholder="e.g. Ali Khan (Walk-in)"
              className={`w-full bg-[#131313] border rounded-xl pl-9 pr-2 py-1.5 text-xs text-[#e5e2e1] focus:outline-none ${
                !guestName.trim()
                  ? 'border-rose-800/80 focus:border-rose-500'
                  : 'border-[#353534] focus:border-[#fab895]'
              }`}
            />
          </div>
          {!guestName.trim() && (
            <span className="text-[9px] text-rose-400 mt-0.5 block">Required</span>
          )}
        </div>
      </div>

      {/* Phone & Delivery Area Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-[#9f8d85] block mb-1">
            Phone <span className="text-rose-400 font-bold">*</span>
          </label>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9f8d85]" />
            <input
              type="text"
              value={deliveryPhone}
              onChange={(e) => onChangeDeliveryPhone(e.target.value)}
              placeholder="+92 300 0000000"
              className={`w-full bg-[#131313] border rounded-xl pl-9 pr-2 py-1.5 text-xs text-[#e5e2e1] focus:outline-none ${
                !deliveryPhone.trim()
                  ? 'border-rose-800/80 focus:border-rose-500'
                  : 'border-[#353534] focus:border-[#fab895]'
              }`}
            />
          </div>
          {!deliveryPhone.trim() && (
            <span className="text-[9px] text-rose-400 mt-0.5 block">Required</span>
          )}
        </div>

        <div>
          <label className="text-[10px] text-[#9f8d85] block mb-1">Delivery Area</label>
          <div className="relative">
            <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9f8d85]" />
            <select
              value={deliveryArea}
              onChange={(e) => onChangeDeliveryArea(e.target.value)}
              className="w-full bg-[#131313] border border-[#353534] rounded-xl pl-9 pr-2 py-1.5 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="text-[10px] text-[#9f8d85] block mb-1">
          Delivery Address <span className="text-rose-400 font-bold">*</span>
        </label>
        <div className="relative">
          <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9f8d85]" />
          <textarea
            rows={2}
            value={deliveryAddress}
            onChange={(e) => onChangeDeliveryAddress(e.target.value)}
            placeholder="Street address, house #, landmark..."
            className={`w-full bg-[#131313] border rounded-xl pl-9 pr-3 py-2 text-xs text-[#e5e2e1] focus:outline-none resize-none ${
              !deliveryAddress.trim()
                ? 'border-rose-800/80 focus:border-rose-500'
                : 'border-[#353534] focus:border-[#fab895]'
            }`}
          />
        </div>
        {!deliveryAddress.trim() && (
          <span className="text-[9px] text-rose-400 mt-0.5 block">Required</span>
        )}
      </div>

      {/* Staff & Order Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-[#9f8d85] block mb-1">Created By Staff</label>
          <select
            value={selectedStaffId}
            onChange={(e) => onChangeStaffId(e.target.value)}
            className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-1.5 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
          >
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-[#9f8d85] block mb-1">General Notes</label>
          <div className="relative">
            <StickyNote className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9f8d85]" />
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => onChangeOrderNotes(e.target.value)}
              placeholder="Rider note..."
              className="w-full bg-[#131313] border border-[#353534] rounded-xl pl-9 pr-2 py-1.5 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
            />
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#52443d] rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#353534] pb-3">
              <h3 className="font-bold text-sm text-[#e5e2e1]">Add New Customer Record</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#9f8d85] hover:text-[#e5e2e1]"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewCustomer} className="space-y-3">
              <div>
                <label className="text-xs text-[#9f8d85] block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Tariq Khan"
                  className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
                />
              </div>

              <div>
                <label className="text-xs text-[#9f8d85] block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
                />
              </div>

              <div>
                <label className="text-xs text-[#9f8d85] block mb-1">Default Area</label>
                <select
                  value={newCustArea}
                  onChange={(e) => setNewCustArea(e.target.value)}
                  className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
                >
                  {AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#9f8d85] block mb-1">Default Address</label>
                <textarea
                  rows={2}
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="Street address..."
                  className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895] resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#131313] text-[#9f8d85] rounded-xl text-xs font-semibold hover:text-[#e5e2e1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6e4025] text-[#eeae8b] border border-[#fab895]/30 rounded-xl text-xs font-semibold hover:bg-[#804b2b]"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
