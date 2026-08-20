import React, { useState } from 'react';
import { Product, Category, ProductVariant } from '../../types/database.types';
import { CartItem } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Plus, Minus, ImageOff, Search, AlertTriangle } from 'lucide-react';

interface MenuPickerProps {
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product, variant?: ProductVariant) => void;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
}

export const MenuPicker: React.FC<MenuPickerProps> = ({
  categories,
  products,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeProducts = products.filter((p) => p.is_available);

  // Filter categories to only show those that have available items (or selected)
  const visibleCategories = categories.filter((cat) => {
    const count = activeProducts.filter((p) => p.category_id === cat.id).length;
    return count > 0;
  });

  const filteredProducts = activeProducts.filter((p) => {
    const matchesCat = selectedCatId === 'all' || p.category_id === selectedCatId;
    const matchesQuery =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.display_name_local && p.display_name_local.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#FFFFFF] border border-[#000000]/10 rounded-2xl p-4 md:p-5 shadow-xs overflow-hidden">
      {/* Category Filter Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 shrink-0 custom-scrollbar border-b border-[#000000]/10 mb-3">
        <button
          onClick={() => setSelectedCatId('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCatId === 'all'
              ? 'bg-[#3d2500] text-[#FFFDF7] shadow-xs'
              : 'bg-[#F6F1EB] text-[#7a4900] hover:text-[#000000] border border-[#000000]/10'
          }`}
        >
          All Items ({activeProducts.length})
        </button>
        {visibleCategories.map((cat) => {
          const count = activeProducts.filter((p) => p.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCatId === cat.id
                  ? 'bg-[#3d2500] text-[#FFFDF7] shadow-xs'
                  : 'bg-[#F6F1EB] text-[#7a4900] hover:text-[#000000] border border-[#000000]/10'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Search Bar inside POS Picker */}
      <div className="relative mb-3 shrink-0">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7a4900]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type to filter menu items..."
          className="w-full bg-[#F6F1EB] border border-[#000000]/15 rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#000000] placeholder-[#7a4900]/50 focus:outline-none focus:border-[#3d2500] focus:ring-1 focus:ring-[#3d2500]"
        />
      </div>

      {/* Menu Grid Container */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 auto-rows-max">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            cart={cart}
            onAddToCart={onAddToCart}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
          />
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-16 text-center text-[#7a4900] text-xs font-semibold">
            No menu items available yet.
          </div>
        )}
      </div>
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  cart: CartItem[];
  onAddToCart: (product: Product, variant?: ProductVariant) => void;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const defaultVariant =
    product.variants.find((v) => v.is_default) || product.variants[0];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    defaultVariant
  );
  const [showStockWarning, setShowStockWarning] = useState(false);
  const [showExceedWarning, setShowExceedWarning] = useState(false);

  // Find if this product (with current selected variant) is in cart
  const cartIndex = cart.findIndex(
    (item) =>
      item.product.id === product.id &&
      (selectedVariant
        ? item.selectedVariant?.id === selectedVariant.id
        : !item.selectedVariant)
  );

  const cartItem = cartIndex >= 0 ? cart[cartIndex] : null;
  const currentQuantity = cartItem ? cartItem.quantity : 0;
  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;

  const isOutOfStock = product.track_quantity && (product.stock_quantity ?? 0) <= 0;
  const stockAvailable = product.stock_quantity ?? 0;

  const handleIncrement = () => {
    if (isOutOfStock && currentQuantity === 0) {
      setShowStockWarning(true);
    } else if (
      product.track_quantity &&
      stockAvailable > 0 &&
      currentQuantity + 1 > stockAvailable
    ) {
      setShowExceedWarning(true);
    } else {
      onAddToCart(product, selectedVariant);
    }
  };

  const confirmAddOutOfStock = () => {
    setShowStockWarning(false);
    onAddToCart(product, selectedVariant);
  };

  const confirmAddExceedStock = () => {
    setShowExceedWarning(false);
    onAddToCart(product, selectedVariant);
  };

  const handleDecrement = () => {
    if (cartIndex >= 0) {
      if (currentQuantity > 1) {
        onUpdateQuantity(cartIndex, currentQuantity - 1);
      } else {
        onRemoveItem(cartIndex);
      }
    }
  };

  return (
    <div
      className={`bg-[#FFFDF7] border rounded-2xl p-3.5 flex flex-col justify-between transition-all group relative ${
        isOutOfStock
          ? 'border-rose-300 bg-rose-50/40'
          : 'border-[#000000]/10 hover:border-[#3d2500]/40 shadow-2xs'
      }`}
    >
      <div>
        {/* Product Image Container */}
        <div className="relative h-32 w-full rounded-xl overflow-hidden bg-[#F6F1EB] mb-3 border border-[#000000]/10 shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''
              }`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#7a4900]">
              <ImageOff className="w-6 h-6 mb-1 opacity-50" />
              <span className="text-[10px]">No Photo</span>
            </div>
          )}

          {/* Top Badge Row (Special / Deal) */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
            {product.is_special && (
              <span className="bg-[#3d2500] text-[#FFFDF7] text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                Special
              </span>
            )}
            {product.is_deal && (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                Deal
              </span>
            )}
          </div>

          {/* Track Quantity Stock Badge */}
          {product.track_quantity && (
            <div className="absolute bottom-2 left-2 z-10">
              {isOutOfStock ? (
                <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                  Out of Stock (0 left)
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                  {product.stock_quantity} left
                </span>
              )}
            </div>
          )}

          {/* Quantity Indicator Overlay Badge */}
          {currentQuantity > 0 && (
            <div className="absolute top-2 right-2 bg-[#000000] text-[#FFFDF7] text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs z-10">
              {currentQuantity} in cart
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between gap-1">
            <h4 className="font-bold text-xs text-[#000000] line-clamp-1">{product.name}</h4>
          </div>

          {product.display_name_local && (
            <p className="text-[11px] text-[#3d2500] font-semibold mt-0.5">
              {product.display_name_local}
            </p>
          )}

          <p className="text-[10px] text-[#7a4900] line-clamp-2 mt-1 leading-relaxed">
            {product.description || 'Freshly prepared.'}
          </p>

          {/* Variant Options as Separate Selectable Pill / Chip Buttons */}
          {product.variants.length > 1 && (
            <div className="mt-2.5 pt-2 border-t border-[#000000]/10">
              <span className="text-[9px] text-[#7a4900] font-medium block mb-1.5 uppercase tracking-wider">
                Select Portion:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
                        isSelected
                          ? 'bg-[#3d2500] text-[#FFFDF7] font-semibold shadow-xs'
                          : 'bg-[#F6F1EB] text-[#7a4900] hover:text-[#000000] border border-[#000000]/10'
                      }`}
                    >
                      <span>{variant.variant_name}</span>
                      <span className="text-[9px] opacity-80">· {formatCurrency(variant.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price & Add Button Row */}
      <div className="mt-3.5 pt-2.5 border-t border-[#000000]/10 flex items-center justify-between shrink-0">
        <div>
          <span className="text-[9px] text-[#7a4900] block uppercase font-medium">Price</span>
          <span className="font-bold text-sm text-[#000000]">
            {formatCurrency(currentPrice)}
          </span>
        </div>

        {currentQuantity > 0 ? (
          <div className="flex items-center space-x-1 bg-[#F6F1EB] border border-[#000000]/15 rounded-xl p-1">
            <button
              onClick={handleDecrement}
              className="p-1 text-[#7a4900] hover:text-[#000000] hover:bg-[#EDE6DC] rounded-lg transition-colors cursor-pointer"
              title="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold px-2 text-[#000000] min-w-[1.25rem] text-center">
              {currentQuantity}
            </span>
            <button
              onClick={handleIncrement}
              className="p-1 text-[#7a4900] hover:text-[#000000] hover:bg-[#EDE6DC] rounded-lg transition-colors cursor-pointer"
              title="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleIncrement}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs ${
              isOutOfStock
                ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                : 'bg-[#000000] hover:bg-[#3d2500] text-[#FFFDF7]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Add (0 Stock)' : 'Add'}</span>
          </button>
        )}
      </div>

      {/* Out of Stock Warning Modal */}
      {showStockWarning && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-amber-300 rounded-2xl w-full max-w-sm p-4 shadow-2xl space-y-3">
            <div className="flex items-center space-x-2 text-amber-800">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-sm">Out of Stock Warning</h4>
            </div>
            <p className="text-xs text-[#7a4900] leading-relaxed">
              <strong className="text-[#000000]">{product.name}</strong> is currently marked as{' '}
              <span className="text-rose-600 font-semibold">0 stock</span> in inventory.
              <br />
              Do you want to add it anyway?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#000000]/10">
              <button
                type="button"
                onClick={() => setShowStockWarning(false)}
                className="px-3.5 py-1.5 bg-[#F6F1EB] text-[#7a4900] hover:text-[#000000] rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAddOutOfStock}
                className="px-3.5 py-1.5 bg-[#000000] hover:bg-[#3d2500] text-[#FFFDF7] rounded-xl text-xs font-semibold shadow-xs"
              >
                Out of Stock — Add Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exceed Stock Warning Modal */}
      {showExceedWarning && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-amber-300 rounded-2xl w-full max-w-sm p-4 shadow-2xl space-y-3">
            <div className="flex items-center space-x-2 text-amber-800">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-sm">Stock Limit Warning</h4>
            </div>
            <p className="text-xs text-[#7a4900] leading-relaxed">
              Only <strong className="text-amber-800 font-bold">{product.stock_quantity} left</strong> in stock for{' '}
              <strong className="text-[#000000]">{product.name}</strong>.
              <br />
              Adding more will exceed available inventory. Do you want to add anyway?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#000000]/10">
              <button
                type="button"
                onClick={() => setShowExceedWarning(false)}
                className="px-3.5 py-1.5 bg-[#F6F1EB] text-[#7a4900] hover:text-[#000000] rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAddExceedStock}
                className="px-3.5 py-1.5 bg-[#000000] hover:bg-[#3d2500] text-[#FFFDF7] rounded-xl text-xs font-semibold shadow-xs"
              >
                Only {product.stock_quantity} left — Add Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


