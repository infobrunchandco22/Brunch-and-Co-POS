import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StoreSettings } from '../types/database.types';
import { getStoreSettings, updateStoreSettings, DEFAULT_SETTINGS } from '../lib/queries/settings';

export const useSettings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['settings'],
    queryFn: getStoreSettings,
  });

  const saveSettings = useMutation({
    mutationFn: async (newSettings: Partial<StoreSettings>) => {
      return updateStoreSettings(newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  return {
    ...query,
    settings: query.data || DEFAULT_SETTINGS,
    saveSettings,
  };
};
