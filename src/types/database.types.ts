export interface Staff {
  id: string;
  full_name: string;
  phone: string | null;
  role: 'admin' | 'staff';
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  default_address: string | null;
  default_area: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  image_url?: string | null;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  code?: string | null;
  price: number;
  kitchen_cost?: number | null;
  is_default: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  display_name_local?: string | null;
  description: string | null;
  image_url: string | null;
  base_price: number;
  kitchen_cost?: number | null;
  billing_unit?: string;
  sku?: string | null;
  track_quantity?: boolean;
  stock_quantity?: number;
  is_deal: boolean;
  is_special: boolean;
  is_available: boolean;
  sort_order: number;
  created_at?: string;
  created_by?: string | null;
  variants: ProductVariant[];
}

export interface Banner {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link_product_id: string | null;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export type RewardRequirementType =
  | 'order_count'
  | 'total_spent'
  | 'specific_product'
  | 'single_order_value';

export type RewardType =
  | 'discount_percent'
  | 'discount_flat'
  | 'free_item'
  | 'custom';

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  requirement_type: RewardRequirementType;
  requirement_value: Record<string, number | string>;
  reward_type: RewardType;
  reward_value: Record<string, number | string>;
  is_active: boolean;
}

export interface CustomerRewardProgress {
  id: string;
  customer_id: string;
  reward_id: string;
  current_progress: Record<string, number>;
  is_unlocked: boolean;
  unlocked_at: string | null;
  is_claimed: boolean;
  claimed_at: string | null;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'online';
export type PaymentStatus = 'unpaid' | 'paid' | 'partial';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  variant_name: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  kitchen_cost_snapshot?: number | null;
}

export interface StoreSettings {
  id?: string;
  store_name: string;
  phone: string;
  address: string;
  default_delivery_fee: number;
  default_service_charge: number;
  paper_width: '80mm' | '58mm';
  auto_print_bill: boolean;
  auto_print_kot: boolean;
  updated_at?: string;
}

export interface Order {
  id: string;
  order_number: number;
  customer_id: string | null;
  customer_name?: string;
  guest_name?: string | null;
  created_by_staff: string | null;
  status: OrderStatus;
  delivery_address: string;
  delivery_area: string | null;
  delivery_phone: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  service_charges: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  paid_amount: number;
  notes: string | null;
  created_at: string;
  delivered_at?: string | null;
  issue_notes?: string | null;
  has_issue?: boolean;
  items: OrderItem[];
}
