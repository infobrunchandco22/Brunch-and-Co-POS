import React, { useState, useEffect } from 'react';
import { Banner, Product } from '../../types/database.types';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadBannerImage } from '../../lib/storage';

interface BannerFormProps {
  banner?: Banner | null;
  products: Product[];
  onSave: (data: Partial<Banner> & { image_url: string }) => void;
  onClose: () => void;
}

export const BannerForm: React.FC<BannerFormProps> = ({
  banner,
  products,
  onSave,
  onClose,
}) => {
  const [imageUrl, setImageUrl] = useState(banner?.image_url || '');
  const [title, setTitle] = useState(banner?.title || '');
  const [subtitle, setSubtitle] = useState(banner?.subtitle || '');
  const [linkProductId, setLinkProductId] = useState(banner?.link_product_id || '');
  const [isActive, setIsActive] = useState(banner?.is_active ?? true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (banner) {
      setImageUrl(banner.image_url);
      setTitle(banner.title || '');
      setSubtitle(banner.subtitle || '');
      setLinkProductId(banner.link_product_id || '');
      setIsActive(banner.is_active);
    }
  }, [banner]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const publicUrl = await uploadBannerImage(file);
      if (publicUrl) {
        setImageUrl(publicUrl);
      }
    } catch (err: any) {
      console.error('Banner upload error:', err);
      setUploadError(err?.message || 'Failed to upload banner image to Supabase Storage.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;

    onSave({
      id: banner?.id,
      image_url: imageUrl,
      title: title || null,
      subtitle: subtitle || null,
      link_product_id: linkProductId || null,
      is_active: isActive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1b1b] border border-[#52443d] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b border-[#353534] pb-3">
          <h3 className="font-bold text-base text-[#e5e2e1]">
            {banner ? 'Edit Homepage Banner' : 'Create Homepage Banner'}
          </h3>
          <button
            onClick={onClose}
            className="text-[#9f8d85] hover:text-[#e5e2e1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Banner Image Upload & URL */}
          <div className="bg-[#131313] p-3.5 rounded-xl border border-[#2a2a2a] space-y-2.5">
            <label className="text-[#9f8d85] block font-medium">Banner Image *</label>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="flex items-center space-x-1.5 px-3 py-2 bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#353534] hover:border-[#fab895]/50 rounded-xl text-xs font-semibold text-[#e5e2e1] cursor-pointer transition-all shrink-0">
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
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or upload photo"
                    className="w-full bg-[#1c1b1b] border border-[#353534] rounded-xl px-3 py-2 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
                  />
                </div>
              </div>

              {uploadError && <p className="text-[10px] text-rose-400">{uploadError}</p>}

              {imageUrl && (
                <div className="relative h-36 rounded-xl overflow-hidden bg-[#1c1b1b] border border-[#353534] group">
                  <img
                    src={imageUrl}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-950 text-white rounded-lg transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[#9f8d85] block mb-1">Main Heading / Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Shakshuka Special"
              className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
            />
          </div>

          <div>
            <label className="text-[#9f8d85] block mb-1">Subtitle / Offer Description</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Get 20% off on all Shakshuka orders!"
              className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
            />
          </div>

          <div>
            <label className="text-[#9f8d85] block mb-1">Linked Menu Item (On Click)</label>
            <select
              value={linkProductId}
              onChange={(e) => setLinkProductId(e.target.value)}
              className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
            >
              <option value="">None (General Marketing Banner)</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActiveBanner"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-[#6e4025]"
            />
            <label htmlFor="isActiveBanner" className="text-[#e5e2e1] cursor-pointer">
              Banner Active & Published on Customer Website
            </label>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#353534]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#131313] text-[#9f8d85] rounded-xl font-semibold hover:text-[#e5e2e1] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#6e4025] hover:bg-[#804b2b] text-[#eeae8b] border border-[#fab895]/30 rounded-xl font-bold transition-all cursor-pointer"
            >
              Save Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
