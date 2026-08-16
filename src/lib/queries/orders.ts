import { supabase } from '../supabase';
import { Order, OrderItem, OrderStatus, PaymentStatus, PaymentMethod } from '../../types/database.types';

export interface OrderFilters {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Format database order row (with joined order_items) into Order interface.
 */
function formatOrder(row: any): Order {
  const rawItems = row.order_items || row.items || [];
  const items: OrderItem[] = rawItems.map((item: any) => ({
    id: item.id,
    order_id: item.order_id || row.id,
    product_id: item.product_id,
    product_name_snapshot: item.product_name_snapshot || item.product_name || 'Menu Item',
    variant_name: item.variant_name || null,
    unit_price: item.unit_price ?? 0,
    quantity: item.quantity ?? 1,
    line_total: item.line_total ?? ((item.unit_price ?? 0) * (item.quantity ?? 1)),
  }));

  return {
    id: row.id,
    order_number: row.order_number ?? 0,
    customer_id: row.customer_id || null,
    customer_name: row.customer_name_snapshot || row.customer_name || row.guest_name || 'Walk-in Guest',
    guest_name: row.guest_name || null,
    created_by_staff: row.created_by_staff || null,
    status: row.status as OrderStatus,
    delivery_address: row.delivery_address || 'Counter Pickup',
    delivery_area: row.delivery_area || null,
    delivery_phone: row.delivery_phone || '',
    subtotal: row.subtotal ?? row.total,
    discount: row.discount ?? 0,
    delivery_fee: row.delivery_fee ?? 0,
    service_charges: row.service_charges ?? 0,
    total: row.total ?? 0,
    payment_method: (row.payment_method || 'cash') as PaymentMethod,
    payment_status: (row.payment_status || 'unpaid') as PaymentStatus,
    paid_amount: row.paid_amount ?? 0,
    notes: row.notes || null,
    created_at: row.created_at || new Date().toISOString(),
    items,
  };
}

const isUuid = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

/**
 * Create order and order items atomically via Postgres RPC function `create_order_with_items`.
 */
export async function createOrder(
  orderData: Partial<Order> & { total: number },
  items: Partial<OrderItem>[]
): Promise<Order> {
  const orderPayload = {
    customer_id: isUuid(orderData.customer_id) ? orderData.customer_id : null,
    created_by_staff: isUuid(orderData.created_by_staff) ? orderData.created_by_staff : null,
    guest_name: orderData.guest_name || null,
    customer_name_snapshot: orderData.customer_name || orderData.guest_name || 'Walk-in Guest',
    delivery_address: orderData.delivery_address || 'Counter Pickup',
    delivery_area: orderData.delivery_area || 'F-7',
    delivery_phone: orderData.delivery_phone || '+92 300 0000000',
    subtotal: orderData.subtotal ?? orderData.total,
    discount: orderData.discount ?? 0,
    delivery_fee: orderData.delivery_fee ?? 0,
    service_charges: orderData.service_charges ?? 0,
    total: orderData.total,
    payment_method: orderData.payment_method || 'cash',
    payment_status: orderData.payment_status || 'unpaid',
    paid_amount: orderData.paid_amount ?? 0,
    notes: orderData.notes || null,
  };

  const itemsPayload = items.map((item) => ({
    product_id: isUuid(item.product_id) ? item.product_id : null,
    product_name_snapshot: item.product_name_snapshot || 'Menu Item',
    variant_name: item.variant_name || null,
    unit_price: item.unit_price ?? 0,
    quantity: item.quantity ?? 1,
    line_total: item.line_total ?? ((item.unit_price ?? 0) * (item.quantity ?? 1)),
    track_quantity: true,
  }));

  const { data: createdOrderId, error } = await supabase.rpc('create_order_with_items', {
    p_order: orderPayload,
    p_items: itemsPayload,
  });

  if (error || !createdOrderId) {
    console.error('Error creating order with RPC:', error);
    throw new Error(error?.message || 'Failed to create order in database.');
  }

  const createdOrder = await getOrderById(createdOrderId);
  if (!createdOrder) {
    throw new Error(`Failed to retrieve newly created order ${createdOrderId}.`);
  }

  return createdOrder;
}

/**
 * Get orders with status/date/search filters matching the Orders screen UI.
 */
export async function getOrders(filters?: OrderFilters): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  let formatted = (data || []).map(formatOrder);

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    formatted = formatted.filter(
      (o) =>
        o.order_number.toString().includes(q) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.delivery_phone && o.delivery_phone.includes(q)) ||
        (o.delivery_area && o.delivery_area.toLowerCase().includes(q))
    );
  }

  return formatted;
}

/**
 * Get order by ID with order_items joined.
 */
export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error(`Error fetching order ${id}:`, error);
    return null;
  }

  return formatOrder(data);
}

/**
 * Update order status by ID.
 */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const updatePayload: Record<string, any> = { status };
  if (status === 'delivered') {
    updatePayload.delivered_at = new Date().toISOString();
    updatePayload.payment_status = 'paid';
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', id)
    .select('*, order_items(*)')
    .single();

  if (error || !data) {
    console.error(`Error updating order status for ${id}:`, error);
    throw error;
  }

  return formatOrder(data);
}

/**
 * Update order delivery fee by ID and recalculate total client-side.
 */
export async function updateOrderDeliveryFee(id: string, deliveryFee: number): Promise<Order> {
  const existingOrder = await getOrderById(id);
  if (!existingOrder) {
    throw new Error(`Order ${id} not found.`);
  }

  const subtotal = existingOrder.subtotal || 0;
  const discount = existingOrder.discount || 0;
  const serviceCharges = existingOrder.service_charges || 0;
  const newTotal = Math.max(0, subtotal - discount + serviceCharges + deliveryFee);

  const { data, error } = await supabase
    .from('orders')
    .update({
      delivery_fee: deliveryFee,
      total: newTotal,
    })
    .eq('id', id)
    .select('*, order_items(*)')
    .single();

  if (error || !data) {
    console.error(`Error updating delivery fee for ${id}:`, error);
    throw error;
  }

  return formatOrder(data);
}
