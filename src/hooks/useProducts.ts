import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '../types/database.types';
import {
  getAllProducts,
  updateProduct,
  createProduct,
  deleteProduct as deleteProductQuery,
  adjustStock as adjustStockQuery,
} from '../lib/queries/products';

// Global helper for order stock deduction using atomic server-side adjustments
export async function deductStockForOrderItems(items: { product_id: string; quantity: number }[]) {
  for (const item of items) {
    if (item.quantity > 0) {
      try {
        await adjustStockQuery(item.product_id, -item.quantity);
      } catch (err) {
        console.error(`Failed to deduct stock for product ${item.product_id}:`, err);
      }
    }
  }
}

export const useProducts = (categoryId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['products', categoryId],
    queryFn: async () => {
      const all = await getAllProducts();
      if (!categoryId || categoryId === 'all') {
        return all;
      }
      return all.filter((p) => p.category_id === categoryId);
    },
  });

  const toggleAvailability = useMutation({
    mutationFn: async ({ productId, isAvailable }: { productId: string; isAvailable: boolean }) => {
      return updateProduct(productId, { is_available: isAvailable });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const adjustStock = useMutation({
    mutationFn: async ({
      productId,
      newStock,
      delta,
    }: {
      productId: string;
      newStock?: number;
      delta?: number;
    }) => {
      let changeDelta = delta;
      if (changeDelta === undefined && newStock !== undefined) {
        const currentProd = (query.data || []).find((p) => p.id === productId);
        changeDelta = newStock - (currentProd?.stock_quantity ?? 0);
      }
      return adjustStockQuery(productId, changeDelta ?? 0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const saveProduct = useMutation({
    mutationFn: async (productData: Partial<Product> & { name: string; base_price: number }) => {
      if (productData.id) {
        return updateProduct(productData.id, productData);
      } else {
        return createProduct(productData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      return deleteProductQuery(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    ...query,
    products: query.data || [],
    allProducts: query.data || [],
    toggleAvailability,
    adjustStock,
    saveProduct,
    deleteProduct,
  };
};

