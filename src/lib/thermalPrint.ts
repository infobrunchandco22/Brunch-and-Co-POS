import { Order } from '../types/database.types';
import { formatCurrency, formatExactDateTime } from './utils';

export type PrintMode = 'bill' | 'kot' | 'both';
export type PaperSize = '80mm' | '58mm';

export interface ThermalPrintOptions {
  order: Order;
  mode: PrintMode;
  paperSize?: PaperSize;
  staffName?: string;
  storeName?: string;
  storePhone?: string;
  storeAddress?: string;
  printTime?: string | Date;
}

/**
 * Generate clean, self-contained HTML for ESC/POS thermal receipt printers.
 * Formatted for 80mm (76mm printable) or 58mm (52mm printable) continuous rolls.
 * High-contrast monochrome black (#000000) styling to prevent thermal pin dithering and blurring.
 * Absolutely NO trailing tear feeds so the hardware cuts exactly at the end marker.
 */
export function generateThermalReceiptHtml({
  order,
  mode,
  paperSize = '80mm',
  staffName = 'Kitchen',
  storeName = 'BRUNCH & CO',
  storePhone = '+92 337 9031611',
  storeAddress = 'Bahria Town Phase 8, Rawalpindi / Islamabad',
  printTime,
}: ThermalPrintOptions): string {
  const is58mm = paperSize === '58mm';
  const printableWidth = is58mm ? '52mm' : '76mm';
  const fontSize = is58mm ? '11px' : '12px';
  const headerFontSize = is58mm ? '16px' : '18px';
  const titleFontSize = is58mm ? '13px' : '14px';

  const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/logo.jpeg` : '/logo.jpeg';

  const customerName = order.customer_name || order.guest_name || 'Walk-in Guest';
  const phone = order.delivery_phone || 'N/A';
  const address = `${order.delivery_address || 'Counter Pickup'}${order.delivery_area ? ' (' + order.delivery_area + ')' : ''}`;

  // Use the computer's current local date & time when printed
  const printDateTime = formatExactDateTime(printTime || new Date());

  // 1. Customer Bill Section
  const billHtml = `
    <div class="ticket bill-ticket">
      <!-- Store Header -->
      <div class="text-center pb-2 mb-2 border-b-dashed">
        <img src="${logoUrl}" alt="Logo" class="logo-img" onerror="this.style.display='none'" />
        <div class="brand-name">${storeName}</div>
        <div class="sub-header font-bold">GOURMET DELIVERY KITCHEN</div>
        <div class="sub-text font-bold">${storeAddress}</div>
        <div class="sub-text font-bold">Tel: ${storePhone}</div>
      </div>

      <!-- Order Metadata -->
      <div class="pb-2 mb-2 border-b-dashed">
        <div class="order-title">
          ORDER #${order.order_number}
        </div>
        <div class="meta-row">
          <span class="meta-label">Date:</span>
          <span class="meta-val font-bold">${printDateTime}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Customer:</span>
          <span class="meta-val font-bold">${customerName}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Phone:</span>
          <span class="meta-val font-bold">${phone}</span>
        </div>
        <div class="meta-row address-row">
          <span class="meta-label">Address:</span>
          <span class="meta-val font-bold">${address}</span>
        </div>
      </div>

      <!-- Items Table -->
      <div class="pb-2 mb-2 border-b-dashed">
        <table class="items-table">
          <thead>
            <tr class="border-b-solid">
              <th style="text-align: left;">ITEM</th>
              <th style="text-align: center; width: 38px;">QTY</th>
              <th style="text-align: right; width: 80px;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr class="item-row">
                <td style="text-align: left;">
                  <div class="item-name">${item.product_name_snapshot}</div>
                  ${item.variant_name ? `<div class="item-sub">Size: ${item.variant_name}</div>` : ''}
                </td>
                <td style="text-align: center; font-weight: 800; white-space: nowrap;">x${item.quantity}</td>
                <td style="text-align: right; font-weight: 800; white-space: nowrap;">${formatCurrency(item.line_total)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div class="pb-2 mb-2 border-b-dashed">
        <div class="flex-between font-bold">
          <span>Subtotal:</span>
          <span>${formatCurrency(order.subtotal)}</span>
        </div>
        ${
          order.discount > 0
            ? `
        <div class="flex-between font-bold">
          <span>Discount:</span>
          <span>-${formatCurrency(order.discount)}</span>
        </div>
        `
            : ''
        }
        ${
          order.delivery_fee > 0
            ? `
        <div class="flex-between font-bold">
          <span>Delivery Fee:</span>
          <span>+${formatCurrency(order.delivery_fee)}</span>
        </div>
        `
            : ''
        }
        ${
          order.service_charges > 0
            ? `
        <div class="flex-between font-bold">
          <span>Service Charges:</span>
          <span>+${formatCurrency(order.service_charges)}</span>
        </div>
        `
            : ''
        }
        <div class="flex-between total-row border-t-solid">
          <span>GRAND TOTAL:</span>
          <span>${formatCurrency(order.total)}</span>
        </div>
      </div>

      <!-- Payment -->
      <div class="payment-box border-solid">
        PAYMENT: <b>${order.payment_method.toUpperCase()}</b> (${order.payment_status.toUpperCase()})
      </div>

      <!-- Footer Message: Exactly where cut happens -->
      <div class="text-center footer-text border-t-dashed">
        Thank you for choosing Brunch & Co!
      </div>
    </div>
  `;

  // 2. Kitchen Order Ticket (KOT) Section
  const kotHtml = `
    <div class="ticket kot-ticket">
      <!-- KOT Header -->
      <div class="text-center pb-2 mb-2 border-b-solid">
        <div class="kot-header">*** KITCHEN TICKET ***</div>
        <div class="kot-order-num">ORDER #${order.order_number}</div>
      </div>

      <!-- KOT Meta -->
      <div class="pb-2 mb-2 border-b-dashed">
        <div class="meta-row">
          <span class="meta-label">TIME:</span>
          <span class="meta-val font-bold">${printDateTime}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">CUSTOMER:</span>
          <span class="meta-val font-bold">${customerName}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">STAFF:</span>
          <span class="meta-val font-bold">${staffName}</span>
        </div>
      </div>

      <!-- KOT Items -->
      <div class="pb-2 mb-2 border-b-solid">
        <div class="flex-between kot-table-head border-b-solid">
          <span style="width: 44px;">QTY</span>
          <span style="flex: 1; text-align: left;">ITEM DESCRIPTION</span>
        </div>
        <div class="kot-items-list">
          ${order.items
            .map(
              (item) => `
            <div class="kot-item-row">
              <div class="kot-qty-badge">${item.quantity}x</div>
              <div class="kot-item-details">
                <div class="kot-item-name">${item.product_name_snapshot.toUpperCase()}</div>
                ${item.variant_name ? `<div class="kot-item-variant">OPTION: ${item.variant_name}</div>` : ''}
                ${item.item_notes ? `<div class="kot-item-note">NOTE: ${item.item_notes}</div>` : ''}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Special Instructions / Notes -->
      ${
        order.notes
          ? `
      <div class="special-instructions border-solid">
        <div class="font-bold">SPECIAL INSTRUCTIONS:</div>
        <div>${order.notes}</div>
      </div>
      `
          : ''
      }

      <!-- KOT End Marker: Exactly where cut happens -->
      <div class="text-center font-bold kot-end border-t-dashed">
        *** END OF KOT ***
      </div>
    </div>
  `;

  // 3. Cut separator when printing Both (strictly within one single continuous page)
  const cutSeparatorHtml = `
    <div class="ticket-cut-separator">
      ----------------- CUT TICKET HERE -----------------
    </div>
  `;

  let contentHtml = '';
  if (mode === 'bill') {
    contentHtml = billHtml;
  } else if (mode === 'kot') {
    contentHtml = kotHtml;
  } else {
    // Both on a single continuous page
    contentHtml = billHtml + cutSeparatorHtml + kotHtml;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Order #${order.order_number} ${mode.toUpperCase()}</title>
  <style>
    @page {
      size: ${paperSize === '58mm' ? '58mm' : '80mm'} auto;
      margin: 0mm !important;
    }
    *, *:before, *:after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: ${paperSize === '58mm' ? '58mm' : '80mm'} !important;
      max-width: ${paperSize === '58mm' ? '58mm' : '80mm'} !important;
      height: auto !important;
      min-height: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
      font-size: ${fontSize};
      font-weight: 600;
      line-height: 1.35;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .print-container {
      width: ${printableWidth};
      max-width: ${printableWidth};
      margin: 0 auto;
      padding: 2mm 1mm 0mm 1mm;
      background: #ffffff;
      color: #000000;
      height: auto !important;
      min-height: 0 !important;
    }
    .ticket {
      width: 100%;
      page-break-inside: auto;
      break-inside: auto;
      margin: 0;
      padding: 0;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 800; }
    .flex-between {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2px;
      width: 100%;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2px;
      width: 100%;
    }
    .meta-label {
      white-space: nowrap !important;
      flex-shrink: 0 !important;
      font-weight: bold;
      margin-right: 6px;
    }
    .meta-val {
      flex: 1;
      text-align: right;
      word-break: break-word;
    }
    .border-b-dashed {
      border-bottom: 1.5px dashed #000000;
      padding-bottom: 4px;
      margin-bottom: 4px;
    }
    .border-t-dashed {
      border-top: 1.5px dashed #000000;
      padding-top: 4px;
      margin-top: 4px;
    }
    .border-b-solid {
      border-bottom: 2px solid #000000;
      padding-bottom: 4px;
      margin-bottom: 4px;
    }
    .border-t-solid {
      border-top: 2px solid #000000;
      padding-top: 4px;
      margin-top: 4px;
    }
    .border-solid {
      border: 1.5px solid #000000;
      padding: 4px;
      margin: 4px 0;
    }
    .logo-img {
      width: 58px;
      height: 58px;
      object-fit: contain;
      display: block;
      margin: 0 auto 3px auto;
      filter: grayscale(100%) contrast(300%) brightness(115%);
      -webkit-filter: grayscale(100%) contrast(300%) brightness(115%);
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
    .brand-name {
      font-size: ${headerFontSize};
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      line-height: 1.1;
      margin-bottom: 2px;
    }
    .sub-header {
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 800;
      margin-bottom: 1px;
    }
    .sub-text {
      font-size: 10px;
      font-weight: bold;
    }
    .order-title {
      font-size: ${titleFontSize};
      font-weight: 900;
      padding-bottom: 2px;
      margin-bottom: 3px;
      border-bottom: 2px solid #000000;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 2px 0;
    }
    .items-table th {
      font-size: 11px;
      font-weight: 900;
      padding: 2px 0;
    }
    .item-row td {
      padding: 3px 0;
      vertical-align: top;
    }
    .item-name {
      font-weight: 800;
      font-size: 11.5px;
      line-height: 1.25;
      word-break: break-word;
    }
    .item-sub {
      font-size: 10px;
      font-weight: bold;
      color: #000000;
    }
    .total-row {
      font-size: ${titleFontSize};
      font-weight: 900;
    }
    .payment-box {
      font-size: 11px;
      text-align: center;
      margin: 4px 0;
      font-weight: 800;
    }
    .footer-text {
      font-size: 11px;
      font-weight: 800;
      margin-top: 4px;
      padding-top: 4px;
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
    }
    /* KOT Specific */
    .kot-header {
      font-size: ${headerFontSize};
      font-weight: 900;
      letter-spacing: 0.5px;
    }
    .kot-order-num {
      font-size: ${titleFontSize};
      font-weight: 900;
      margin-top: 2px;
    }
    .kot-table-head {
      font-weight: 900;
      font-size: 11px;
      padding-bottom: 2px;
    }
    .kot-items-list {
      margin-top: 3px;
    }
    .kot-item-row {
      display: flex;
      align-items: flex-start;
      padding: 4px 0;
      border-bottom: 1.5px dotted #000000;
    }
    .kot-qty-badge {
      font-size: 14px;
      font-weight: 900;
      width: 36px;
      flex-shrink: 0;
    }
    .kot-item-details {
      flex: 1;
    }
    .kot-item-name {
      font-weight: 900;
      font-size: 12.5px;
      line-height: 1.2;
    }
    .kot-item-variant {
      font-size: 10.5px;
      font-weight: bold;
    }
    .kot-item-note {
      font-size: 10.5px;
      font-weight: 900;
      margin-top: 1px;
    }
    .special-instructions {
      font-size: 11px;
      margin: 5px 0;
      font-weight: bold;
    }
    .kot-end {
      font-size: 11px;
      font-weight: 900;
      padding-top: 4px;
      margin-top: 4px;
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
    }
    /* Cut separator strictly within the single page without page break */
    .ticket-cut-separator {
      margin: 6mm 0;
      text-align: center;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.5px;
      page-break-before: avoid !important;
      break-before: avoid !important;
      page-break-after: avoid !important;
      break-after: avoid !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  </style>
</head>
<body>
  <div class="print-container">
    ${contentHtml}
  </div>
</body>
</html>`;
}

/**
 * Executes a standalone print via an isolated invisible iframe.
 * Completely immune to React modal overflow clipping, max-h bounds, and state desyncs.
 */
export function executeThermalPrint({
  order,
  mode,
  paperSize = '80mm',
  staffName = 'Kitchen',
  storeName,
  storePhone,
  storeAddress,
  printTime,
}: ThermalPrintOptions): Promise<void> {
  return new Promise((resolve) => {
    const html = generateThermalReceiptHtml({
      order,
      mode,
      paperSize,
      staffName,
      storeName,
      storePhone,
      storeAddress,
      printTime: printTime || new Date(),
    });

    // Use or create isolated print iframe
    let printFrame = document.getElementById('thermal-pos-isolated-print-frame') as HTMLIFrameElement;
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'thermal-pos-isolated-print-frame';
      printFrame.style.position = 'fixed';
      printFrame.style.top = '-9999px';
      printFrame.style.left = '-9999px';
      printFrame.style.width = '100px';
      printFrame.style.height = '100px';
      printFrame.style.border = '0';
      printFrame.style.zIndex = '-9999';
      document.body.appendChild(printFrame);
    }

    const doc = printFrame.contentWindow?.document;
    if (!doc) {
      window.print();
      resolve();
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    const triggerPrint = () => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (err) {
        console.error('Iframe print failed, falling back to window.print():', err);
        window.print();
      }
      resolve();
    };

    // Wait for logo image or content to finish rendering
    const img = doc.querySelector('img');
    if (img) {
      if (img.complete) {
        setTimeout(triggerPrint, 50);
      } else {
        img.onload = () => setTimeout(triggerPrint, 50);
        img.onerror = () => setTimeout(triggerPrint, 50);
      }
    } else {
      setTimeout(triggerPrint, 60);
    }
  });
}
