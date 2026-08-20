import React from 'react';
import { Product, Category } from '../../types/database.types';
import { formatCurrency } from '../../lib/utils';
import { Edit2, Trash2, ImageOff, CheckCircle2, XCircle, Plus, Minus, Package } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  onToggleAvailability: (productId: string, isAvailable: boolean) => void;
  onAdjustStock?: (productId: string, newStock: number) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  categories,
  onToggleAvailability,
  onAdjustStock,
  onEditProduct,
  onDeleteProduct,
}) => {
  const getCategoryName = (catId: string) => {
    const found = categories.find((c) => c.id === catId);
    return found ? found.name : 'Uncategorized';
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#000000]/10 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-table-data text-[#000000]">
          <thead className="bg-[#F6F1EB] text-[#7a4900] font-label-caps uppercase text-[10px] tracking-wider border-b border-[#000000]/10">
            <tr>
              <th className="py-3 px-4">Item</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Price & Cost</th>
              <th className="py-3 px-4">Stock Control</th>
              <th className="py-3 px-4">Variants</th>
              <th className="py-3 px-4">Badges</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#000000]/5">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-[#F6F1EB]/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F6F1EB] border border-[#000000]/10 shrink-0 flex items-center justify-center">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ImageOff className="w-4 h-4 text-[#7a4900]/40" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-[#000000]">{product.name}</p>
                        {product.sku && (
                          <span className="text-[9px] font-mono text-[#7a4900] bg-[#F6F1EB] border border-[#000000]/10 px-1.5 py-0.5 rounded">
                            {product.sku}
                          </span>
                        )}
                      </div>
                      {product.display_name_local && (
                        <p className="text-[11px] text-[#3d2500] font-semibold">
                          {product.display_name_local}
                        </p>
                      )}
                      <p className="text-[10px] text-[#7a4900] line-clamp-1 max-w-xs">
                        {product.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-medium text-[#000000]">
                  {getCategoryName(product.category_id)}
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-[#000000]">{formatCurrency(product.base_price)}</p>
                  {product.kitchen_cost !== null && product.kitchen_cost !== undefined && (
                    <p className="text-[10px] text-[#7a4900]">
                      Cost: Rs {product.kitchen_cost}
                    </p>
                  )}
                </td>

                {/* Stock Control Column */}
                <td className="py-3.5 px-4">
                  {product.track_quantity ? (
                    <div className="flex items-center space-x-1.5 bg-[#F6F1EB] border border-[#000000]/15 p-1 rounded-xl w-fit">
                      <button
                        type="button"
                        onClick={() =>
                          onAdjustStock &&
                          onAdjustStock(
                            product.id,
                            Math.max(0, (product.stock_quantity ?? 0) - 1)
                          )
                        }
                        className="p-1 text-[#7a4900] hover:text-[#000000] hover:bg-[#EDE6DC] rounded cursor-pointer"
                        title="Decrease Stock"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={(product.stock_quantity ?? 0) === 0 ? '' : (product.stock_quantity ?? 0)}
                        onChange={(e) =>
                          onAdjustStock &&
                          onAdjustStock(product.id, Math.max(0, Number(e.target.value)))
                        }
                        onFocus={(e) => e.target.select()}
                        placeholder="0"
                        className={`w-12 text-center bg-transparent text-xs font-bold focus:outline-none ${
                          (product.stock_quantity ?? 0) === 0
                            ? 'text-rose-600 font-extrabold'
                            : (product.stock_quantity ?? 0) <= 5
                            ? 'text-amber-800'
                            : 'text-[#000000]'
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          onAdjustStock &&
                          onAdjustStock(product.id, (product.stock_quantity ?? 0) + 1)
                        }
                        className="p-1 text-[#7a4900] hover:text-[#000000] hover:bg-[#EDE6DC] rounded cursor-pointer"
                        title="Increase Stock"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#7a4900] bg-[#F6F1EB] px-2 py-0.5 rounded border border-[#000000]/10 flex items-center space-x-1 w-fit">
                      <Package className="w-3 h-3 text-[#7a4900]" />
                      <span>Unlimited</span>
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-[#000000]">
                  {product.variants.length > 0 ? (
                    <div className="text-[11px]">
                      <span className="font-semibold text-[#000000]">{product.variants.length} variant(s)</span>
                      <div className="text-[9px] text-[#7a4900] flex flex-wrap gap-1 mt-0.5">
                        {product.variants.map((v) => (
                          <span key={v.id} className="bg-[#F6F1EB] px-1.5 py-0.5 rounded border border-[#000000]/10">
                            {v.variant_name} {v.code ? `(${v.code})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#7a4900]">Standard</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-1">
                    {product.is_special && (
                      <span className="bg-[#3d2500] text-[#FFFDF7] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                        Special
                      </span>
                    )}
                    {product.is_deal && (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                        Deal
                      </span>
                    )}
                    {!product.is_special && !product.is_deal && (
                      <span className="text-[10px] text-[#7a4900]/40">-</span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => onToggleAvailability(product.id, !product.is_available)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                      product.is_available
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {product.is_available ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>Disabled</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="py-3.5 px-4 text-right space-x-1">
                  <button
                    onClick={() => onEditProduct(product)}
                    className="p-1.5 text-[#3d2500] hover:text-[#000000] hover:bg-[#F6F1EB] rounded-lg transition-colors cursor-pointer"
                    title="Edit Item"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteProduct(product.id)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#7a4900] text-xs">
                  No products yet — add your first item.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

