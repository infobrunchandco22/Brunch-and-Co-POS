import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory as updateCategoryQuery } from '../lib/queries/categories';

export const useCategories = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      return getCategories();
    },
  });

  const addCategory = useMutation({
    mutationFn: async (data: { name: string; image_url?: string | null }) => {
      return createCategory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; is_active?: boolean; image_url?: string | null }) => {
      return updateCategoryQuery(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    ...query,
    categories: query.data || [],
    addCategory,
    updateCategory,
  };
};

