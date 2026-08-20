import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types/database.types';
import { formatCurrency, formatExactDateTime } from '../../lib/utils';
import {
  X,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Save,
  Check,
  CreditCard,
  ChefHat,
  Sparkles,
} from 'lucide-react';
import { useStaff } from '../../hooks/useStaff';
import { useOrders } from '../../hooks/useOrders';
import { ReceiptView } from './ReceiptView';
import { getStatusBadge } from '../dashboard/RecentOrdersTable';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, nextStatus: OrderStatus) => void;
}

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

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
}) => {
  const { staffList } = useStaff();
  const { updateOrderIssueNotes, updateOrderStatus } = useOrders(undefined, { enableRealtime: false });

  const [activeTab, setActiveTab] = useState<'details' | 'receipt'>('details');
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [issueNotes, setIssueNotes] = useState<string>(order.issue_notes || '');
  const [isIssueSaved, setIsIssueSaved] = useState(false);

  useEffect(() => {
    setCurrentOrder(order);
    setIssueNotes(order.issue_notes || '');
  }, [order]);

  // Resolve Staff (Employee At Time - EAT)
  const staffMember = staffList.find((s) => s.id === currentOrder.created_by_staff);
  const eatStaffName =
    staffMember?.full_name ||
    (currentOrder.created_by_staff ? `Staff #${currentOrder.created_by_staff.slice(0, 8)}` : 'Online / Web System');

  const nextStatus = getNextStatus(currentOrder.status);

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;
    const updated = {
      ...currentOrder,
      status: nextStatus,
      payment_status: nextStatus === 'delivered' ? ('paid' as const) : currentOrder.payment_status,
      delivered_at: nextStatus === 'delivered' ? new Date().toISOString() : currentOrder.delivered_at,
    };
    setCurrentOrder(updated);

    if (onUpdateStatus) {
      onUpdateStatus(currentOrder.id, nextStatus);
    } else {
      updateOrderStatus.mutate({ orderId: currentOrder.id, status: nextStatus });
    }
  };

  const handleSaveIssueNotes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const hasIssue = Boolean(issueNotes.trim().length > 0);

    const updated = {
      ...currentOrder,
      issue_notes: issueNotes.trim() || null,
      has_issue: hasIssue,
    };
    setCurrentOrder(updated);

    await updateOrderIssueNotes.mutateAsync({
      orderId: currentOrder.id,
      issueNotes: issueNotes.trim() || null,
      hasIssue,
    });

    setIsIssueSaved(true);
    setTimeout(() => setIsIssueSaved(false), 2500);
  };

  const handleResolveIssue = async () => {
    const updated = {
      ...currentOrder,
      has_issue: false,
    };
    setCurrentOrder(updated);

    await updateOrderIssueNotes.mutateAsync({
      orderId: currentOrder.id,
      issueNotes: issueNotes.trim() || null,
      hasIssue: false,
    });

    setIsIssueSaved(true);
    setTimeout(() => setIsIssueSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto custom-scrollbar animate-fade-in">
      <div className="relative w-full max-w-4xl my-auto bg-[#FFFFFF] border border-[#000000]/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-modal-enter">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#000000]/10 bg-[#FFFDF7] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-lg text-[#000000]">
                  Order #{currentOrder.order_number}
                </span>
                {getStatusBadge(currentOrder.status)}
                {currentOrder.has_issue && (
                  <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>Flagged Issue</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#7a4900] mt-0.5 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-[#3d2500]" />
                <span>Placed: {formatExactDateTime(currentOrder.created_at)}</span>
                {currentOrder.delivered_at && (
                  <>
                    <span className="text-[#7a4900]/40">•</span>
                    <span className="text-emerald-700 font-medium">
                      Delivered: {formatExactDateTime(currentOrder.delivered_at)}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Tab Switcher & Status Controls */}
          <div className="flex items-center space-x-2">
            <div className="bg-[#F6F1EB] p-1 rounded-xl border border-[#000000]/10 flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'bg-[#3d2500] text-[#FFFDF7] shadow-xs'
                    : 'text-[#7a4900] hover:text-[#000000]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Order Details</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('receipt')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'receipt'
                    ? 'bg-[#3d2500] text-[#FFFDF7] shadow-xs'
                    : 'text-[#7a4900] hover:text-[#000000]'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Thermal & KOT</span>
              </button>
            </div>

            {nextStatus && (
              <button
                onClick={handleAdvanceStatus}
                className="bg-[#000000] hover:bg-[#3d2500] text-[#FFFDF7] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 shadow-xs"
              >
                <span>Advance to <span className="uppercase">{nextStatus.replace(/_/g, ' ')}</span></span>
                <span>&rarr;</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-[#7a4900] hover:text-[#000000] hover:bg-[#F6F1EB] rounded-xl transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6">
          {activeTab === 'details' ? (
            <>
              {/* Top Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Customer Details */}
                <div className="bg-[#FFFDF7] border border-[#000000]/10 rounded-xl p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center space-x-2 text-[#3d2500] border-b border-[#000000]/10 pb-2">
                    <User className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#000000]">
                      Customer Profile
                    </h4>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-[#000000] text-sm">
                      {currentOrder.customer_name || currentOrder.guest_name || 'Walk-in Guest'}
                    </p>
                    <p className="text-[#3d2500] font-mono flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-[#7a4900]" />
                      <span>{currentOrder.delivery_phone || 'No phone provided'}</span>
                    </p>
                  </div>
                </div>

                {/* Delivery Location */}
                <div className="bg-[#FFFDF7] border border-[#000000]/10 rounded-xl p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center space-x-2 text-[#3d2500] border-b border-[#000000]/10 pb-2">
                    <MapPin className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#000000]">
                      Delivery Address
                    </h4>
                  </div>
                  <div className="space-y-1 text-xs">
                    {currentOrder.delivery_area && (
                      <span className="inline-block bg-[#F6F1EB] text-[#3d2500] border border-[#000000]/10 px-2 py-0.5 rounded text-[10px] font-bold">
                        Sector / Area: {currentOrder.delivery_area}
                      </span>
                    )}
                    <p className="text-[#7a4900] leading-relaxed">
                      {currentOrder.delivery_address || 'Counter Pickup'}
                    </p>
                  </div>
                </div>

                {/* Staff & Metadata (EAT) */}
                <div className="bg-[#FFFDF7] border border-[#000000]/10 rounded-xl p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center space-x-2 text-[#3d2500] border-b border-[#000000]/10 pb-2">
                    <ChefHat className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#000000]">
                      Order Handling (EAT)
                    </h4>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] text-[#7a4900] block font-semibold uppercase">
                        Employee At Time (EAT):
                      </span>
                      <p className="font-bold text-[#000000] bg-[#F6F1EB] px-2 py-1 rounded-lg border border-[#000000]/10 inline-block mt-0.5">
                        {eatStaffName}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7a4900] block font-semibold uppercase">
                        Payment Settlement:
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                          currentOrder.payment_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : currentOrder.payment_status === 'partial'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {currentOrder.payment_status} ({currentOrder.payment_method})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout Customer Order Notes */}
              {currentOrder.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                  <span className="font-bold text-amber-900 flex items-center space-x-1 mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Customer Order Instructions (Checkout Notes):</span>
                  </span>
                  <p className="text-amber-800 font-medium pl-4">{currentOrder.notes}</p>
                </div>
              )}

              {/* Order Items Table */}
              <div className="bg-[#FFFFFF] border border-[#000000]/10 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3.5 bg-[#FFFDF7] border-b border-[#000000]/10 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#000000]">
                    Ordered Items & Variants ({currentOrder.items.length})
                  </h4>
                  <span className="text-[11px] text-[#7a4900]">
                    Total Items Qty: {currentOrder.items.reduce((acc, i) => acc + i.quantity, 0)}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#000000]">
                    <thead className="bg-[#F6F1EB] text-[#7a4900] font-label-caps uppercase text-[10px] tracking-wider border-b border-[#000000]/10">
                      <tr>
                        <th className="py-2.5 px-4">Item Description</th>
                        <th className="py-2.5 px-4">Variant / Option</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Unit Price</th>
                        <th className="py-2.5 px-4 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#000000]/5">
                      {currentOrder.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-[#F6F1EB]/60">
                          <td className="py-3 px-4 font-semibold text-[#000000]">
                            {item.product_name_snapshot}
                          </td>
                          <td className="py-3 px-4 text-[#3d2500] font-medium">
                            {item.variant_name || <span className="text-[#7a4900]/50">Default</span>}
                          </td>
                          <td className="py-3 px-4 text-center font-bold font-mono text-[#000000]">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right text-[#7a4900]">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-[#000000]">
                            {formatCurrency(item.line_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary Footer */}
                <div className="p-4 bg-[#FFFDF7] border-t border-[#000000]/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-xs">
                    <p className="text-[#7a4900] text-[11px]">
                      Payment Method: <span className="text-[#000000] font-bold uppercase">{currentOrder.payment_method}</span>
                    </p>
                    <p className="text-[#7a4900] text-[11px]">
                      Payment Status: <span className="text-[#000000] font-bold uppercase">{currentOrder.payment_status}</span>
                    </p>
                    {currentOrder.payment_status === 'partial' && (
                      <p className="text-amber-700 font-bold text-xs mt-1">
                        Balance Due: {formatCurrency(currentOrder.total - currentOrder.paid_amount)}
                      </p>
                    )}
                    {currentOrder.payment_status === 'unpaid' && (
                      <p className="text-rose-700 font-bold text-xs mt-1">
                        Balance Due: {formatCurrency(currentOrder.total)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-right sm:max-w-xs sm:ml-auto w-full">
                    <div className="flex justify-between text-[#7a4900]">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-[#000000]">{formatCurrency(currentOrder.subtotal)}</span>
                    </div>
                    {currentOrder.discount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(currentOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#7a4900]">
                      <span>Delivery Fee:</span>
                      <span className="font-semibold text-[#000000]">+{formatCurrency(currentOrder.delivery_fee)}</span>
                    </div>
                    {currentOrder.service_charges > 0 && (
                      <div className="flex justify-between text-[#7a4900]">
                        <span>Service Charges:</span>
                        <span className="font-semibold text-[#000000]">+{formatCurrency(currentOrder.service_charges)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-[#3d2500] pt-2 border-t border-[#000000]/10">
                      <span>Grand Total:</span>
                      <span>{formatCurrency(currentOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff-Only Issue Notes & Flagging Panel */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#000000]">
                      Staff Internal Issue Notes & Complaint Flagging
                    </h4>
                  </div>
                  {currentOrder.has_issue && (
                    <button
                      type="button"
                      onClick={handleResolveIssue}
                      className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      ✓ Mark Issue as Resolved
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-[#7a4900]">
                  Record any complaints, missing items, delivery delays, or staff notes for this order. Saving a note will automatically flag this order in the <span className="text-[#3d2500] font-semibold">"Order Issues"</span> tab.
                </p>

                <form onSubmit={handleSaveIssueNotes} className="space-y-3">
                  <textarea
                    rows={3}
                    value={issueNotes}
                    onChange={(e) => setIssueNotes(e.target.value)}
                    placeholder="E.g., Customer called: missing side salad from bag. Kitchen re-dispatched rider at 4:45 PM..."
                    className="w-full bg-[#FFFFFF] border border-amber-200 rounded-xl p-3 text-xs text-[#000000] focus:outline-none focus:border-[#3d2500] placeholder-[#7a4900]/40"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#7a4900]">
                      Status:{' '}
                      {currentOrder.has_issue ? (
                        <strong className="text-rose-600">Flagged in Order Issues</strong>
                      ) : (
                        <strong className="text-emerald-700">Normal / Clear</strong>
                      )}
                    </span>

                    <button
                      type="submit"
                      disabled={updateOrderIssueNotes.isPending}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                        isIssueSaved
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-[#000000] hover:bg-[#3d2500] text-[#FFFDF7]'
                      }`}
                    >
                      {isIssueSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Saved Successfully!</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Issue Notes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            /* Thermal Receipt & KOT Tab */
            <div className="flex flex-col items-center justify-center py-2">
              <ReceiptView
                order={currentOrder}
                onUpdateStatus={onUpdateStatus}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
