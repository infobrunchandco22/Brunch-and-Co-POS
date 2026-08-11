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
    <div className="bg-[#1c1b1b] border border-[#353534] rounded-2xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-table-data text-[#d6c3b9]">
          <thead className="bg-[#131313] text-[#9f8d85] font-label-caps uppercase text-[10px] tracking-wider border-b border-[#353534]">
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
          <tbody className="divide-y divide-[#2a2a2a]">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-[#201f1f] transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#131313] border border-[#353534] shrink-0 flex items-center justify-center">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ImageOff className="w-4 h-4 text-[#52443d]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-[#e5e2e1]">{product.name}</p>
                        {product.sku && (
                          <span className="text-[9px] font-mono text-[#9f8d85] bg-[#131313] border border-[#353534] px-1.5 py-0.5 rounded">
                            {product.sku}
                          </span>
                        )}
                      </div>
                      {product.display_name_local && (
                        <p className="text-[11px] text-[#fab895] font-semibold">
                          {product.display_name_local}
                        </p>
                      )}
                      <p className="text-[10px] text-[#9f8d85] line-clamp-1 max-w-xs">
                        {product.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-medium text-[#e5e2e1]">
                  {getCategoryName(product.category_id)}
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-[#fab895]">{formatCurrency(product.base_price)}</p>
                  {product.kitchen_cost !== null && product.kitchen_cost !== undefined && (
                    <p className="text-[10px] text-[#9f8d85]">
                      Cost: Rs {product.kitchen_cost}
                    </p>
                  )}
                </td>

                {/* Stock Control Column */}
                <td className="py-3.5 px-4">
                  {product.track_quantity ? (
                    <div className="flex items-center space-x-1.5 bg-[#131313] border border-[#353534] p-1 rounded-xl w-fit">
                      <button
                        type="button"
                        onClick={() =>
                          onAdjustStock &&
                          onAdjustStock(
                            product.id,
                            Math.max(0, (product.stock_quantity ?? 0) - 1)
                          )
                        }
                        className="p-1 text-[#9f8d85] hover:text-[#e5e2e1] hover:bg-[#201f1f] rounded cursor-pointer"
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
                            ? 'text-rose-400 font-extrabold'
                            : (product.stock_quantity ?? 0) <= 5
                            ? 'text-amber-400'
                            : 'text-[#e5e2e1]'
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          onAdjustStock &&
                          onAdjustStock(product.id, (product.stock_quantity ?? 0) + 1)
                        }
                        className="p-1 text-[#9f8d85] hover:text-[#e5e2e1] hover:bg-[#201f1f] rounded cursor-pointer"
                        title="Increase Stock"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#9f8d85] bg-[#131313] px-2 py-0.5 rounded border border-[#2a2a2a] flex items-center space-x-1 w-fit">
                      <Package className="w-3 h-3 text-[#52443d]" />
                      <span>Unlimited</span>
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-[#d6c3b9]">
                  {product.variants.length > 0 ? (
                    <div className="text-[11px]">
                      <span className="font-medium text-[#e5e2e1]">{product.variants.length} variant(s)</span>
                      <div className="text-[9px] text-[#9f8d85] flex flex-wrap gap-1 mt-0.5">
                        {product.variants.map((v) => (
                          <span key={v.id} className="bg-[#131313] px-1 rounded border border-[#2a2a2a]">
                            {v.variant_name} {v.code ? `(${v.code})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#9f8d85]">Standard</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-1">
                    {product.is_special && (
                      <span className="bg-[#6e4025] text-[#eeae8b] text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Special
                      </span>
                    )}
                    {product.is_deal && (
                      <span className="bg-amber-950 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Deal
                      </span>
                    )}
                    {!product.is_special && !product.is_deal && (
                      <span className="text-[10px] text-[#52443d]">-</span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => onToggleAvailability(product.id, !product.is_available)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                      product.is_available
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
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
                    className="p-1.5 text-[#9f8d85] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] rounded-lg transition-colors cursor-pointer"
                    title="Edit Item"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteProduct(product.id)}
                    className="p-1.5 text-[#9f8d85] hover:text-[#ffb4ab] hover:bg-[#2a2a2a] rounded-lg transition-colors cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#9f8d85] text-xs">
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

