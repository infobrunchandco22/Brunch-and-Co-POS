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
    mutationFn: async (name: string) => {
      return createCategory({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, name, is_active }: { id: string; name: string; is_active: boolean }) => {
      return updateCategoryQuery(id, { name, is_active });
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

