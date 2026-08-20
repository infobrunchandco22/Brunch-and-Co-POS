import React, { useState } from 'react';
import { Category } from '../../types/database.types';
import { Plus, X, Tag, CheckCircle2, XCircle, Upload, Loader2, Image as ImageIcon, Edit2, Check } from 'lucide-react';
import { uploadCategoryImage } from '../../lib/storage';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (data: { name: string; image_url?: string | null }) => Promise<any> | void;
  onUpdateCategory: (params: { id: string; name?: string; is_active?: boolean; image_url?: string | null }) => Promise<any> | void;
  onClose: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onClose,
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setImageUrl(cat.image_url || '');
    setUploadError('');
    setSaveError('');
  };

  const handleResetForm = () => {
    setEditingCategory(null);
    setName('');
    setImageUrl('');
    setUploadError('');
    setSaveError('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');
      const uploadedUrl = await uploadCategoryImage(file);
      setImageUrl(uploadedUrl);
    } catch (err: any) {
      console.error('Category image upload error:', err);
      setUploadError(err?.message || 'Failed to upload category image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSaving(true);
      setSaveError('');
      if (editingCategory) {
        await onUpdateCategory({
          id: editingCategory.id,
          name: name.trim(),
          image_url: imageUrl.trim() || null,
        });
      } else {
        await onAddCategory({
          name: name.trim(),
          image_url: imageUrl.trim() || null,
        });
      }
      handleResetForm();
    } catch (err: any) {
      console.error('Failed to save category:', err);
      setSaveError(err?.message || 'Failed to save category. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#000000]/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b border-[#000000]/10 pb-3">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-[#3d2500]" />
            <h3 className="font-bold text-sm text-[#000000]">
              {editingCategory ? 'Edit Category' : 'Manage Menu Categories'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#7a4900] hover:text-[#000000] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Add/Edit Form */}
        <form onSubmit={handleSubmit} className="bg-[#F6F1EB] border border-[#000000]/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#000000]">
              {editingCategory ? `Editing: ${editingCategory.name}` : 'Add New Category'}
            </span>
            {editingCategory && (
              <button
                type="button"
                onClick={handleResetForm}
                className="text-[10px] text-[#3d2500] hover:underline cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div>
            <label className="text-[10px] text-[#7a4900] block mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Desserts, Beverages, Starters"
              className="w-full bg-[#FFFFFF] border border-[#000000]/15 rounded-xl px-3 py-2 text-xs text-[#000000] focus:outline-none focus:border-[#3d2500]"
            />
          </div>

          {/* Image Upload Field */}
          <div>
            <label className="text-[10px] text-[#7a4900] block mb-1">Category Image (Photo Banner)</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#EDE6DC] border border-[#000000]/15 rounded-xl text-xs font-semibold text-[#000000] cursor-pointer transition-colors shrink-0">
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3d2500]" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-[#3d2500]" />
                  )}
                  <span>{isUploading ? 'Uploading...' : 'Choose File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                <div className="relative flex-1">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or upload photo"
                    className="w-full bg-[#FFFFFF] border border-[#000000]/15 rounded-xl px-3 py-1.5 text-xs text-[#000000] focus:outline-none focus:border-[#3d2500]"
                  />
                </div>
              </div>

              {uploadError && <p className="text-[10px] text-rose-600">{uploadError}</p>}

              {/* Image Preview Thumbnail */}
              {imageUrl && (
                <div className="relative h-20 w-full rounded-xl overflow-hidden bg-[#FFFFFF] border border-[#000000]/15 flex items-center justify-center group">
                  <img
                    src={imageUrl}
                    alt="Category Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-900 text-white rounded-lg transition-colors cursor-pointer"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {saveError && (
            <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-xl">
              {saveError}
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isUploading || isSaving || !name.trim()}
              className="bg-[#000000] hover:bg-[#3d2500] text-[#FFFDF7] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : editingCategory ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Category</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Category</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Existing Categories Directory */}
        <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
          <p className="text-[10px] text-[#7a4900] uppercase tracking-wider font-bold">Existing Categories ({categories.length})</p>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between bg-[#FFFFFF] border border-[#000000]/10 p-2.5 rounded-xl text-xs shadow-2xs"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#F6F1EB] border border-[#000000]/10 overflow-hidden flex items-center justify-center shrink-0">
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-[#7a4900]/40" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#000000] truncate">{cat.name}</p>
                  <p className="text-[9px] text-[#7a4900]">
                    {cat.image_url ? 'Photo set' : 'No photo uploaded'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleStartEdit(cat)}
                  className="p-1.5 text-[#7a4900] hover:text-[#000000] hover:bg-[#F6F1EB] rounded-lg transition-colors cursor-pointer"
                  title="Edit category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateCategory({ id: cat.id, is_active: !cat.is_active })
                  }
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                    cat.is_active
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {cat.is_active ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-[#000000]/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#000000] hover:bg-[#3d2500] text-[#FFFDF7] rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

