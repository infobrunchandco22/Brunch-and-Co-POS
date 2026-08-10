import React from 'react';
import { Banner, Product } from '../../types/database.types';
import { Edit2, Trash2, CheckCircle2, XCircle, Link2, Calendar } from 'lucide-react';

interface BannerListProps {
  banners: Banner[];
  products: Product[];
  onToggleActive: (bannerId: string, isActive: boolean) => void;
  onEditBanner: (banner: Banner) => void;
  onDeleteBanner: (bannerId: string) => void;
}

export const BannerList: React.FC<BannerListProps> = ({
  banners,
  products,
  onToggleActive,
  onEditBanner,
  onDeleteBanner,
}) => {
  const getLinkedProductName = (prodId: string | null) => {
    if (!prodId) return 'None (General Banner)';
    const found = products.find((p) => p.id === prodId);
    return found ? found.name : 'Linked Product';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="bg-[#1c1b1b] border border-[#353534] rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between group hover:border-[#52443d] transition-all"
        >
          {/* Hero Banner Preview */}
          <div className="relative h-44 w-full bg-[#131313] overflow-hidden">
            <img
              src={banner.image_url}
              alt={banner.title || 'Banner'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

            {/* Banner Text Overlay */}
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <h4 className="font-bold text-sm drop-shadow">{banner.title || 'Promotional Banner'}</h4>
              <p className="text-[11px] text-gray-300 line-clamp-1 drop-shadow">
                {banner.subtitle || 'Special offer'}
              </p>
            </div>

            {/* Status Pill */}
            <div className="absolute top-3 right-3">
              <button
                onClick={() => onToggleActive(banner.id, !banner.is_active)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                  banner.is_active
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 backdrop-blur-md'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-700/60 backdrop-blur-md'
                }`}
              >
                {banner.is_active ? (
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

          {/* Banner Meta Info */}
          <div className="p-4 space-y-2 text-xs text-[#d6c3b9]">
            <div className="flex items-center space-x-1.5 text-[11px] text-[#9f8d85]">
              <Link2 className="w-3.5 h-3.5 text-[#fab895]" />
              <span>Link: </span>
              <span className="font-medium text-[#e5e2e1]">
                {getLinkedProductName(banner.link_product_id)}
              </span>
            </div>

            {(banner.starts_at || banner.ends_at) && (
              <div className="flex items-center space-x-1.5 text-[10px] text-[#9f8d85]">
                <Calendar className="w-3.5 h-3.5 text-[#fab895]" />
                <span>Schedule: {banner.starts_at ? new Date(banner.starts_at).toLocaleDateString() : 'Now'} - {banner.ends_at ? new Date(banner.ends_at).toLocaleDateString() : 'Indefinite'}</span>
              </div>
            )}

            <div className="pt-2 border-t border-[#353534] flex items-center justify-between">
              <span className="text-[10px] text-[#52443d]">Sort Priority: #{banner.sort_order}</span>
              <div className="space-x-1">
                <button
                  onClick={() => onEditBanner(banner)}
                  className="p-1.5 text-[#9f8d85] hover:text-[#e5e2e1] hover:bg-[#201f1f] rounded-lg transition-colors cursor-pointer"
                  title="Edit Banner"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteBanner(banner.id)}
                  className="p-1.5 text-[#9f8d85] hover:text-[#ffb4ab] hover:bg-[#201f1f] rounded-lg transition-colors cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {banners.length === 0 && (
        <div className="col-span-full py-12 text-center text-[#9f8d85] text-xs bg-[#1c1b1b] border border-[#353534] rounded-2xl">
          No banners yet — add your first banner.
        </div>
      )}
    </div>
  );
};
