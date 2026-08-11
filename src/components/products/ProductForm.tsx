import React, { useState, useEffect, useRef } from 'react';
import { Product, Category } from '../../types/database.types';
import { Plus, Trash2, X, Image as ImageIcon, Search, Upload, Loader2, AlertCircle } from 'lucide-react';
import { uploadProductImage } from '../../lib/storage';

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  existingProducts?: Product[];
  onSave: (data: Partial<Product> & { name: string; base_price: number }) => Promise<void> | void;
  onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  existingProducts = [],
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(product?.name || '');
  const [displayNameLocal, setDisplayNameLocal] = useState(product?.display_name_local || '');
  const [categoryId, setCategoryId] = useState(
    product?.category_id || (categories[0]?.id ?? '')
  );
  const [description, setDescription] = useState(product?.description || '');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [basePrice, setBasePrice] = useState(product?.base_price || 0);
  const [kitchenCost, setKitchenCost] = useState<number | ''>(product?.kitchen_cost || '');
  const [billingUnit, setBillingUnit] = useState(product?.billing_unit || 'plate');
  const [sku, setSku] = useState(product?.sku || '');
  const [sortOrder, setSortOrder] = useState<number>(product?.sort_order ?? 0);

  const [trackQuantity, setTrackQuantity] = useState(product?.track_quantity || false);
  const [stockQuantity, setStockQuantity] = useState<number>(product?.stock_quantity ?? 10);

  const [isDeal, setIsDeal] = useState(product?.is_deal || false);
  const [isSpecial, setIsSpecial] = useState(product?.is_special || false);
  const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true);

  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // Image reuse picker search state
  const [imageSearch, setImageSearch] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [variants, setVariants] = useState<
    {
      id?: string;
      variant_name: string;
      code?: string;
      price: number;
      kitchen_cost?: number | '';
      is_default: boolean;
    }[]
  >(
    product?.variants.map((v) => ({
      id: v.id,
      variant_name: v.variant_name,
      code: v.code || '',
      price: v.price,
      kitchen_cost: v.kitchen_cost || '',
      is_default: v.is_default,
    })) || [{ variant_name: 'Regular', code: 'REG', price: product?.base_price || 0, kitchen_cost: product?.kitchen_cost || '', is_default: true }]
  );

  const initialProductIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // Only re-initialize form state if the active product ID changes
    if (initialProductIdRef.current !== product?.id) {
      initialProductIdRef.current = product?.id;
      if (product) {
        setName(product.name);
        setDisplayNameLocal(product.display_name_local || '');
        setCategoryId(product.category_id);
        setDescription(product.description || '');
        setImageUrl(product.image_url || '');
        setBasePrice(product.base_price);
        setKitchenCost(product.kitchen_cost || '');
        setBillingUnit(product.billing_unit || 'plate');
        setSku(product.sku || '');
        setSortOrder(product.sort_order ?? 0);
        setTrackQuantity(product.track_quantity || false);
        setStockQuantity(product.stock_quantity ?? 0);
        setIsDeal(product.is_deal);
        setIsSpecial(product.is_special);
        setIsAvailable(product.is_available);
        setVariants(
          product.variants.length > 0
            ? product.variants.map((v) => ({
                id: v.id,
                variant_name: v.variant_name,
                code: v.code || '',
                price: v.price,
                kitchen_cost: v.kitchen_cost || '',
                is_default: v.is_default,
              }))
            : [{ variant_name: 'Regular', code: 'REG', price: product.base_price, kitchen_cost: product.kitchen_cost || '', is_default: true }]
        );
      }
    }
  }, [product]);

  // Extract unique existing product images
  const availableImageProducts = existingProducts.filter(
    (p) => p.image_url && p.image_url.trim().length > 0
  );

  const filteredImageProducts = availableImageProducts.filter((p) => {
    if (!imageSearch) return true;
    return p.name.toLowerCase().includes(imageSearch.toLowerCase());
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setError('');

    try {
      const publicUrl = await uploadProductImage(file);
      setImageUrl(publicUrl);
    } catch (err: any) {
      console.error('Failed to upload image file:', err);
      setError(err?.message || 'Failed to upload image to Supabase Storage.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleBasePriceChange = (val: number) => {
    setBasePrice(val);
    if (variants.length === 1) {
      setVariants((prev) => [{ ...prev[0], price: val }]);
    }
  };

  const handleKitchenCostChange = (val: number | '') => {
    setKitchenCost(val);
    if (variants.length === 1) {
      setVariants((prev) => [{ ...prev[0], kitchen_cost: val }]);
    }
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { variant_name: 'Large', code: 'L', price: basePrice + 100, kitchen_cost: kitchenCost, is_default: false },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a product name.');
      return;
    }

    if (basePrice < 0) {
      setError('Base sale price cannot be negative.');
      return;
    }

    const validCategory = categories.find((c) => c.id === categoryId) || categories[0];
    if (!validCategory) {
      setError('No categories found. Please create a category first before adding products.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        id: product?.id,
        name: name.trim(),
        display_name_local: displayNameLocal.trim() || null,
        category_id: validCategory.id,
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        base_price: Number(basePrice),
        kitchen_cost: kitchenCost !== '' ? Number(kitchenCost) : null,
        billing_unit: billingUnit.trim() || 'plate',
        sku: sku.trim() || undefined,
        sort_order: Number(sortOrder),
        track_quantity: trackQuantity,
        stock_quantity: trackQuantity ? Number(stockQuantity) : 0,
        is_deal: isDeal,
        is_special: isSpecial,
        is_available: isAvailable,
        variants: variants.map((v, i) => ({
          id: v.id || `var-${Date.now()}-${i}`,
          product_id: product?.id || '',
          variant_name: v.variant_name,
          code: v.code || null,
          price: Number(v.price),
          kitchen_cost: v.kitchen_cost !== '' ? Number(v.kitchen_cost) : null,
          is_default: i === 0,
        })),
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setError(err?.message || 'Failed to save product in database. Please check required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1b1b] border border-[#52443d] rounded-2xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[92vh] custom-scrollbar">
        <div className="flex items-center justify-between border-b border-[#353534] pb-4 mb-4">
          <h3 className="font-bold text-base text-[#e5e2e1]">
            {product ? 'Edit Menu Product' : 'Create New Menu Product'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[#9f8d85] hover:text-[#e5e2e1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs p-3.5 rounded-xl flex items-start space-x-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Name & Local / Display Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#9f8d85] block mb-1">Product Name (English) *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Avocado Toast"
                className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
              />
            </div>

            <div>
              <label className="text-[#9f8d85] block mb-1">Display / Local Name (Urdu/Local)</label>
              <input
                type="text"
                value={displayNameLocal}
                onChange={(e) => setDisplayNameLocal(e.target.value)}
                placeholder="e.g. آووکاڈو ٹوسٹ"
                className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
              />
            </div>
          </div>

          {/* Category, SKU, Unit, Sort Order Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[#9f8d85] block mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
              >
                {categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-[#9f8d85] block mb-1">SKU / Item Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. BR-101"
                className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895] uppercase font-mono"
              />
            </div>

            <div>
              <label className="text-[#9f8d85] block mb-1">Billing Unit</label>
              <select
                value={billingUnit}
                onChange={(e) => setBillingUnit(e.target.value)}
                className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
              >
                <option value="plate">Plate</option>
                <option value="cup">Cup / Mug</option>
                <option value="piece">Piece / Item</option>
                <option value="serving">Serving</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="portion">Portion</option>
              </select>
            </div>

            <div>
              <label className="text-[#9f8d85] block mb-1">Sort Order</label>
              <input
                type="number"
                value={sortOrder === 0 ? '' : sortOrder}
                onChange={(e) => setSortOrder(e.target.value === '' ? 0 : Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[#9f8d85] block mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ingredients, dietary notes..."
              className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895] resize-none"
            />
          </div>

          {/* Image Upload & Reuse existing image */}
          <div className="bg-[#131313] p-3 rounded-xl border border-[#2a2a2a] space-y-2.5">
            <label className="text-[#9f8d85] block font-medium">Product Image</label>
            
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              {/* File Upload Button (Supabase Storage) */}
              <label className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-[#1c1b1b] hover:bg-[#2a2a2a] border border-[#353534] hover:border-[#fab895]/50 text-[#e5e2e1] rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0">
                {isUploadingImage ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#fab895] animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-[#fab895]" />
                )}
                <span>{isUploadingImage ? 'Uploading...' : 'Choose File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingImage}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <span className="text-[#9f8d85] text-center text-[10px] shrink-0">OR URL</span>

              {/* URL Input */}
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste Image URL or upload file..."
                className="flex-1 bg-[#1c1b1b] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
              />

              {/* Image Preview */}
              {imageUrl && (
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#131313] border border-[#353534] shrink-0 self-center">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            {/* Reuse existing image selector */}
            <div className="pt-2 border-t border-[#2a2a2a]">
              <button
                type="button"
                onClick={() => setShowImagePicker(!showImagePicker)}
                className="text-[11px] text-[#fab895] hover:text-[#eeae8b] flex items-center space-x-1 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{showImagePicker ? 'Hide Image Picker' : 'Reuse existing product image'}</span>
              </button>

              {showImagePicker && (
                <div className="mt-2 p-2.5 bg-[#1c1b1b] border border-[#353534] rounded-xl space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9f8d85]" />
                    <input
                      type="text"
                      value={imageSearch}
                      onChange={(e) => setImageSearch(e.target.value)}
                      placeholder="Search existing item images..."
                      className="w-full bg-[#131313] border border-[#353534] rounded-lg pl-8 pr-2 py-1 text-xs text-[#e5e2e1] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                    {filteredImageProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (p.image_url) {
                            setImageUrl(p.image_url);
                            setShowImagePicker(false);
                          }
                        }}
                        className={`group relative rounded-lg overflow-hidden h-14 border transition-all cursor-pointer ${
                          imageUrl === p.image_url
                            ? 'border-[#fab895] ring-2 ring-[#fab895]/50'
                            : 'border-[#353534] hover:border-[#6e4025]'
                        }`}
                        title={p.name}
                      >
                        <img
                          src={p.image_url!}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                          <p className="text-[8px] text-white font-medium truncate">{p.name}</p>
                        </div>
                      </button>
                    ))}

                    {filteredImageProducts.length === 0 && (
                      <p className="col-span-full text-[10px] text-[#9f8d85] text-center py-2">
                        No uploaded images found matching query.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Cost Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#131313] p-3 rounded-xl border border-[#2a2a2a]">
            <div>
              <label className="text-[#9f8d85] block mb-1">Base Sale Price (Rs) *</label>
              <input
                type="number"
                required
                min="0"
                value={basePrice || ''}
                onChange={(e) => handleBasePriceChange(Number(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="w-full bg-[#1c1b1b] border border-[#353534] rounded-lg px-2.5 py-1.5 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
              />
            </div>

            <div>
              <label className="text-[#9f8d85] block mb-1">Kitchen Cost (Rs)</label>
              <input
                type="number"
                min="0"
                value={kitchenCost === 0 ? '' : kitchenCost}
                onChange={(e) => handleKitchenCostChange(e.target.value !== '' ? Number(e.target.value) : '')}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="w-full bg-[#1c1b1b] border border-[#353534] rounded-lg px-2.5 py-1.5 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
              />
            </div>

            <div className="sm:col-span-2 flex items-center space-x-6 pt-1">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSpecial}
                  onChange={(e) => setIsSpecial(e.target.checked)}
                  className="rounded text-[#6e4025] focus:ring-0"
                />
                <span className="text-[#e5e2e1]">Chef's Special</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDeal}
                  onChange={(e) => setIsDeal(e.target.checked)}
                  className="rounded text-[#6e4025] focus:ring-0"
                />
                <span className="text-[#e5e2e1]">Deal Badge</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded text-[#6e4025] focus:ring-0"
                />
                <span className="text-[#e5e2e1]">Available in Menu</span>
              </label>
            </div>
          </div>

          {/* Track Quantity & Stock Management */}
          <div className="bg-[#131313] p-3 rounded-xl border border-[#2a2a2a] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-[#e5e2e1]">
                  <input
                    type="checkbox"
                    checked={trackQuantity}
                    onChange={(e) => setTrackQuantity(e.target.checked)}
                    className="rounded text-[#6e4025] focus:ring-0 w-4 h-4"
                  />
                  <span>Track Quantity</span>
                </label>
                <p className="text-[10px] text-[#9f8d85] mt-0.5 ml-6">
                  When enabled, confirmed orders automatically reduce stock for this item.
                </p>
              </div>

              {trackQuantity && (
                <div className="w-36">
                  <label className="text-[#fab895] block mb-1 font-semibold text-[11px]">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity === 0 ? '' : stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    className="w-full bg-[#1c1b1b] border border-[#fab895]/50 rounded-lg px-2.5 py-1.5 text-[#e5e2e1] font-bold focus:outline-none focus:border-[#fab895]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Variants Manager */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[#9f8d85] block font-semibold">Size / Portion Variants</label>
              <button
                type="button"
                onClick={handleAddVariant}
                className="text-[11px] text-[#fab895] hover:text-[#eeae8b] flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-2">
              {variants.map((variant, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-[#131313] border border-[#2a2a2a] p-2 rounded-xl items-center"
                >
                  <div className="col-span-1 sm:col-span-4">
                    <input
                      type="text"
                      value={variant.variant_name}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[idx].variant_name = e.target.value;
                        setVariants(updated);
                      }}
                      placeholder="Variant name (e.g. Single Slice)"
                      className="w-full bg-[#1c1b1b] border border-[#353534] rounded-lg px-2 py-1 text-[#e5e2e1] focus:outline-none"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <input
                      type="text"
                      value={variant.code || ''}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[idx].code = e.target.value;
                        setVariants(updated);
                      }}
                      placeholder="Code (S/M/L)"
                      className="w-full bg-[#1c1b1b] border border-[#353534] rounded-lg px-2 py-1 text-[#e5e2e1] focus:outline-none uppercase text-[11px]"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-3">
                    <input
                      type="number"
                      value={variant.price || ''}
                      onChange={(e) => {
                        const updated = [...variants];
                        const val = Number(e.target.value) || 0;
                        updated[idx].price = val;
                        setVariants(updated);
                        if (idx === 0) setBasePrice(val);
                      }}
                      onFocus={(e) => e.target.select()}
                      placeholder="0"
                      className="w-full bg-[#1c1b1b] border border-[#353534] rounded-lg px-2 py-1 text-[#e5e2e1] focus:outline-none"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <input
                      type="number"
                      value={variant.kitchen_cost || ''}
                      onChange={(e) => {
                        const val = e.target.value !== '' ? Number(e.target.value) : '';
                        const updated = [...variants];
                        updated[idx].kitchen_cost = val;
                        setVariants(updated);
                        if (idx === 0) setKitchenCost(val);
                      }}
                      onFocus={(e) => e.target.select()}
                      placeholder="0"
                      className="w-full bg-[#1c1b1b] border border-[#353534] rounded-lg px-2 py-1 text-[#e5e2e1] focus:outline-none"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-1 flex justify-end">
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1 text-rose-400 hover:text-rose-300 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#353534]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#131313] hover:bg-[#201f1f] text-[#9f8d85] hover:text-[#e5e2e1] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="px-5 py-2 bg-[#6e4025] hover:bg-[#804b2b] text-[#eeae8b] border border-[#fab895]/30 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <span>{product ? 'Update Product' : 'Create Product'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
