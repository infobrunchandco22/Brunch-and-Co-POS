import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types/database.types';
import { formatCurrency, formatExactDateTime } from '../../lib/utils';
import { ArrowLeft, Utensils, FileText, Layers, Truck, Check, X, Printer } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useStaff } from '../../hooks/useStaff';
import { useSettings } from '../../hooks/useSettings';
import { executeThermalPrint, PrintMode, PaperSize } from '../../lib/thermalPrint';

export { executeThermalPrint };
export type { PrintMode, PaperSize };

interface ReceiptViewProps {
  order: Order;
  onClose?: () => void;
  onUpdateStatus?: (orderId: string, nextStatus: OrderStatus) => void;
  onUpdateDeliveryFee?: (orderId: string, fee: number) => void;
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

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onUpdateDeliveryFee,
}) => {
  const { updateDeliveryFee, updateOrderStatus } = useOrders();
  const { staffList } = useStaff();
  const { settings } = useSettings();
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [openedDateTime, setOpenedDateTime] = useState<Date>(() => new Date());
  const [paperSize, setPaperSize] = useState<PaperSize>('80mm');
  const [viewMode, setViewMode] = useState<PrintMode>('bill');
  const [deliveryFeeInput, setDeliveryFeeInput] = useState<string>(
    (order.delivery_fee ?? 0).toString()
  );
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setCurrentOrder(order);
    setOpenedDateTime(new Date());
    setDeliveryFeeInput((order.delivery_fee ?? 0).toString());
  }, [order]);

  const handleAdvanceStatus = async () => {
    const next = getNextStatus(currentOrder.status);
    if (!next) return;

    const feeNum = Math.max(0, parseFloat(deliveryFeeInput) || 0);

    // If user changed delivery fee in the input box, persist it before/with status change
    if (feeNum !== currentOrder.delivery_fee) {
      const subtotal = currentOrder.subtotal || 0;
      const discount = currentOrder.discount || 0;
      const serviceCharges = currentOrder.service_charges || 0;
      const newTotal = Math.max(0, subtotal - discount + serviceCharges + feeNum);

      if (onUpdateDeliveryFee) {
        onUpdateDeliveryFee(currentOrder.id, feeNum);
      } else {
        await updateDeliveryFee.mutateAsync({
          orderId: currentOrder.id,
          deliveryFee: feeNum,
        });
      }

      currentOrder.delivery_fee = feeNum;
      currentOrder.total = newTotal;
    }

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

    if (onUpdateDeliveryFee) {
      onUpdateDeliveryFee(currentOrder.id, feeNum);
    } else {
      updateDeliveryFee.mutate({
        orderId: currentOrder.id,
        deliveryFee: feeNum,
      });
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const [isPrinting, setIsPrinting] = useState(false);

  const handleTriggerPrint = async (mode: PrintMode) => {
    const printTime = new Date();
    setOpenedDateTime(printTime);
    setViewMode(mode);
    setIsPrinting(true);
    try {
      const staff =
        staffList.find((s) => s.id === currentOrder.created_by_staff)?.full_name ||
        currentOrder.created_by_staff ||
        'Kitchen';

      await executeThermalPrint({
        order: currentOrder,
        mode,
        paperSize,
        staffName: staff,
        storeName: settings?.store_name,
        storePhone: settings?.phone,
        storeAddress: settings?.address,
        printTime,
      });
    } catch (err) {
      console.error('Thermal print failed:', err);
    } finally {
      setIsPrinting(false);
    }
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

        {/* Direct Thermal Print Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={isPrinting}
            onClick={() => handleTriggerPrint('bill')}
            className={`flex items-center justify-center space-x-1.5 text-xs font-bold py-2.5 px-2 rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 group disabled:opacity-50 ${
              viewMode === 'bill'
                ? 'border-[#000000] bg-[#000000] text-[#FFFDF7]'
                : 'border-[#000000]/20 bg-[#FFFFFF] hover:bg-[#F6F1EB] text-[#000000]'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 ${viewMode === 'bill' ? 'text-[#FFFDF7]' : 'text-[#7a4900]'}`} />
            <span>Print Bill</span>
          </button>

          <button
            type="button"
            disabled={isPrinting}
            onClick={() => handleTriggerPrint('kot')}
            className={`flex items-center justify-center space-x-1.5 text-xs font-bold py-2.5 px-2 rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 group disabled:opacity-50 ${
              viewMode === 'kot'
                ? 'border-[#000000] bg-[#000000] text-[#FFFDF7]'
                : 'border-[#000000]/20 bg-[#FFFFFF] hover:bg-[#F6F1EB] text-[#000000]'
            }`}
          >
            <Utensils className={`w-3.5 h-3.5 ${viewMode === 'kot' ? 'text-[#FFFDF7]' : 'text-[#7a4900]'}`} />
            <span>Print KOT</span>
          </button>

          <button
            type="button"
            disabled={isPrinting}
            onClick={() => handleTriggerPrint('both')}
            className={`flex items-center justify-center space-x-1.5 text-xs font-bold py-2.5 px-2 rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 group disabled:opacity-50 ${
              viewMode === 'both'
                ? 'border-[#000000] bg-[#000000] text-[#FFFDF7]'
                : 'border-[#000000]/20 bg-[#FFFFFF] hover:bg-[#F6F1EB] text-[#000000]'
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${viewMode === 'both' ? 'text-[#FFFDF7]' : 'text-[#7a4900]'}`} />
            <span>Print Both</span>
          </button>
        </div>
      </div>

      {/* Thermal Receipt Preview Container */}
      <div
        id="thermal-receipt-printable"
        className={`w-full ${containerWidthClass} ${is58mm ? 'paper-58mm' : 'paper-80mm'} transition-all duration-200 select-none`}
      >
        {/* Render Customer Bill */}
        {(viewMode === 'bill' || viewMode === 'both') && (
          <div
            className={`w-full bg-white font-mono text-black ${paddingClass} rounded-t-lg receipt-cut shadow-xl border border-gray-300 print:shadow-none print:border-none print:w-full print:p-0 ${
              viewMode === 'both' ? 'mb-2' : ''
            }`}
          >
            {/* Bill Header */}
            <div className="text-center border-b-2 border-dashed border-black pb-3 mb-3">
              <img
                src="/logo.jpeg"
                alt="Brunch & Co"
                className="w-18 h-18 mx-auto mb-1.5 object-contain rounded-lg shadow-2xs print:shadow-none"
                style={{ filter: 'grayscale(100%) contrast(300%) brightness(115%)' }}
              />
              <h2 className={`${is58mm ? 'text-lg' : 'text-xl'} font-black tracking-tight text-black`}>
                {settings?.store_name || 'BRUNCH & CO'}
              </h2>
              <p className="text-[10px] text-black uppercase tracking-widest mt-0.5 font-bold">
                Gourmet Delivery Kitchen
              </p>
              <p className="text-[10px] text-black font-semibold mt-0.5">
                {settings?.address || 'Bahria Town Phase 8, Rawalpindi / Islamabad'}
              </p>
              <p className="text-[10px] text-black font-semibold">
                Tel: {settings?.phone || '+92 337 9031611'}
              </p>
            </div>

            {/* Order Meta */}
            <div className={`${textSizeClass} border-b-2 border-dashed border-black pb-3 mb-3 space-y-1.5`}>
              <div className="flex justify-between items-center font-black text-xs sm:text-sm border-b-2 border-black pb-1 mb-1.5">
                <span>ORDER #{currentOrder.order_number}</span>
              </div>
              <div className="flex justify-between items-start text-black">
                <span className="font-bold whitespace-nowrap shrink-0 mr-2">Date:</span>
                <span className="font-semibold text-black">{formatExactDateTime(openedDateTime)}</span>
              </div>
              <div className="flex justify-between items-start text-black">
                <span className="font-bold whitespace-nowrap shrink-0 mr-2">Customer:</span>
                <span className="font-black text-black">{currentOrder.customer_name || currentOrder.guest_name || 'Walk-in'}</span>
              </div>
              <div className="flex justify-between items-start text-black">
                <span className="font-bold whitespace-nowrap shrink-0 mr-2">Phone:</span>
                <span className="font-black text-black">{currentOrder.delivery_phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-start text-black">
                <span className="font-bold whitespace-nowrap shrink-0 mr-2">Address:</span>
                <span className="text-right font-black text-black break-words flex-1">
                  {currentOrder.delivery_address}{currentOrder.delivery_area ? ` (${currentOrder.delivery_area})` : ''}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className={`${textSizeClass} border-b-2 border-dashed border-black pb-3 mb-3`}>
              <div className="grid grid-cols-[1fr_38px_78px] gap-1 items-center font-black border-b-2 border-black pb-1 mb-2 text-black">
                <span>ITEM</span>
                <span className="text-center">QTY</span>
                <span className="text-right">TOTAL</span>
              </div>

              <div className="space-y-2">
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="print-avoid-break">
                    <div className="grid grid-cols-[1fr_38px_78px] gap-1 items-start font-medium text-black">
                      <div className="min-w-0 pr-1">
                        <p className="leading-tight break-words font-black text-black">{item.product_name_snapshot}</p>
                        {item.variant_name && (
                          <p className="text-[10px] text-black font-bold">Size: {item.variant_name}</p>
                        )}
                      </div>
                      <span className="text-center font-mono font-black whitespace-nowrap text-black">
                        x{item.quantity}
                      </span>
                      <span className="text-right font-black whitespace-nowrap text-black">
                        {formatCurrency(item.line_total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className={`${textSizeClass} space-y-1 border-b-2 border-dashed border-black pb-3 mb-3`}>
              <div className="flex justify-between font-bold text-black">
                <span>Subtotal:</span>
                <span className="font-black text-black">{formatCurrency(currentOrder.subtotal)}</span>
              </div>
              {currentOrder.discount > 0 && (
                <div className="flex justify-between font-bold text-black">
                  <span>Discount:</span>
                  <span className="font-black text-black">-{formatCurrency(currentOrder.discount)}</span>
                </div>
              )}
              {currentOrder.delivery_fee > 0 && (
                <div className="flex justify-between font-bold text-black">
                  <span>Delivery Fee:</span>
                  <span className="font-black text-black">+{formatCurrency(currentOrder.delivery_fee)}</span>
                </div>
              )}
              {currentOrder.service_charges > 0 && (
                <div className="flex justify-between font-bold text-black">
                  <span>Service:</span>
                  <span className="font-black text-black">+{formatCurrency(currentOrder.service_charges)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-xs sm:text-sm text-black pt-1 border-t-2 border-black">
                <span>GRAND TOTAL:</span>
                <span>{formatCurrency(currentOrder.total)}</span>
              </div>
            </div>

            {/* Payment info */}
            <div className="text-[10px] text-center uppercase tracking-wider text-black mb-3 bg-white border-2 border-black p-2 rounded space-y-0.5 font-black">
              <div>
                Payment: <span>{currentOrder.payment_method}</span> ({currentOrder.payment_status})
              </div>
            </div>

            {/* Footer message */}
            <div className="text-center text-[10px] text-black font-black pt-2 border-t-2 border-dashed border-black mb-0 pb-0">
              <p>Thank you for choosing Brunch & Co!</p>
            </div>
          </div>
        )}

        {/* Separator when printing Both */}
        {viewMode === 'both' && (
          <div className="my-3 text-center border-t-2 border-dashed border-black pt-1 print:my-0 thermal-cut-separator">
            <span className="text-[10px] text-black font-mono font-black bg-white px-2">
              --- CUT TICKET HERE ---
            </span>
          </div>
        )}

        {/* Render KOT (Kitchen Order Ticket) */}
        {(viewMode === 'kot' || viewMode === 'both') && (
          <div
            className={`w-full bg-white font-mono text-black ${paddingClass} rounded-t-lg receipt-cut shadow-2xl border-2 border-black print:shadow-none print:border-none print:w-full print:p-0`}
          >
            {/* KOT Header */}
            <div className="text-center border-b-2 border-black pb-2 mb-3 bg-white border-2 border-black p-2 rounded">
              <h2 className={`${is58mm ? 'text-sm' : 'text-base'} font-black tracking-wider uppercase text-black`}>
                *** KITCHEN TICKET ***
              </h2>
              <p className="text-[11px] font-black text-black mt-0.5">
                ORDER #{currentOrder.order_number}
              </p>
            </div>

            {/* KOT Order Meta */}
            <div className={`${textSizeClass} border-b-2 border-dashed border-black pb-2 mb-3 space-y-1.5`}>
              <div className="flex justify-between items-start text-black font-black">
                <span className="whitespace-nowrap shrink-0 mr-2">TIME:</span>
                <span>{formatExactDateTime(openedDateTime)}</span>
              </div>
              <div className="flex justify-between items-start text-black">
                <span className="whitespace-nowrap font-bold shrink-0 mr-2">CUSTOMER:</span>
                <span className="font-black text-black">{currentOrder.customer_name || 'Walk-in'}</span>
              </div>
              <div className="flex justify-between items-start text-black">
                <span className="whitespace-nowrap font-bold shrink-0 mr-2">STAFF:</span>
                <span className="font-black text-black">
                  {staffList.find((s) => s.id === currentOrder.created_by_staff)?.full_name ||
                    currentOrder.created_by_staff ||
                    'Kitchen'}
                </span>
              </div>
            </div>

            {/* KOT Items List (QTY & Name Only) */}
            <div className={`${textSizeClass} border-b-2 border-black pb-3 mb-3`}>
              <div className="flex justify-between font-black border-b-2 border-black pb-1 mb-2 text-xs text-black">
                <span>QTY</span>
                <span className="w-full text-left pl-4">ITEM DESCRIPTION</span>
              </div>

              <div className="space-y-2.5">
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="border-b border-black/20 pb-1">
                    <div className="flex items-start">
                      <span className="font-black text-sm bg-black text-white px-1.5 py-0.5 rounded shrink-0">
                        {item.quantity}x
                      </span>
                      <div className="pl-3">
                        <p className="font-black text-xs uppercase leading-tight text-black">
                          {item.product_name_snapshot}
                        </p>
                        {item.variant_name && (
                          <p className="text-[10px] font-bold text-black mt-0.5">
                            OPTION: {item.variant_name}
                          </p>
                        )}
                        {item.item_notes && (
                          <p className="text-[10px] font-black text-black bg-gray-100 px-1 py-0.5 rounded mt-1 border border-black">
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
              <div className="mb-3 bg-white border-2 border-black p-2 rounded text-[10px] text-black">
                <span className="font-black text-black block">SPECIAL INSTRUCTIONS:</span>
                <p className="font-bold text-black">{currentOrder.notes}</p>
              </div>
            )}

            {/* Footer: Exactly where cut happens */}
            <div className="text-center text-[11px] font-black text-black pt-2 border-t-2 border-dashed border-black uppercase mb-0 pb-0">
              *** END OF KOT ***
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

