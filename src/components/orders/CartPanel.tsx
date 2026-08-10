import React, { useState } from 'react';
import { CartItem } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Plus, Minus, Trash2, ShoppingBag, MessageSquare, AlertTriangle } from 'lucide-react';

interface CartPanelProps {
  cart: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onUpdateNotes: (index: number, notes: string) => void;
  onClearCart: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNotes,
  onClearCart,
}) => {
  const [exceedItemIndex, setExceedItemIndex] = useState<number | null>(null);

  const handleIncrement = (index: number) => {
    const item = cart[index];
    const stock = item.product.stock_quantity ?? 0;
    if (item.product.track_quantity && item.quantity + 1 > stock) {
      setExceedItemIndex(index);
    } else {
      onUpdateQuantity(index, item.quantity + 1);
    }
  };

  const confirmExceedCartItem = () => {
    if (exceedItemIndex !== null) {
      onUpdateQuantity(exceedItemIndex, cart[exceedItemIndex].quantity + 1);
      setExceedItemIndex(null);
    }
  };
  return (
    <div className="bg-[#1c1b1b] border border-[#353534] rounded-2xl p-4 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-[#353534] mb-3">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-4 h-4 text-[#fab895]" />
          <h3 className="font-bold text-sm text-[#e5e2e1]">Current Cart ({cart.length})</h3>
        </div>
        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-[11px] text-[#9f8d85] hover:text-[#ffb4ab] transition-colors cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
        {cart.map((item, index) => {
          const unitPrice = item.selectedVariant
            ? item.selectedVariant.price
            : item.product.base_price;
          const lineTotal = unitPrice * item.quantity;

          return (
            <div
              key={`${item.product.id}-${item.selectedVariant?.id || 'def'}-${index}`}
              className="bg-[#201f1f] border border-[#353534] rounded-xl p-3 flex flex-col space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-[#e5e2e1] truncate">
                    {item.product.name}
                  </p>
                  {item.selectedVariant && (
                    <p className="text-[10px] text-[#fab895]">
                      Variant: {item.selectedVariant.variant_name}
                    </p>
                  )}
                  <p className="text-[10px] text-[#9f8d85]">{formatCurrency(unitPrice)} each</p>
                </div>

                <p className="font-bold text-xs text-[#e5e2e1] ml-2">
                  {formatCurrency(lineTotal)}
                </p>
              </div>

              {/* Item notes */}
              <div className="flex items-center space-x-1 bg-[#131313] border border-[#2a2a2a] rounded-lg px-2 py-1 text-[10px]">
                <MessageSquare className="w-3 h-3 text-[#9f8d85] shrink-0" />
                <input
                  type="text"
                  placeholder="Special instructions..."
                  value={item.notes || ''}
                  onChange={(e) => onUpdateNotes(index, e.target.value)}
                  className="bg-transparent text-[#e5e2e1] placeholder-[#52443d] focus:outline-none w-full"
                />
              </div>

              {/* Quantity controls */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onRemoveItem(index)}
                  className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete line"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-2 bg-[#131313] border border-[#353534] rounded-lg p-0.5">
                  <button
                    onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                    className="p-1 text-[#9f8d85] hover:text-[#e5e2e1] transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold px-2 text-[#e5e2e1]">{item.quantity}</span>
                  <button
                    onClick={() => handleIncrement(index)}
                    className="p-1 text-[#9f8d85] hover:text-[#e5e2e1] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {cart.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-16 text-[#9f8d85] text-xs">
            <ShoppingBag className="w-8 h-8 mb-2 stroke-1 opacity-40" />
            <span>Cart is currently empty.</span>
            <span className="text-[10px] text-[#52443d] mt-1">Select items from menu</span>
          </div>
        )}
      </div>

      {/* Exceed Stock Warning Modal for Cart */}
      {exceedItemIndex !== null && cart[exceedItemIndex] && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-amber-800/60 rounded-2xl w-full max-w-sm p-4 shadow-2xl space-y-3">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-sm">Stock Limit Warning</h4>
            </div>
            <p className="text-xs text-[#d6c3b9] leading-relaxed">
              Only <strong className="text-amber-300 font-bold">{cart[exceedItemIndex].product.stock_quantity ?? 0} left</strong> in stock for{' '}
              <strong className="text-white">{cart[exceedItemIndex].product.name}</strong>.
              <br />
              Adding more will exceed available inventory. Do you want to add anyway?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#353534]">
              <button
                type="button"
                onClick={() => setExceedItemIndex(null)}
                className="px-3.5 py-1.5 bg-[#131313] text-[#9f8d85] hover:text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmExceedCartItem}
                className="px-3.5 py-1.5 bg-[#6e4025] text-[#eeae8b] border border-[#fab895]/30 hover:bg-[#804b2b] rounded-xl text-xs font-semibold"
              >
                Only {cart[exceedItemIndex].product.stock_quantity ?? 0} left — Add Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
