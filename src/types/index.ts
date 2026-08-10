import { Order, Product, ProductVariant } from './database.types';

export * from './database.types';

export interface CartItem {
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  notes?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChangePct: number;
  ordersCount: number;
  ordersCountChangePct: number;
  avgOrderValue: number;
  avgOrderValueChangePct: number;
  activeCouriers: number;
  totalCouriers: number;
  recentOrders: Order[];
  topItems: {
    product: Product;
    orderCount: number;
  }[];
  ordersOverTime: {
    time: string;
    count: number;
    revenue: number;
  }[];
}

export interface BusinessSettings {
  name: string;
  phone: string;
  address: string;
  taxRate: number;
  serviceChargeRate: number;
  defaultDeliveryFee: number;
}

export interface PrinterSettings {
  connectedPrinter: string | null;
  paperWidth: '80mm' | '58mm';
  autoPrintBill: boolean;
  autoPrintKot: boolean;
}
