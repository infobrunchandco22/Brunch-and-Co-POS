import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Order, OrderStatus, PaymentStatus } from '../types/database.types';
import { supabase } from '../lib/supabase';
import {
  createOrder as createOrderQuery,
  getOrders,
  getOrderById,
  updateOrderStatus as updateOrderStatusQuery,
  updateOrderDeliveryFee as updateOrderDeliveryFeeQuery,
} from '../lib/queries/orders';

export const useOrders = (statusFilter?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: async () => {
      return getOrders({ status: statusFilter });
    },
  });

  // Realtime subscription pattern: subscribe to orders & order_items changes
  useEffect(() => {
    const channelId = `orders-realtime-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createOrder = useMutation({
    mutationFn: async (newOrderData: Partial<Order> & { total: number }) => {
      const items = newOrderData.items || [];
      return createOrderQuery(newOrderData, items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      return updateOrderStatusQuery(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const updatePaymentStatus = useMutation({
    mutationFn: async ({ orderId, payment_status, paid_amount }: { orderId: string; payment_status: PaymentStatus; paid_amount?: number }) => {
      const existing = await getOrderById(orderId);
      if (!existing) throw new Error(`Order ${orderId} not found`);

      const { data, error } = await supabase
        .from('orders')
        .update({
          payment_status,
          paid_amount: paid_amount !== undefined ? paid_amount : existing.total,
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const updateDeliveryFee = useMutation({
    mutationFn: async ({ orderId, deliveryFee }: { orderId: string; deliveryFee: number }) => {
      return updateOrderDeliveryFeeQuery(orderId, deliveryFee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  return {
    ...query,
    orders: query.data || [],
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    updateDeliveryFee,
  };
};
