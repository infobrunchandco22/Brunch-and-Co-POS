import React, { useState } from 'react';
import { Category } from '../../types/database.types';
import { Plus, X, Tag, CheckCircle2, XCircle, Upload, Loader2, Image as ImageIcon, Edit2, Check } from 'lucide-react';
import { uploadCategoryImage } from '../../lib/storage';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (data: { name: string; image_url?: string | null }) => void;
  onUpdateCategory: (params: { id: string; name?: string; is_active?: boolean; image_url?: string | null }) => void;
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

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setImageUrl(cat.image_url || '');
    setUploadError('');
  };

  const handleResetForm = () => {
    setEditingCategory(null);
    setName('');
    setImageUrl('');
    setUploadError('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      onUpdateCategory({
        id: editingCategory.id,
        name: name.trim(),
        image_url: imageUrl.trim() || null,
      });
    } else {
      onAddCategory({
        name: name.trim(),
        image_url: imageUrl.trim() || null,
      });
    }

    handleResetForm();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1b1b] border border-[#52443d] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b border-[#353534] pb-3">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-[#fab895]" />
            <h3 className="font-bold text-sm text-[#e5e2e1]">
              {editingCategory ? 'Edit Category' : 'Manage Menu Categories'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9f8d85] hover:text-[#e5e2e1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Add/Edit Form */}
        <form onSubmit={handleSubmit} className="bg-[#131313] border border-[#353534] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#e5e2e1]">
              {editingCategory ? `Editing: ${editingCategory.name}` : 'Add New Category'}
            </span>
            {editingCategory && (
              <button
                type="button"
                onClick={handleResetForm}
                className="text-[10px] text-[#fab895] hover:underline cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div>
            <label className="text-[10px] text-[#9f8d85] block mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Desserts, Beverages, Starters"
              className="w-full bg-[#1c1b1b] border border-[#353534] rounded-xl px-3 py-2 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
            />
          </div>

          {/* Image Upload Field */}
          <div>
            <label className="text-[10px] text-[#9f8d85] block mb-1">Category Image (Photo Banner)</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#353534] rounded-xl text-xs font-semibold text-[#d6c3b9] cursor-pointer transition-colors shrink-0">
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#fab895]" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-[#fab895]" />
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
                    className="w-full bg-[#1c1b1b] border border-[#353534] rounded-xl px-3 py-1.5 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
                  />
                </div>
              </div>

              {uploadError && <p className="text-[10px] text-rose-400">{uploadError}</p>}

              {/* Image Preview Thumbnail */}
              {imageUrl && (
                <div className="relative h-20 w-full rounded-xl overflow-hidden bg-[#1c1b1b] border border-[#353534] flex items-center justify-center group">
                  <img
                    src={imageUrl}
                    alt="Category Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-950 text-white rounded-lg transition-colors cursor-pointer"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isUploading || !name.trim()}
              className="bg-[#6e4025] hover:bg-[#804b2b] text-[#eeae8b] border border-[#fab895]/30 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {editingCategory ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
            </button>
          </div>
        </form>

        {/* Existing Categories Directory */}
        <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
          <p className="text-[10px] text-[#9f8d85] uppercase tracking-wider font-bold">Existing Categories ({categories.length})</p>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between bg-[#131313] border border-[#2a2a2a] p-2.5 rounded-xl text-xs"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#201f1f] border border-[#353534] overflow-hidden flex items-center justify-center shrink-0">
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-[#52443d]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#e5e2e1] truncate">{cat.name}</p>
                  <p className="text-[9px] text-[#9f8d85]">
                    {cat.image_url ? 'Photo set' : 'No photo uploaded'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleStartEdit(cat)}
                  className="p-1.5 text-[#9f8d85] hover:text-[#fab895] hover:bg-[#201f1f] rounded-lg transition-colors cursor-pointer"
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
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
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

        <div className="pt-2 border-t border-[#353534] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#131313] text-[#e5e2e1] rounded-xl text-xs font-semibold hover:bg-[#201f1f] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

