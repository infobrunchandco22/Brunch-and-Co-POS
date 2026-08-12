import React, { useState, useEffect } from 'react';
import { Order } from '../../types/database.types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { ArrowLeft, Utensils, FileText, Layers, Truck, Check } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useStaff } from '../../hooks/useStaff';

interface ReceiptViewProps {
  order: Order;
  onClose?: () => void;
}

type PrintMode = 'bill' | 'kot' | 'both';
type PaperSize = '80mm' | '58mm';

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

export const ReceiptView: React.FC<ReceiptViewProps> = ({ order, onClose }) => {
  const { updateDeliveryFee } = useOrders();
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

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-[#0e0e0e] text-[#131313]">
      {/* Control Bar (Hidden when printing) */}
      <div className="w-full max-w-md mb-4 space-y-3 print:hidden">
        <div className="flex items-center justify-between">
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center space-x-1 text-xs text-[#9f8d85] hover:text-[#e5e2e1] bg-[#1c1b1b] border border-[#353534] px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to POS</span>
            </button>
          )}

          {/* Paper Size Selector */}
          <div className="flex items-center bg-[#1c1b1b] border border-[#353534] p-1 rounded-xl space-x-1">
            <button
              type="button"
              onClick={() => setPaperSize('80mm')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                paperSize === '80mm'
                  ? 'bg-[#6e4025] text-[#eeae8b] shadow'
                  : 'text-[#9f8d85] hover:text-[#e5e2e1]'
              }`}
            >
              80mm Roll
            </button>
            <button
              type="button"
              onClick={() => setPaperSize('58mm')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                paperSize === '58mm'
                  ? 'bg-[#6e4025] text-[#eeae8b] shadow'
                  : 'text-[#9f8d85] hover:text-[#e5e2e1]'
              }`}
            >
              58mm Roll
            </button>
          </div>
        </div>

        {/* Editable Delivery Fee Toolbar */}
        <form
          onSubmit={handleSaveDeliveryFee}
          className="bg-[#1c1b1b] border border-[#353534] p-3 rounded-2xl flex items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-[#fab895]" />
            <div>
              <p className="text-xs font-bold text-[#e5e2e1]">Delivery Fee</p>
              <p className="text-[10px] text-[#9f8d85]">Adjusts order grand total</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-28">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#9f8d85]">
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
                className="w-full bg-[#131313] border border-[#353534] rounded-xl pl-8 pr-2 py-1.5 text-xs font-bold text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
              />
            </div>
            <button
              type="submit"
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                  : 'bg-[#6e4025] hover:bg-[#804b2b] text-[#eeae8b] border border-[#fab895]/30 shadow-md'
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
                ? 'bg-[#6e4025] text-[#eeae8b] border-[#fab895]/50 shadow-md'
                : 'bg-[#1c1b1b] text-[#e5e2e1] border-[#353534] hover:border-[#fab895]/30'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#fab895]" />
            <span>Print Bill</span>
          </button>

          <button
            onClick={() => handleTriggerPrint('kot')}
            className={`flex items-center justify-center space-x-1.5 text-xs font-bold py-2 px-3 rounded-xl border transition-all cursor-pointer ${
              viewMode === 'kot'
                ? 'bg-[#6e4025] text-[#eeae8b] border-[#fab895]/50 shadow-md'
                : 'bg-[#1c1b1b] text-[#e5e2e1] border-[#353534] hover:border-[#fab895]/30'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-[#fab895]" />
            <span>Print KOT</span>
          </button>

          <button
            onClick={() => handleTriggerPrint('both')}
            className={`flex items-center justify-center space-x-1.5 text-xs font-bold py-2 px-3 rounded-xl border transition-all cursor-pointer ${
              viewMode === 'both'
                ? 'bg-[#6e4025] text-[#eeae8b] border-[#fab895]/50 shadow-md'
                : 'bg-[#1c1b1b] text-[#e5e2e1] border-[#353534] hover:border-[#fab895]/30'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#fab895]" />
            <span>Print Both</span>
          </button>
        </div>
      </div>

      {/* Thermal Receipt Preview Container */}
      <div className={`w-full ${containerWidthClass} transition-all duration-200 select-none`}>
        {/* Render Customer Bill */}
        {(viewMode === 'bill' || viewMode === 'both') && (
          <div
            className={`w-full bg-white font-mono text-black ${paddingClass} rounded-t-lg receipt-cut shadow-2xl border border-gray-300 print:shadow-none print:border-none print:w-full ${
              viewMode === 'both' ? 'mb-6' : ''
            }`}
          >
            {/* Bill Header */}
            <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
              <img src="/logo.svg" alt="BR&CO CAFE" className="w-12 h-12 mx-auto mb-1.5 object-contain" />
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
                <span>{formatDate(currentOrder.created_at)}</span>
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
              <div className="flex justify-between font-bold border-b border-black pb-1 mb-2">
                <span>ITEM</span>
                <span>QTY</span>
                <span className="text-right">TOTAL</span>
              </div>

              <div className="space-y-2">
                {currentOrder.items.map((item) => (
                  <div key={item.id}>
                    <div className="flex justify-between font-medium">
                      <span className="truncate max-w-[130px] sm:max-w-[170px]">
                        {item.product_name_snapshot}
                      </span>
                      <span>x{item.quantity}</span>
                      <span className="text-right font-semibold">
                        {formatCurrency(item.line_total)}
                      </span>
                    </div>
                    {item.variant_name && (
                      <p className="text-[9px] text-gray-500 pl-2">Size: {item.variant_name}</p>
                    )}
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
                <span>{formatDate(currentOrder.created_at)}</span>
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

