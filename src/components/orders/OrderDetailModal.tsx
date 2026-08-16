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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto custom-scrollbar">
      <div className="relative w-full max-w-4xl my-auto bg-[#181818] border border-[#353534] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#2e2e2e] bg-[#1c1b1b] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-lg text-[#e5e2e1]">
                  Order #{currentOrder.order_number}
                </span>
                {getStatusBadge(currentOrder.status)}
                {currentOrder.has_issue && (
                  <span className="inline-flex items-center space-x-1 bg-rose-950/80 text-rose-300 border border-rose-700/60 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>Flagged Issue</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#9f8d85] mt-0.5 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-[#fab895]" />
                <span>Placed: {formatExactDateTime(currentOrder.created_at)}</span>
                {currentOrder.delivered_at && (
                  <>
                    <span className="text-[#574939]">•</span>
                    <span className="text-emerald-400">
                      Delivered: {formatExactDateTime(currentOrder.delivered_at)}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Tab Switcher & Status Controls */}
          <div className="flex items-center space-x-2">
            <div className="bg-[#131313] p-1 rounded-xl border border-[#353534] flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'bg-[#6e4025] text-[#eeae8b] shadow'
                    : 'text-[#9f8d85] hover:text-[#e5e2e1]'
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
                    ? 'bg-[#6e4025] text-[#eeae8b] shadow'
                    : 'text-[#9f8d85] hover:text-[#e5e2e1]'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Thermal & KOT</span>
              </button>
            </div>

            {nextStatus && (
              <button
                onClick={handleAdvanceStatus}
                className="bg-[#6e4025] hover:bg-[#804b2b] text-[#eeae8b] border border-[#fab895]/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
              >
                <span>Advance to <span className="uppercase">{nextStatus.replace(/_/g, ' ')}</span></span>
                <span>&rarr;</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-[#9f8d85] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] rounded-xl transition-colors cursor-pointer"
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
                <div className="bg-[#1c1b1b] border border-[#2e2e2e] rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center space-x-2 text-[#fab895] border-b border-[#2e2e2e] pb-2">
                    <User className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#e5e2e1]">
                      Customer Profile
                    </h4>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-[#e5e2e1] text-sm">
                      {currentOrder.customer_name || currentOrder.guest_name || 'Walk-in Guest'}
                    </p>
                    <p className="text-[#fab895] font-mono flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-[#9f8d85]" />
                      <span>{currentOrder.delivery_phone || 'No phone provided'}</span>
                    </p>
                  </div>
                </div>

                {/* Delivery Location */}
                <div className="bg-[#1c1b1b] border border-[#2e2e2e] rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center space-x-2 text-[#fab895] border-b border-[#2e2e2e] pb-2">
                    <MapPin className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#e5e2e1]">
                      Delivery Address
                    </h4>
                  </div>
                  <div className="space-y-1 text-xs">
                    {currentOrder.delivery_area && (
                      <span className="inline-block bg-[#2a2a2a] text-[#eeae8b] border border-[#353534] px-2 py-0.5 rounded text-[10px] font-bold">
                        Sector / Area: {currentOrder.delivery_area}
                      </span>
                    )}
                    <p className="text-[#d6c3b9] leading-relaxed">
                      {currentOrder.delivery_address || 'Counter Pickup'}
                    </p>
                  </div>
                </div>

                {/* Staff & Metadata (EAT) */}
                <div className="bg-[#1c1b1b] border border-[#2e2e2e] rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center space-x-2 text-[#fab895] border-b border-[#2e2e2e] pb-2">
                    <ChefHat className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#e5e2e1]">
                      Order Handling (EAT)
                    </h4>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] text-[#9f8d85] block font-semibold uppercase">
                        Employee At Time (EAT):
                      </span>
                      <p className="font-bold text-[#e5e2e1] bg-[#131313] px-2 py-1 rounded-lg border border-[#2e2e2e] inline-block mt-0.5">
                        {eatStaffName}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9f8d85] block font-semibold uppercase">
                        Payment Settlement:
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                          currentOrder.payment_status === 'paid'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : currentOrder.payment_status === 'partial'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
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
                <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 text-xs">
                  <span className="font-bold text-amber-300 flex items-center space-x-1 mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Customer Order Instructions (Checkout Notes):</span>
                  </span>
                  <p className="text-amber-100 font-medium pl-4">{currentOrder.notes}</p>
                </div>
              )}

              {/* Order Items Table */}
              <div className="bg-[#1c1b1b] border border-[#2e2e2e] rounded-xl overflow-hidden shadow">
                <div className="p-3.5 bg-[#131313] border-b border-[#2e2e2e] flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#e5e2e1]">
                    Ordered Items & Variants ({currentOrder.items.length})
                  </h4>
                  <span className="text-[11px] text-[#9f8d85]">
                    Total Items Qty: {currentOrder.items.reduce((acc, i) => acc + i.quantity, 0)}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#d6c3b9]">
                    <thead className="bg-[#181818] text-[#9f8d85] font-label-caps uppercase text-[10px] tracking-wider border-b border-[#2e2e2e]">
                      <tr>
                        <th className="py-2.5 px-4">Item Description</th>
                        <th className="py-2.5 px-4">Variant / Option</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Unit Price</th>
                        <th className="py-2.5 px-4 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]">
                      {currentOrder.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-[#201f1f]">
                          <td className="py-3 px-4 font-semibold text-[#e5e2e1]">
                            {item.product_name_snapshot}
                          </td>
                          <td className="py-3 px-4 text-[#fab895]">
                            {item.variant_name || <span className="text-[#6d6d6d]">Default</span>}
                          </td>
                          <td className="py-3 px-4 text-center font-bold font-mono text-[#e5e2e1]">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right text-[#9f8d85]">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-[#e5e2e1]">
                            {formatCurrency(item.line_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary Footer */}
                <div className="p-4 bg-[#141414] border-t border-[#2e2e2e] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-xs">
                    <p className="text-[#9f8d85] text-[11px]">
                      Payment Method: <span className="text-[#e5e2e1] font-bold uppercase">{currentOrder.payment_method}</span>
                    </p>
                    <p className="text-[#9f8d85] text-[11px]">
                      Payment Status: <span className="text-[#e5e2e1] font-bold uppercase">{currentOrder.payment_status}</span>
                    </p>
                    {currentOrder.payment_status === 'partial' && (
                      <p className="text-amber-400 font-bold text-xs mt-1">
                        Balance Due: {formatCurrency(currentOrder.total - currentOrder.paid_amount)}
                      </p>
                    )}
                    {currentOrder.payment_status === 'unpaid' && (
                      <p className="text-rose-400 font-bold text-xs mt-1">
                        Balance Due: {formatCurrency(currentOrder.total)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-right sm:max-w-xs sm:ml-auto w-full">
                    <div className="flex justify-between text-[#9f8d85]">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-[#e5e2e1]">{formatCurrency(currentOrder.subtotal)}</span>
                    </div>
                    {currentOrder.discount > 0 && (
                      <div className="flex justify-between text-rose-400">
                        <span>Discount:</span>
                        <span>-{formatCurrency(currentOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#9f8d85]">
                      <span>Delivery Fee:</span>
                      <span className="font-semibold text-[#e5e2e1]">+{formatCurrency(currentOrder.delivery_fee)}</span>
                    </div>
                    {currentOrder.service_charges > 0 && (
                      <div className="flex justify-between text-[#9f8d85]">
                        <span>Service Charges:</span>
                        <span className="font-semibold text-[#e5e2e1]">+{formatCurrency(currentOrder.service_charges)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-[#fab895] pt-2 border-t border-[#2e2e2e]">
                      <span>Grand Total:</span>
                      <span>{formatCurrency(currentOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff-Only Issue Notes & Flagging Panel */}
              <div className="bg-[#1c1b1b] border border-amber-700/40 rounded-xl p-4 sm:p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#e5e2e1]">
                      Staff Internal Issue Notes & Complaint Flagging
                    </h4>
                  </div>
                  {currentOrder.has_issue && (
                    <button
                      type="button"
                      onClick={handleResolveIssue}
                      className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      ✓ Mark Issue as Resolved
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-[#9f8d85]">
                  Record any complaints, missing items, delivery delays, or staff notes for this order. Saving a note will automatically flag this order in the <span className="text-[#fab895] font-semibold">"Order Issues"</span> tab.
                </p>

                <form onSubmit={handleSaveIssueNotes} className="space-y-3">
                  <textarea
                    rows={3}
                    value={issueNotes}
                    onChange={(e) => setIssueNotes(e.target.value)}
                    placeholder="E.g., Customer called: missing side salad from bag. Kitchen re-dispatched rider at 4:45 PM..."
                    className="w-full bg-[#131313] border border-[#353534] rounded-xl p-3 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895] placeholder-[#666]"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#9f8d85]">
                      Status:{' '}
                      {currentOrder.has_issue ? (
                        <strong className="text-rose-400">Flagged in Order Issues</strong>
                      ) : (
                        <strong className="text-emerald-400">Normal / Clear</strong>
                      )}
                    </span>

                    <button
                      type="submit"
                      disabled={updateOrderIssueNotes.isPending}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isIssueSaved
                          ? 'bg-emerald-900 text-emerald-200 border border-emerald-600'
                          : 'bg-[#6e4025] hover:bg-[#804b2b] text-[#eeae8b] border border-[#fab895]/30 shadow'
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
