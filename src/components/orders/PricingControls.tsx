import React, { useState, useEffect } from 'react';
import { PaymentMethod, Staff } from '../../types/database.types';
import { formatCurrency } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useStaff } from '../../hooks/useStaff';
import { CreditCard, Banknote, Globe, Printer, StickyNote, User } from 'lucide-react';

interface PricingControlsProps {
  subtotal: number;
  discount: number;
  onChangeDiscount: (val: number) => void;
  deliveryFee: number;
  onChangeDeliveryFee: (val: number) => void;
  serviceCharges: number;
  onChangeServiceCharges: (val: number) => void;
  paymentMethod: PaymentMethod;
  onChangePaymentMethod: (method: PaymentMethod) => void;
  paidAmount: number | null;
  onChangePaidAmount: (val: number | null) => void;
  onSubmitOrder: () => void;
  isSubmitting?: boolean;
  isMetaValid?: boolean;
  staffList?: Staff[];
  selectedStaffId?: string;
  onChangeStaffId?: (val: string) => void;
  orderNotes?: string;
  onChangeOrderNotes?: (val: string) => void;
}

export const PricingControls: React.FC<PricingControlsProps> = ({
  subtotal,
  discount,
  onChangeDiscount,
  deliveryFee,
  onChangeDeliveryFee,
  serviceCharges,
  onChangeServiceCharges,
  paymentMethod,
  onChangePaymentMethod,
  paidAmount,
  onChangePaidAmount,
  onSubmitOrder,
  isSubmitting = false,
  isMetaValid = true,
  staffList: propsStaffList,
  selectedStaffId: propsSelectedStaffId,
  onChangeStaffId: propsOnChangeStaffId,
  orderNotes: propsOrderNotes,
  onChangeOrderNotes: propsOnChangeOrderNotes,
}) => {
  const { user: currentStaff } = useAuth();
  const { staffList: fetchedStaffList } = useStaff();

  // Fallback to internal staff list query (only active staff)
  const activeStaffList = (propsStaffList || fetchedStaffList || []).filter((s) => s.is_active !== false);

  const [internalStaffId, setInternalStaffId] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');

  const currentStaffId = propsSelectedStaffId !== undefined ? propsSelectedStaffId : internalStaffId;
  const currentNotes = propsOrderNotes !== undefined ? propsOrderNotes : internalNotes;

  // Default selected staff member to logged-in user from AuthContext
  useEffect(() => {
    if (!propsSelectedStaffId && !internalStaffId && currentStaff?.id) {
      setInternalStaffId(currentStaff.id);
    }
  }, [currentStaff?.id, propsSelectedStaffId, internalStaffId]);

  const [discountType, setDiscountType] = useState<'rs' | 'percent'>('rs');
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Synchronize discountValue when parent resets discount to 0
  useEffect(() => {
    if (discount === 0 && discountValue !== 0 && discountType === 'rs') {
      setDiscountValue(0);
    }
  }, [discount, discountType, discountValue]);

  // Recalculate percentage discount when subtotal or discountValue changes in percent mode
  useEffect(() => {
    if (discountType === 'percent') {
      const calculatedRs = subtotal > 0 ? (subtotal * discountValue) / 100 : 0;
      onChangeDiscount(calculatedRs);
    }
  }, [subtotal, discountValue, discountType, onChangeDiscount]);

  const handleToggleDiscountType = (type: 'rs' | 'percent') => {
    setDiscountType(type);
    setDiscountValue(0);
    onChangeDiscount(0);
  };

  const handleDiscountValueChange = (val: number) => {
    const safeVal = Math.max(0, val);
    setDiscountValue(safeVal);
    if (discountType === 'rs') {
      onChangeDiscount(safeVal);
    } else {
      const calculatedRs = subtotal > 0 ? (subtotal * safeVal) / 100 : 0;
      onChangeDiscount(calculatedRs);
    }
  };

  const total = Math.max(0, subtotal - discount + deliveryFee + serviceCharges);
  const effectivePaid = paidAmount === null || paidAmount === undefined ? total : paidAmount;
  const changeDue = Math.max(0, effectivePaid - total);
  const balanceDue = effectivePaid < total ? total - effectivePaid : 0;

  const handleStaffChange = (val: string) => {
    if (propsOnChangeStaffId) {
      propsOnChangeStaffId(val);
    } else {
      setInternalStaffId(val);
    }
  };

  const handleNotesChange = (val: string) => {
    if (propsOnChangeOrderNotes) {
      propsOnChangeOrderNotes(val);
    } else {
      setInternalNotes(val);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#000000]/10 rounded-2xl p-4 shadow-xs space-y-4">
      <h4 className="font-bold text-xs text-[#000000] uppercase font-label-caps border-b border-[#000000]/10 pb-2">
        Totals & Payment Settlement
      </h4>

      {/* Staff & Notes Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#F6F1EB] p-2.5 rounded-xl border border-[#000000]/10">
        <div>
          <label className="text-[10px] text-[#7a4900] block mb-1">Created By Staff</label>
          <div className="relative">
            <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7a4900]" />
            <select
              value={currentStaffId || (activeStaffList[0]?.id ?? '')}
              onChange={(e) => handleStaffChange(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#000000]/15 rounded-lg pl-8 pr-2 py-1.5 text-xs text-[#000000] focus:outline-none focus:border-[#3d2500]"
            >
              {activeStaffList.length === 0 ? (
                <option value="">No Staff Available</option>
              ) : (
                activeStaffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.role})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-[#7a4900] block mb-1">Order Notes</label>
          <div className="relative">
            <StickyNote className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7a4900]" />
            <input
              type="text"
              value={currentNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Rider / Kitchen notes..."
              className="w-full bg-[#FFFFFF] border border-[#000000]/15 rounded-lg pl-8 pr-2 py-1.5 text-xs text-[#000000] placeholder-[#7a4900]/40 focus:outline-none focus:border-[#3d2500]"
            />
          </div>
        </div>
      </div>

      {/* Adjustments inputs (Discount, Delivery Fee, Service Charges) */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-[#7a4900] block">
              Discount {discountType === 'percent' ? '(%)' : '(Rs)'}
            </label>
            <div className="flex items-center bg-[#F6F1EB] border border-[#000000]/10 rounded-lg p-0.5 text-[9px] font-bold">
              <button
                type="button"
                onClick={() => handleToggleDiscountType('rs')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  discountType === 'rs'
                    ? 'bg-[#3d2500] text-[#FFFDF7] shadow-2xs'
                    : 'text-[#7a4900] hover:text-[#000000]'
                }`}
              >
                Rs
              </button>
              <button
                type="button"
                onClick={() => handleToggleDiscountType('percent')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  discountType === 'percent'
                    ? 'bg-[#3d2500] text-[#FFFDF7] shadow-2xs'
                    : 'text-[#7a4900] hover:text-[#000000]'
                }`}
              >
                %
              </button>
            </div>
          </div>
          <input
            type="number"
            min="0"
            max={discountType === 'percent' ? 100 : undefined}
            value={discountValue || ''}
            onChange={(e) => handleDiscountValueChange(Number(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
            placeholder="0"
            className="w-full bg-[#F6F1EB] border border-[#000000]/15 rounded-xl px-2.5 py-1.5 text-xs text-[#000000] focus:outline-none focus:border-[#3d2500]"
          />
          {discountType === 'percent' && discountValue > 0 && (
            <span className="text-[9px] text-[#3d2500] mt-0.5 block font-semibold">
              = {formatCurrency((subtotal * discountValue) / 100)} off
            </span>
          )}
        </div>

        <div>
          <label className="text-[10px] text-[#7a4900] block mb-1">Delivery Fee</label>
          <input
            type="number"
            min="0"
            value={deliveryFee || ''}
            onChange={(e) => onChangeDeliveryFee(Number(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
            placeholder="150"
            className="w-full bg-[#F6F1EB] border border-[#000000]/15 rounded-xl px-2.5 py-1.5 text-xs text-[#000000] focus:outline-none focus:border-[#3d2500]"
          />
        </div>

        <div>
          <label className="text-[10px] text-[#7a4900] block mb-1">Service Charges</label>
          <input
            type="number"
            min="0"
            value={serviceCharges || ''}
            onChange={(e) => onChangeServiceCharges(Number(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
            placeholder="50"
            className="w-full bg-[#F6F1EB] border border-[#000000]/15 rounded-xl px-2.5 py-1.5 text-xs text-[#000000] focus:outline-none focus:border-[#3d2500]"
          />
        </div>
      </div>

      {/* Summary Math Breakdown */}
      <div className="bg-[#F6F1EB] border border-[#000000]/10 rounded-xl p-3 space-y-1.5 text-xs">
        <div className="flex justify-between text-[#7a4900]">
          <span>Subtotal:</span>
          <span className="font-semibold text-[#000000]">{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-rose-600">
            <span>Discount {discountType === 'percent' ? `(${discountValue}%)` : ''}:</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        {deliveryFee > 0 && (
          <div className="flex justify-between text-[#7a4900]">
            <span>Delivery Fee:</span>
            <span>+{formatCurrency(deliveryFee)}</span>
          </div>
        )}
        {serviceCharges > 0 && (
          <div className="flex justify-between text-[#7a4900]">
            <span>Service Charges:</span>
            <span>+{formatCurrency(serviceCharges)}</span>
          </div>
        )}
        <div className="pt-2 border-t border-[#000000]/10 flex justify-between items-baseline">
          <span className="font-bold text-sm text-[#000000]">Grand Total:</span>
          <span className="font-bold text-lg text-[#3d2500]">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div>
        <label className="text-[10px] text-[#7a4900] block mb-1">Payment Method</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onChangePaymentMethod('cash')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              paymentMethod === 'cash'
                ? 'bg-[#3d2500] text-[#FFFDF7] border-[#3d2500] shadow-xs'
                : 'bg-[#F6F1EB] text-[#7a4900] border-[#000000]/10 hover:text-[#000000]'
            }`}
          >
            <Banknote className="w-4 h-4 mb-1" />
            <span>Cash</span>
          </button>

          <button
            type="button"
            onClick={() => onChangePaymentMethod('card')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              paymentMethod === 'card'
                ? 'bg-[#3d2500] text-[#FFFDF7] border-[#3d2500] shadow-xs'
                : 'bg-[#F6F1EB] text-[#7a4900] border-[#000000]/10 hover:text-[#000000]'
            }`}
          >
            <CreditCard className="w-4 h-4 mb-1" />
            <span>Card</span>
          </button>

          <button
            type="button"
            onClick={() => onChangePaymentMethod('online')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              paymentMethod === 'online'
                ? 'bg-[#3d2500] text-[#FFFDF7] border-[#3d2500] shadow-xs'
                : 'bg-[#F6F1EB] text-[#7a4900] border-[#000000]/10 hover:text-[#000000]'
            }`}
          >
            <Globe className="w-4 h-4 mb-1" />
            <span>Online</span>
          </button>
        </div>
      </div>

      {/* Paid Amount / Settlement Input */}
      <div className="grid grid-cols-2 gap-2 bg-[#F6F1EB] p-2.5 rounded-xl border border-[#000000]/10">
        <div>
          <label className="text-[10px] text-[#7a4900] block mb-1">
            Paid Amount (Rs)
          </label>
          <input
            type="number"
            min="0"
            value={paidAmount === null || paidAmount === undefined || paidAmount === 0 ? '' : paidAmount}
            onChange={(e) => {
              const val = e.target.value;
              onChangePaidAmount(val === '' ? null : Number(val));
            }}
            onFocus={(e) => e.target.select()}
            placeholder={`Default: ${formatCurrency(total)} (Full)`}
            className="w-full bg-[#FFFFFF] border border-[#000000]/15 rounded-lg px-2 py-1 text-xs text-[#000000] focus:outline-none focus:border-[#3d2500]"
          />
        </div>
        <div>
          <label className="text-[10px] text-[#7a4900] block mb-1">
            {balanceDue > 0 ? 'Balance Due' : 'Change Due'}
          </label>
          <p
            className={`text-xs font-bold py-1 ${
              balanceDue > 0 ? 'text-amber-800' : 'text-emerald-700'
            }`}
          >
            {balanceDue > 0 ? formatCurrency(balanceDue) : formatCurrency(changeDue)}
          </p>
        </div>
        <p className="col-span-2 text-[9px] text-[#7a4900]">
          Leave blank for full payment. Enter 0 for Unpaid. Enter partial amount for Balance Due status.
        </p>
      </div>

      {/* Primary Confirm Order Button */}
      <button
        onClick={onSubmitOrder}
        disabled={isSubmitting || total <= 0 || !isMetaValid}
        className="w-full bg-[#000000] hover:bg-[#3d2500] text-[#FFFDF7] font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Printer className="w-4 h-4" />
        <span>
          {isSubmitting
            ? 'Processing Order...'
            : !isMetaValid
            ? 'Fill Required Customer Fields (Name, Phone, Address)'
            : 'Confirm Order & Print Thermal Bill'}
        </span>
      </button>
    </div>
  );
};
