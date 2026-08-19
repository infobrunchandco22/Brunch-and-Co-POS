import { Order } from '../types/database.types';

/**
 * Export a list of orders to an Excel (.xlsx) file client-side.
 * Includes detailed item breakdown, customer info, order status, and financial metrics.
 * Uses dynamic import so xlsx is only loaded when export is triggered.
 */
export async function exportOrdersToExcel(orders: Order[], fileNameSuffix: string = 'Orders_Report') {
  if (!orders || orders.length === 0) {
    alert('No orders available to export for the selected date range.');
    return;
  }

  const XLSX = await import('xlsx');

  const exportRows = orders.map((o) => {
    const itemsSummary = (o.items || [])
      .map((item) => `${item.quantity}x ${item.product_name_snapshot}${item.variant_name ? ` (${item.variant_name})` : ''}`)
      .join(', ');

    return {
      'Order #': `#${o.order_number}`,
      'Customer Name': o.customer_name || o.guest_name || 'Walk-in Guest',
      'Delivery Phone': o.delivery_phone || 'N/A',
      'Delivery Address': `${o.delivery_address}${o.delivery_area ? `, ${o.delivery_area}` : ''}`,
      'Items': itemsSummary || 'No items',
      'Subtotal (Rs)': o.subtotal,
      'Discount (Rs)': o.discount,
      'Delivery Fee (Rs)': o.delivery_fee,
      'Service Charges (Rs)': o.service_charges || 0,
      'Total Amount (Rs)': o.total,
      'Payment Status': (o.payment_status || 'unpaid').toUpperCase(),
      'Payment Method': (o.payment_method || 'cash').toUpperCase(),
      'Order Status': (o.status || 'pending').toUpperCase(),
      'Created At': new Date(o.created_at).toLocaleString('en-US'),
      'Delivered At': (o as any).delivered_at ? new Date((o as any).delivered_at).toLocaleString('en-US') : (o.status === 'delivered' ? new Date(o.created_at).toLocaleString('en-US') : 'N/A'),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  
  // Set column widths for clean readability
  const colWidths = [
    { wch: 10 }, // Order #
    { wch: 22 }, // Customer Name
    { wch: 16 }, // Phone
    { wch: 30 }, // Address
    { wch: 40 }, // Items
    { wch: 14 }, // Subtotal
    { wch: 14 }, // Discount
    { wch: 16 }, // Delivery Fee
    { wch: 18 }, // Service Charges
    { wch: 16 }, // Total Amount
    { wch: 15 }, // Payment Status
    { wch: 15 }, // Payment Method
    { wch: 15 }, // Order Status
    { wch: 22 }, // Created At
    { wch: 22 }, // Delivered At
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders Export');

  const todayStr = new Date().toISOString().split('T')[0];
  const filename = `Brunch_and_Co_${fileNameSuffix}_${todayStr}.xlsx`;

  XLSX.writeFile(workbook, filename);
}
