import { supabase } from '../supabase';
import { Customer, Order } from '../../types/database.types';

export interface CustomerDetail extends Customer {
  orders: Order[];
  activity: {
    id: string;
    type: 'order' | 'reward' | 'profile_update';
    title: string;
    timestamp: string;
  }[];
}

/**
 * Fetch all customers, optionally filtered by name/phone/email search query.
 */
export async function getCustomers(searchQuery?: string): Promise<Customer[]> {
  let query = supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }

  return (data || []).map((c: any) => ({
    id: c.id,
    full_name: c.full_name,
    phone: c.phone,
    email: c.email || null,
    default_address: c.default_address || null,
    default_area: c.default_area || null,
    total_orders: c.total_orders ?? 0,
    total_spent: c.total_spent ?? 0,
    created_at: c.created_at || new Date().toISOString(),
  }));
}

/**
 * Get detailed customer profile joined with order history and activity timeline.
 */
export async function getCustomerDetail(id: string): Promise<CustomerDetail | null> {
  const { data: customerData, error: custError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (custError || !customerData) {
    if (custError) console.error(`Error fetching customer ${id}:`, custError);
    return null;
  }

  // Fetch order history for customer
  const { data: ordersData } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('customer_id', id)
    .order('created_at', { ascending: false });

  const orders: Order[] = (ordersData || []).map((o: any) => ({
    id: o.id,
    order_number: o.order_number ?? 0,
    customer_id: o.customer_id,
    customer_name: o.customer_name_snapshot || customerData.full_name,
    guest_name: o.guest_name || null,
    created_by_staff: o.created_by_staff || null,
    status: o.status,
    delivery_address: o.delivery_address || 'Counter Pickup',
    delivery_area: o.delivery_area || null,
    delivery_phone: o.delivery_phone || o.phone || '',
    subtotal: o.subtotal ?? o.total,
    discount: o.discount ?? 0,
    delivery_fee: o.delivery_fee ?? 0,
    service_charges: o.service_charges ?? 0,
    total: o.total ?? 0,
    payment_method: o.payment_method || 'cash',
    payment_status: o.payment_status || 'unpaid',
    paid_amount: o.paid_amount ?? 0,
    notes: o.notes || null,
    created_at: o.created_at,
    items: (o.order_items || []).map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      product_name_snapshot: item.product_name_snapshot,
      variant_name: item.variant_name || null,
      unit_price: item.unit_price,
      quantity: item.quantity,
      line_total: item.line_total,
    })),
  }));

  // Synthesize activity timeline from orders and customer registration
  type ActivityItem = {
    id: string;
    type: 'order' | 'reward' | 'profile_update';
    title: string;
    timestamp: string;
  };

  const activity: ActivityItem[] = orders.map((o) => ({
    id: `act-ord-${o.id}`,
    type: 'order' as const,
    title: `Placed Order #${o.order_number} (${o.status})`,
    timestamp: o.created_at,
  }));

  activity.push({
    id: `act-reg-${customerData.id}`,
    type: 'profile_update' as const,
    title: 'Customer account registered',
    timestamp: customerData.created_at || new Date().toISOString(),
  });

  activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    id: customerData.id,
    full_name: customerData.full_name,
    phone: customerData.phone,
    email: customerData.email || null,
    default_address: customerData.default_address || null,
    default_area: customerData.default_area || null,
    total_orders: orders.length,
    total_spent: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    created_at: customerData.created_at,
    orders,
    activity,
  };
}

/**
 * Create a new customer profile.
 */
export async function createCustomer(data: Partial<Customer> & { full_name: string; phone: string }): Promise<Customer> {
  const payload = {
    full_name: data.full_name,
    phone: data.phone,
    email: data.email || null,
    default_address: data.default_address || null,
    default_area: data.default_area || 'Bahria Town Phase 7',
    total_orders: 0,
    total_spent: 0,
  };

  const { data: created, error } = await supabase
    .from('customers')
    .insert(payload)
    .select()
    .single();

  if (error || !created) {
    console.error('Error creating customer:', error);
    throw error;
  }

  return created as Customer;
}

/**
 * Update an existing customer profile.
 */
export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
  const { data: updated, error } = await supabase
    .from('customers')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error || !updated) {
    console.error(`Error updating customer ${id}:`, error);
    throw error;
  }

  return updated as Customer;
}
