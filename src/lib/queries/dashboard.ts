import { supabase } from '../supabase';
import { Product } from '../../types/database.types';

export interface DashboardStats {
  totalRevenue: number;
  revenueChangePct: number;
  totalProfit: number;
  profitChangePct: number;
  ordersCount: number;
  ordersCountChangePct: number;
  avgOrderValue: number;
  avgOrderValueChangePct: number;
  deliveredOrdersCount: number;
  activeCouriers: number;
  totalCouriers: number;
  ordersOverTime: { time: string; orders: number; revenue: number }[];
  topItems: { product: Product; orderCount: number }[];
}

/**
 * Aggregate dashboard stats:
 * - Revenue: sum of delivered orders' total ONLY
 * - Profit: Revenue - sum(order_items.kitchen_cost_snapshot * quantity) for delivered orders
 * - Total Orders: count of all non-cancelled orders in period
 * - Avg Order Value: delivered revenue / delivered orders count
 * - Real date-bucketed chart data with 0 mock fallback
 */
export async function getDashboardStats(
  dateRange: string = '7d',
  customStartDate?: string,
  customEndDate?: string
): Promise<DashboardStats> {
  const now = new Date();
  let currentPeriodStart: string;
  let currentPeriodEnd: string = new Date().toISOString();
  let prevPeriodStart: string;
  let prevPeriodEnd: string;

  if (dateRange === 'today') {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    currentPeriodStart = todayStart.toISOString();
    const prevDayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    prevPeriodStart = prevDayStart.toISOString();
    prevPeriodEnd = todayStart.toISOString();
  } else if (dateRange === 'this_month' || dateRange === '30d') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    currentPeriodStart = dateRange === 'this_month' ? monthStart.toISOString() : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    prevPeriodStart = prevMonthStart.toISOString();
    prevPeriodEnd = currentPeriodStart;
  } else if (dateRange === 'custom' && customStartDate && customEndDate) {
    currentPeriodStart = new Date(customStartDate).toISOString();
    currentPeriodEnd = new Date(customEndDate).toISOString();
    const duration = new Date(customEndDate).getTime() - new Date(customStartDate).getTime();
    prevPeriodStart = new Date(new Date(customStartDate).getTime() - duration).toISOString();
    prevPeriodEnd = currentPeriodStart;
  } else if (dateRange === 'all') {
    currentPeriodStart = new Date('2020-01-01').toISOString();
    prevPeriodStart = new Date('2020-01-01').toISOString();
    prevPeriodEnd = new Date('2020-01-01').toISOString();
  } else {
    // Default 7 days
    const days = 7;
    currentPeriodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
    prevPeriodStart = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000).toISOString();
    prevPeriodEnd = currentPeriodStart;
  }

  // Fetch current period orders
  let currentQuery = supabase
    .from('orders')
    .select('*, order_items(*)')
    .neq('status', 'cancelled')
    .gte('created_at', currentPeriodStart);

  if (dateRange === 'custom' && customEndDate) {
    currentQuery = currentQuery.lte('created_at', currentPeriodEnd);
  }

  const { data: currentOrders, error: currentErr } = await currentQuery;

  if (currentErr) {
    console.error('Error fetching current period orders:', currentErr);
    throw currentErr;
  }

  // Fetch previous period orders for % comparison
  const { data: prevOrders } = await supabase
    .from('orders')
    .select('id, total, status, order_items(*)')
    .neq('status', 'cancelled')
    .gte('created_at', prevPeriodStart)
    .lt('created_at', prevPeriodEnd);

  const orders = currentOrders || [];
  const prevList = prevOrders || [];

  // Filter delivered orders for Revenue, Profit & AOV
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const prevDeliveredOrders = prevList.filter((o) => o.status === 'delivered');

  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const prevRevenue = prevDeliveredOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  // Delivered cost for current period
  const totalDeliveredCost = deliveredOrders.reduce((sum, o) => {
    const orderCost = (o.order_items || []).reduce((itemSum: number, item: any) => {
      if (
        item.kitchen_cost_snapshot !== null &&
        item.kitchen_cost_snapshot !== undefined &&
        !isNaN(Number(item.kitchen_cost_snapshot))
      ) {
        return itemSum + Number(item.kitchen_cost_snapshot) * Number(item.quantity || 1);
      }
      return itemSum;
    }, 0);
    return sum + orderCost;
  }, 0);

  const prevDeliveredCost = prevDeliveredOrders.reduce((sum, o) => {
    const orderCost = (o.order_items || []).reduce((itemSum: number, item: any) => {
      if (
        item.kitchen_cost_snapshot !== null &&
        item.kitchen_cost_snapshot !== undefined &&
        !isNaN(Number(item.kitchen_cost_snapshot))
      ) {
        return itemSum + Number(item.kitchen_cost_snapshot) * Number(item.quantity || 1);
      }
      return itemSum;
    }, 0);
    return sum + orderCost;
  }, 0);

  const totalProfit = Math.max(0, totalRevenue - totalDeliveredCost);
  const prevProfit = Math.max(0, prevRevenue - prevDeliveredCost);

  const ordersCount = orders.length; // Total orders regardless of status
  const prevOrdersCount = prevList.length;

  const deliveredOrdersCount = deliveredOrders.length;
  const prevDeliveredOrdersCount = prevDeliveredOrders.length;

  const avgOrderValue = deliveredOrdersCount > 0 ? Math.round(totalRevenue / deliveredOrdersCount) : 0;
  const prevAvgOrderValue = prevDeliveredOrdersCount > 0 ? Math.round(prevRevenue / prevDeliveredOrdersCount) : 0;

  const calcPctChange = (curr: number, prev: number): number => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 1000) / 10;
  };

  const revenueChangePct = calcPctChange(totalRevenue, prevRevenue);
  const profitChangePct = calcPctChange(totalProfit, prevProfit);
  const ordersCountChangePct = calcPctChange(ordersCount, prevOrdersCount);
  const avgOrderValueChangePct = calcPctChange(avgOrderValue, prevAvgOrderValue);

  // Group top items from all valid orders
  const itemCounts: Record<string, { product_name: string; count: number; price: number }> = {};
  orders.forEach((o) => {
    (o.order_items || []).forEach((item: any) => {
      const key = item.product_id || item.product_name_snapshot;
      if (!itemCounts[key]) {
        itemCounts[key] = {
          product_name: item.product_name_snapshot,
          count: 0,
          price: Number(item.unit_price || 0),
        };
      }
      itemCounts[key].count += Number(item.quantity || 1);
    });
  });

  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([id, data]) => ({
      product: {
        id,
        category_id: 'cat-1',
        name: data.product_name,
        description: null,
        image_url: null,
        base_price: data.price,
        is_deal: false,
        is_special: false,
        is_available: true,
        sort_order: 0,
        variants: [],
      } as Product,
      orderCount: data.count,
    }));

  // Group delivered revenue & order volume over time
  const timeBuckets: Record<string, { orders: number; revenue: number }> = {};
  
  // Sort orders chronologically
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  sortedOrders.forEach((o) => {
    const ts = o.delivered_at || o.created_at;
    const timeKey = new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!timeBuckets[timeKey]) {
      timeBuckets[timeKey] = { orders: 0, revenue: 0 };
    }
    timeBuckets[timeKey].orders += 1;
    if (o.status === 'delivered') {
      timeBuckets[timeKey].revenue += Number(o.total || 0);
    }
  });

  const ordersOverTime = Object.entries(timeBuckets).map(([time, data]) => ({
    time,
    orders: data.orders,
    revenue: data.revenue,
  }));

  return {
    totalRevenue,
    revenueChangePct,
    totalProfit,
    profitChangePct,
    ordersCount,
    ordersCountChangePct,
    avgOrderValue,
    avgOrderValueChangePct,
    deliveredOrdersCount,
    activeCouriers: 4,
    totalCouriers: 6,
    ordersOverTime,
    topItems,
  };
}
