import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types/database.types';
import { formatCurrency, formatExactDateTime } from '../../lib/utils';
import { ArrowLeft, Utensils, FileText, Layers, Truck, Check, X } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useStaff } from '../../hooks/useStaff';

interface ReceiptViewProps {
  order: Order;
  onClose?: () => void;
  onUpdateStatus?: (orderId: string, nextStatus: OrderStatus) => void;
}

type PrintMode = 'bill' | 'kot' | 'both';
type PaperSize = '80mm' | '58mm';

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

// Centralized Thermal Printer Adapter Function
export const executeThermalPrint = ({
  mode,
  paperSize,
  order,
}: {
  mode: PrintMode;
  paperSize: PaperSize;
  order: Order;
}) => {
  // Triggers native browser print dialog (easy to swap in physical hardware/ESC-POS SDK later)
  window.print();
};

export const ReceiptView: React.FC<ReceiptViewProps> = ({ order, onClose, onUpdateStatus }) => {
  const { updateDeliveryFee, updateOrderStatus } = useOrders();
  const { staffList } = useStaff();
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [paperSize, setPaperSize] = useState<PaperSize>('80mm');
  const [viewMode, setViewMode] = useState<PrintMode>('bill');
  const [deliveryFeeInput, setDeliveryFeeInput] = useState<string>(
    order.delivery_fee.toString()
  );
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setCurrentOrder(order);
    setDeliveryFeeInput(order.delivery_fee.toString());
  }, [order]);

  const handleAdvanceStatus = () => {
    const next = getNextStatus(currentOrder.status);
    if (!next) return;

    // Optimistic local update
    const updated = {
      ...currentOrder,
      status: next,
      payment_status: next === 'delivered' ? ('paid' as const) : currentOrder.payment_status,
    };
    setCurrentOrder(updated);

    if (onUpdateStatus) {
      onUpdateStatus(currentOrder.id, next);
    } else {
      updateOrderStatus.mutate({ orderId: currentOrder.id, status: next });
    }
  };

  const handleSaveDeliveryFee = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const feeNum = Math.max(0, parseFloat(deliveryFeeInput) || 0);
    const subtotal = currentOrder.subtotal || 0;
    const discount = currentOrder.discount || 0;
    const serviceCharges = currentOrder.service_charges || 0;
    const newTotal = Math.max(0, subtotal - discount + serviceCharges + feeNum);

    const updated = {
      ...currentOrder,
      delivery_fee: feeNum,
      total: newTotal,
    };
    setCurrentOrder(updated);

    updateDeliveryFee.mutate({
      orderId: currentOrder.id,
      deliveryFee: feeNum,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTriggerPrint = (mode: PrintMode) => {
    setViewMode(mode);
    // Allow state transition to render correct ticket view prior to print dialog
    setTimeout(() => {
      executeThermalPrint({ mode, paperSize, order: currentOrder });
    }, 100);
  };

  const is58mm = paperSize === '58mm';
  const containerWidthClass = is58mm ? 'max-w-[250px]' : 'max-w-[340px]';
  const textSizeClass = is58mm ? 'text-[10px]' : 'text-[11px]';
  const paddingClass = is58mm ? 'p-3' : 'p-4 sm:p-6';

  const nextStatus = getNextStatus(currentOrder.status);

  return (
    <div className="flex flex-col items-center p-2 sm:p-4 w-full text-[#000000]">
      {/* Control Bar (Hidden when printing) */}
      <div className="w-full max-w-md mb-4 space-y-3 print:hidden">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2">
          {onClose ? (
            <button
              onClick={onClose}
              className="flex items-center space-x-1 text-xs font-bold text-[#7a4900] hover:text-[#000000] bg-[#FFFFFF] border border-[#000000]/15 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          ) : (
            <div></div>
          )}

          {/* Status Advance Button inside Modal */}
          {nextStatus ? (
            <button
              onClick={handleAdvanceStatus}
              className="flex items-center space-x-1.5 text-xs font-bold text-[#FFFDF7] bg-[#000000] hover:bg-[#3d2500] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <span>Advance to <span className="uppercase">{nextStatus.replace(/_/g, ' ')}</span></span>
              <span>&rarr;</span>
            </button>
          ) : (
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
              Delivered ✓
            </span>
          )}

          {/* Paper Size Selector */}
          <div className="flex items-center bg-[#F6F1EB] border border-[#000000]/10 p-1 rounded-xl space-x-1">
            <button
              type="button"
              onClick={() => setPaperSize('80mm')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                paperSize === '80mm'
                  ? 'bg-[#3d2500] text-[#FFFDF7] shadow-xs'
                  : 'text-[#7a4900] hover:text-[#000000]'
              }`}
            >
              80mm
            </button>
            <button
              type="button"
              onClick={() => setPaperSize('58mm')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                paperSize === '58mm'
                  ? 'bg-[#3d2500] text-[#FFFDF7] shadow-xs'
                  : 'text-[#7a4900] hover:text-[#000000]'
              }`}
            >
              58mm
            </button>
          </div>
        </div>

        {/* Editable Delivery Fee Toolbar */}
        <form
          onSubmit={handleSaveDeliveryFee}
          className="bg-[#FFFFFF] border border-[#000000]/10 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-[#3d2500]" />
            <div>
              <p className="text-xs font-bold text-[#000000]">Delivery Fee</p>
              <p className="text-[10px] text-[#7a4900]">Adjusts order grand total</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-28">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7a4900]">
                Rs
              </span>
              <input
                type="number"
                min="0"
                step="10"
                value={deliveryFeeInput === '0' ? '' : deliveryFeeInput}
                onChange={(e) => setDeliveryFeeInput(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="w-full bg-[#F6F1EB] border border-[#000000]/15 rounded-xl pl-8 pr-2 py-1.5 text-xs font-bold text-[#000000] focus:outline-none focus:border-[#3d2500]"
              />
            </div>
            <button
              type="submit"
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-[#000000] hover:bg-[#3d2500] text-[#FFFDF7] shadow-xs'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Fee</span>
              )}
            </button>
          </div>
        </form>

        {/* Print Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleTriggerPrint('bill')}
            className={`flex items-center justify-center space-x-1.5 text-xs font-bold py-2 px-3 rounded-xl border transition-all cursor-pointer ${
              viewMode === 'bill'
                ? 'bg-[#000000] text-[#FFFDF7] border-[#000000] shadow-xs'
                : 'bg-[#FFFFFF] text-[#000000] border-[#000000]/15 hover:bg-[#F6F1EB]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#3d2500]" />
            <span>Print Bill</span>
          </button>

          <button
            onClick={() => handleTriggerPrint('kot')}
            className={`flex items-center justify-center space-x-1.5 text-xs font-bold py-2 px-3 rounded-xl border transition-all cursor-pointer ${
              viewMode === 'kot'
                ? 'bg-[#000000] text-[#FFFDF7] border-[#000000] shadow-xs'
                : 'bg-[#FFFFFF] text-[#000000] border-[#000000]/15 hover:bg-[#F6F1EB]'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-[#3d2500]" />
            <span>Print KOT</span>
          </button>

          <button
            onClick={() => handleTriggerPrint('both')}
            className={`flex items-center justify-center space-x-1.5 text-xs font-bold py-2 px-3 rounded-xl border transition-all cursor-pointer ${
              viewMode === 'both'
                ? 'bg-[#000000] text-[#FFFDF7] border-[#000000] shadow-xs'
                : 'bg-[#FFFFFF] text-[#000000] border-[#000000]/15 hover:bg-[#F6F1EB]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#3d2500]" />
            <span>Print Both</span>
          </button>
        </div>
      </div>

      {/* Thermal Receipt Preview Container */}
      <div className={`w-full ${containerWidthClass} transition-all duration-200 select-none`}>
        {/* Render Customer Bill */}
        {(viewMode === 'bill' || viewMode === 'both') && (
          <div
            className={`w-full bg-white font-mono text-black ${paddingClass} rounded-t-lg receipt-cut shadow-xl border border-gray-200 print:shadow-none print:border-none print:w-full ${
              viewMode === 'both' ? 'mb-6' : ''
            }`}
          >
            {/* Bill Header */}
            <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
              <img src="/logo.jpeg" alt="Brunch & Co" className="w-12 h-12 mx-auto mb-1.5 object-contain rounded-lg shadow-2xs" />
              <h2 className={`${is58mm ? 'text-lg' : 'text-xl'} font-bold tracking-tight`}>
                BRUNCH & CO
              </h2>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-0.5">
                Gourmet Delivery Kitchen
              </p>
              <p className="text-[9px] text-gray-500 mt-0.5">F-7 Markaz, Islamabad</p>
              <p className="text-[9px] text-gray-500">Tel: +92 (51) 234-5678</p>
            </div>

            {/* Order Meta */}
            <div className={`${textSizeClass} border-b border-dashed border-gray-400 pb-3 mb-3 space-y-1`}>
              <div className="flex justify-between font-bold text-xs sm:text-sm">
                <span>ORDER #{currentOrder.order_number}</span>
                <span>{currentOrder.status.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Date:</span>
                <span>{formatExactDateTime(currentOrder.created_at)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Customer:</span>
                <span className="font-semibold text-black">{currentOrder.customer_name || currentOrder.guest_name || 'Walk-in'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phone:</span>
                <span className="font-semibold text-black">{currentOrder.delivery_phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Address:</span>
                <span className="text-right font-semibold text-black truncate max-w-[140px] sm:max-w-[180px]">
                  {currentOrder.delivery_address}{currentOrder.delivery_area ? ` (${currentOrder.delivery_area})` : ''}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className={`${textSizeClass} border-b border-dashed border-gray-400 pb-3 mb-3`}>
              <div className="grid grid-cols-[1fr_36px_74px] gap-1 items-center font-bold border-b border-black pb-1 mb-2">
                <span>ITEM</span>
                <span className="text-center">QTY</span>
                <span className="text-right">TOTAL</span>
              </div>

              <div className="space-y-2">
                {currentOrder.items.map((item) => (
                  <div key={item.id}>
                    <div className="grid grid-cols-[1fr_36px_74px] gap-1 items-start font-medium">
                      <div className="min-w-0 pr-1">
                        <p className="leading-tight break-words">{item.product_name_snapshot}</p>
                        {item.variant_name && (
                          <p className="text-[9px] text-gray-500">Size: {item.variant_name}</p>
                        )}
                      </div>
                      <span className="text-center font-mono font-bold whitespace-nowrap">
                        x{item.quantity}
                      </span>
                      <span className="text-right font-semibold whitespace-nowrap">
                        {formatCurrency(item.line_total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className={`${textSizeClass} space-y-1 border-b border-dashed border-gray-400 pb-3 mb-3`}>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(currentOrder.subtotal)}</span>
              </div>
              {currentOrder.discount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(currentOrder.discount)}</span>
                </div>
              )}
              {currentOrder.delivery_fee >= 0 && (
                <div className="flex justify-between text-gray-600 font-semibold">
                  <span>Delivery Fee:</span>
                  <span>+{formatCurrency(currentOrder.delivery_fee)}</span>
                </div>
              )}
              {currentOrder.service_charges > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Service:</span>
                  <span>+{formatCurrency(currentOrder.service_charges)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs sm:text-sm text-black pt-1 border-t border-black">
                <span>GRAND TOTAL:</span>
                <span>{formatCurrency(currentOrder.total)}</span>
              </div>
            </div>

            {/* Payment info */}
            <div className="text-[9px] text-center uppercase tracking-wider text-gray-800 mb-3 bg-gray-100 p-2 rounded space-y-0.5">
              <div>
                Payment: <span className="font-bold">{currentOrder.payment_method}</span> ({currentOrder.payment_status})
              </div>
            </div>

            {/* Barcode Mock */}
            <div className="flex flex-col items-center justify-center pt-1 pb-2">
              <div className="h-6 w-36 bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px)] mb-1"></div>
              <span className="text-[8px] text-gray-500 font-mono">*{currentOrder.id}*</span>
            </div>

            {/* Footer message */}
            <div className="text-center text-[9px] text-gray-500 pt-2 border-t border-dashed border-gray-300">
              <p>Thank you for choosing Brunch & Co!</p>
            </div>
          </div>
        )}

        {/* Separator when printing Both */}
        {viewMode === 'both' && (
          <div className="my-4 text-center border-t-2 border-dashed border-amber-500/50 pt-1 print:my-6">
            <span className="text-[10px] text-amber-400 font-mono font-bold bg-[#0e0e0e] px-2 print:text-black">
              --- CUT TICKET HERE ---
            </span>
          </div>
        )}

        {/* Render KOT (Kitchen Order Ticket) */}
        {(viewMode === 'kot' || viewMode === 'both') && (
          <div
            className={`w-full bg-white font-mono text-black ${paddingClass} rounded-t-lg receipt-cut shadow-2xl border border-amber-400/80 print:shadow-none print:border-none print:w-full`}
          >
            {/* KOT Header */}
            <div className="text-center border-b-2 border-black pb-2 mb-3 bg-gray-100 p-2 rounded">
              <h2 className={`${is58mm ? 'text-sm' : 'text-base'} font-black tracking-wider uppercase`}>
                *** KITCHEN TICKET ***
              </h2>
              <p className="text-[10px] font-bold text-gray-800 mt-0.5">
                ORDER #{currentOrder.order_number}
              </p>
            </div>

            {/* KOT Order Meta */}
            <div className={`${textSizeClass} border-b border-dashed border-gray-400 pb-2 mb-3 space-y-1`}>
              <div className="flex justify-between font-bold">
                <span>TIME:</span>
                <span>{formatExactDateTime(currentOrder.created_at)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>CUSTOMER:</span>
                <span className="font-bold">{currentOrder.customer_name || 'Walk-in'}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>STAFF:</span>
                <span>
                  {staffList.find((s) => s.id === currentOrder.created_by_staff)?.full_name ||
                    currentOrder.created_by_staff ||
                    'Kitchen'}
                </span>
              </div>
            </div>

            {/* KOT Items List (QTY & Name Only) */}
            <div className={`${textSizeClass} border-b-2 border-black pb-3 mb-3`}>
              <div className="flex justify-between font-black border-b border-black pb-1 mb-2 text-xs">
                <span>QTY</span>
                <span className="w-full text-left pl-4">ITEM DESCRIPTION</span>
              </div>

              <div className="space-y-2.5">
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="border-b border-gray-100 pb-1">
                    <div className="flex items-start">
                      <span className="font-black text-sm bg-black text-white px-1.5 py-0.5 rounded shrink-0">
                        {item.quantity}x
                      </span>
                      <div className="pl-3">
                        <p className="font-bold text-xs uppercase leading-tight">
                          {item.product_name_snapshot}
                        </p>
                        {item.variant_name && (
                          <p className="text-[10px] font-semibold text-gray-600 mt-0.5">
                            OPTION: {item.variant_name}
                          </p>
                        )}
                        {item.item_notes && (
                          <p className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded mt-1 border border-rose-200">
                            NOTE: {item.item_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kitchen / Delivery Notes */}
            {currentOrder.notes && (
              <div className="mb-3 bg-amber-50 border border-amber-300 p-2 rounded text-[10px]">
                <span className="font-bold text-amber-900 block">SPECIAL INSTRUCTIONS:</span>
                <p className="text-gray-800 font-medium">{currentOrder.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-[10px] font-bold text-gray-700 pt-2 border-t border-dashed border-gray-400 uppercase">
              *** END OF KOT ***
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

