import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Banner } from '../types/database.types';
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner as deleteBannerQuery,
} from '../lib/queries/banners';

export const useBanners = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
  });

  const toggleBanner = useMutation({
    mutationFn: async ({ bannerId, isActive }: { bannerId: string; isActive: boolean }) => {
      return updateBanner(bannerId, { is_active: isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });

  const saveBanner = useMutation({
    mutationFn: async (bannerData: Partial<Banner> & { image_url: string }) => {
      if (bannerData.id) {
        return updateBanner(bannerData.id, bannerData);
      } else {
        return createBanner(bannerData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });

  const deleteBanner = useMutation({
    mutationFn: async (bannerId: string) => {
      return deleteBannerQuery(bannerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });

  return {
    ...query,
    banners: query.data || [],
    toggleBanner,
    saveBanner,
    deleteBanner,
  };
};
