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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#000000]/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b border-[#000000]/10 pb-3">
          <h3 className="font-bold text-base text-[#000000]">
            {banner ? 'Edit Homepage Banner' : 'Create Homepage Banner'}
          </h3>
          <button
            onClick={onClose}
            className="text-[#7a4900] hover:text-[#000000] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Banner Image Upload & URL */}
          <div className="bg-[#F6F1EB] p-3.5 rounded-xl border border-[#000000]/10 space-y-2.5">
            <label className="text-[#000000] block font-medium">Banner Image *</label>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="flex items-center space-x-1.5 px-3 py-2 bg-[#FFFFFF] hover:bg-[#EDE6DC] border border-[#000000]/15 rounded-xl text-xs font-semibold text-[#000000] cursor-pointer transition-all shrink-0">
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
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or upload photo"
                    className="w-full bg-[#FFFFFF] border border-[#000000]/15 rounded-xl px-3 py-2 text-xs text-[#000000] focus:outline-none focus:border-[#3d2500]"
                  />
                </div>
              </div>

              {uploadError && <p className="text-[10px] text-rose-600">{uploadError}</p>}

              {imageUrl && (
                <div className="relative h-36 rounded-xl overflow-hidden bg-[#FFFFFF] border border-[#000000]/15 group">
                  <img
                    src={imageUrl}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-900 text-white rounded-lg transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[#7a4900] block mb-1">Main Heading / Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Shakshuka Special"
              className="w-full bg-[#F6F1EB] border border-[#000000]/15 rounded-xl px-3 py-2 text-[#000000] focus:outline-none focus:border-[#3d2500]"
            />
          </div>

          <div>
            <label className="text-[#7a4900] block mb-1">Subtitle / Offer Description</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Get 20% off on all Shakshuka orders!"
              className="w-full bg-[#F6F1EB] border border-[#000000]/15 rounded-xl px-3 py-2 text-[#000000] focus:outline-none focus:border-[#3d2500]"
            />
          </div>

          <div>
            <label className="text-[#7a4900] block mb-1">Linked Menu Item (On Click)</label>
            <select
              value={linkProductId}
              onChange={(e) => setLinkProductId(e.target.value)}
              className="w-full bg-[#F6F1EB] border border-[#000000]/15 rounded-xl px-3 py-2 text-[#000000] focus:outline-none focus:border-[#3d2500]"
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
              className="rounded text-[#3d2500]"
            />
            <label htmlFor="isActiveBanner" className="text-[#000000] cursor-pointer font-medium">
              Banner Active & Published on Customer Website
            </label>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#000000]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#F6F1EB] text-[#7a4900] rounded-xl font-semibold hover:text-[#000000] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#000000] hover:bg-[#3d2500] text-[#FFFDF7] rounded-xl font-bold transition-all cursor-pointer shadow-xs"
            >
              Save Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
