import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProductTable } from '../components/products/ProductTable';
import { ProductForm } from '../components/products/ProductForm';
import { CategoryManager } from '../components/products/CategoryManager';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { Product } from '../types/database.types';
import { Plus, Tag, Search } from 'lucide-react';

export const Products: React.FC = () => {
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const { categories, addCategory, updateCategory } = useCategories();
  const { products, allProducts, toggleAvailability, adjustStock, saveProduct, deleteProduct } = useProducts(
    selectedCatId === 'all' ? undefined : selectedCatId
  );

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this menu product?')) {
      deleteProduct.mutate(productId);
    }
  };

  const handleSaveProduct = async (data: Partial<Product> & { name: string; base_price: number }) => {
    await saveProduct.mutateAsync(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline-lg font-bold text-2xl text-[#e5e2e1] tracking-tight">
              Product & Menu Catalog
            </h2>
            <p className="text-xs text-[#9f8d85] mt-1">
              Manage items, prices, variants, stock toggles, and food categories
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCategoryManager(true)}
              className="flex items-center space-x-1.5 text-xs font-semibold bg-[#1c1b1b] hover:bg-[#201f1f] text-[#d6c3b9] border border-[#353534] px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Tag className="w-4 h-4 text-[#fab895]" />
              <span>Manage Categories</span>
            </button>

            <button
              onClick={() => {
                setEditingProduct(null);
                setShowProductForm(true);
              }}
              className="flex items-center space-x-1.5 text-xs font-bold bg-[#6e4025] hover:bg-[#804b2b] text-[#eeae8b] border border-[#fab895]/30 px-4 py-2 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1c1b1b] p-3 rounded-2xl border border-[#353534]">
          <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setSelectedCatId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCatId === 'all'
                  ? 'bg-[#6e4025] text-[#eeae8b]'
                  : 'text-[#9f8d85] hover:text-[#e5e2e1]'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCatId === cat.id
                    ? 'bg-[#6e4025] text-[#eeae8b]'
                    : 'text-[#9f8d85] hover:text-[#e5e2e1]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9f8d85]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-[#131313] border border-[#353534] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
            />
          </div>
        </div>

        {/* Products Table */}
        <ProductTable
          products={filteredProducts}
          categories={categories}
          onToggleAvailability={(id, isAvail) =>
            toggleAvailability.mutate({ productId: id, isAvailable: isAvail })
          }
          onAdjustStock={(id, newStock) =>
            adjustStock.mutate({ productId: id, newStock })
          }
          onEditProduct={handleEdit}
          onDeleteProduct={handleDelete}
        />
      </div>

      {/* Product Create / Edit Modal */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          existingProducts={allProducts}
          onSave={handleSaveProduct}
          onClose={() => setShowProductForm(false)}
        />
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onAddCategory={(data) => addCategory.mutate(data)}
          onUpdateCategory={(params) => updateCategory.mutate(params)}
          onClose={() => setShowCategoryManager(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default Products;
