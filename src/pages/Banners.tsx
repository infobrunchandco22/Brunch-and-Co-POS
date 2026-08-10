import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { BannerList } from '../components/banners/BannerList';
import { BannerForm } from '../components/banners/BannerForm';
import { useBanners } from '../hooks/useBanners';
import { useProducts } from '../hooks/useProducts';
import { Banner } from '../types/database.types';
import { Plus } from 'lucide-react';

export const Banners: React.FC = () => {
  const { banners, toggleBanner, saveBanner, deleteBanner } = useBanners();
  const { products } = useProducts();

  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [showBannerForm, setShowBannerForm] = useState(false);

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setShowBannerForm(true);
  };

  const handleDelete = (bannerId: string) => {
    if (confirm('Delete this promotional banner?')) {
      deleteBanner.mutate(bannerId);
    }
  };

  const handleSaveBanner = (data: Partial<Banner> & { image_url: string }) => {
    saveBanner.mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-lg font-bold text-2xl text-[#e5e2e1] tracking-tight">
              Homepage Banners & Promotions
            </h2>
            <p className="text-xs text-[#9f8d85] mt-1">
              Configure hero marketing slides displayed on the customer web application
            </p>
          </div>

          <button
            onClick={() => {
              setEditingBanner(null);
              setShowBannerForm(true);
            }}
            className="flex items-center space-x-1.5 text-xs font-bold bg-[#6e4025] hover:bg-[#804b2b] text-[#eeae8b] border border-[#fab895]/30 px-4 py-2 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Banner</span>
          </button>
        </div>

        {/* Banners Grid */}
        <BannerList
          banners={banners}
          products={products}
          onToggleActive={(id, isActive) => toggleBanner.mutate({ bannerId: id, isActive })}
          onEditBanner={handleEdit}
          onDeleteBanner={handleDelete}
        />
      </div>

      {/* Banner Modal */}
      {showBannerForm && (
        <BannerForm
          banner={editingBanner}
          products={products}
          onSave={handleSaveBanner}
          onClose={() => setShowBannerForm(false)}
        />
      )}
    </DashboardLayout>
  );
};
