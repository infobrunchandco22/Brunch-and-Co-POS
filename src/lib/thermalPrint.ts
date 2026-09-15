import { Order } from '../types/database.types';
import { formatCurrency, formatExactDateTime } from './utils';

export type PrintMode = 'bill' | 'kot' | 'both';
export type PaperSize = '80mm' | '58mm';

export interface ThermalPrintOptions {
  order: Order;
  mode: PrintMode;
  paperSize?: PaperSize;
  staffName?: string;
}

/**
 * Generate clean, self-contained HTML for ESC/POS thermal receipt printers.
 * Strictly formatted for 80mm (76mm printable) or 58mm (52mm printable) paper rolls.
 * Uses 1-bit monochrome black (#000000) styling to prevent thermal pin dithering.
 */
export function generateThermalReceiptHtml({
  order,
  mode,
  paperSize = '80mm',
  staffName = 'Kitchen',
}: ThermalPrintOptions): string {
  const is58mm = paperSize === '58mm';
  const widthMm = is58mm ? 52 : 76;
  const fontSize = is58mm ? '11px' : '12px';
  const headerFontSize = is58mm ? '16px' : '18px';
  const titleFontSize = is58mm ? '13px' : '14px';

  const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/logo.jpeg` : '/logo.jpeg';

  const customerName = order.customer_name || order.guest_name || 'Walk-in Guest';
  const phone = order.delivery_phone || 'N/A';
  const address = `${order.delivery_address || 'Counter Pickup'}${order.delivery_area ? ' (' + order.delivery_area + ')' : ''}`;

  // 1. Customer Bill Section
  const billHtml = `
    <div class="ticket bill-ticket">
      <!-- Store Header -->
      <div class="text-center pb-2 mb-2 border-b-dashed">
        <img src="${logoUrl}" alt="Logo" class="logo-img" onerror="this.style.display='none'" />
        <div class="brand-name">BRUNCH & CO</div>
        <div class="sub-header font-mono">Gourmet Delivery Kitchen</div>
        <div class="sub-text">F-7 Markaz, Islamabad</div>
        <div class="sub-text">Tel: +92 (51) 234-5678</div>
      </div>

      <!-- Order Metadata -->
      <div class="pb-2 mb-2 border-b-dashed">
        <div class="flex-between order-title">
          <span>ORDER #${order.order_number}</span>
        </div>
        <div class="flex-between">
          <span class="text-muted">Date:</span>
          <span>${formatExactDateTime(order.created_at)}</span>
        </div>
        <div class="flex-between">
          <span class="text-muted">Customer:</span>
          <span class="font-bold">${customerName}</span>
        </div>
        <div class="flex-between">
          <span class="text-muted">Phone:</span>
          <span>${phone}</span>
        </div>
        <div class="flex-between address-row">
          <span class="text-muted">Address:</span>
          <span class="font-bold text-right">${address}</span>
        </div>
      </div>

      <!-- Items Table -->
      <div class="pb-2 mb-2 border-b-dashed">
        <table class="items-table">
          <thead>
            <tr class="border-b-solid">
              <th style="text-align: left;">ITEM</th>
              <th style="text-align: center; width: 36px;">QTY</th>
              <th style="text-align: right; width: 75px;">TOTAL</th>
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
                <td style="text-align: center; font-weight: bold; white-space: nowrap;">x${item.quantity}</td>
                <td style="text-align: right; font-weight: bold; white-space: nowrap;">${formatCurrency(item.line_total)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div class="pb-2 mb-2 border-b-dashed">
        <div class="flex-between">
          <span>Subtotal:</span>
          <span class="font-bold">${formatCurrency(order.subtotal)}</span>
        </div>
        ${
          order.discount > 0
            ? `
        <div class="flex-between">
          <span>Discount:</span>
          <span class="font-bold">-${formatCurrency(order.discount)}</span>
        </div>
        `
            : ''
        }
        ${
          order.delivery_fee > 0
            ? `
        <div class="flex-between">
          <span>Delivery Fee:</span>
          <span class="font-bold">+${formatCurrency(order.delivery_fee)}</span>
        </div>
        `
            : ''
        }
        ${
          order.service_charges > 0
            ? `
        <div class="flex-between">
          <span>Service Charges:</span>
          <span class="font-bold">+${formatCurrency(order.service_charges)}</span>
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

      <!-- Footer Message -->
      <div class="text-center footer-text border-t-dashed">
        <p>Thank you for choosing Brunch & Co!</p>
      </div>

      <!-- Clearance feed for manual or auto tear-bar -->
      <div class="tear-feed"></div>
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
        <div class="flex-between">
          <span>TIME:</span>
          <span class="font-bold">${formatExactDateTime(order.created_at)}</span>
        </div>
        <div class="flex-between">
          <span>CUSTOMER:</span>
          <span class="font-bold">${customerName}</span>
        </div>
        <div class="flex-between">
          <span>STAFF:</span>
          <span class="font-bold">${staffName}</span>
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

      <!-- KOT End Marker -->
      <div class="text-center font-bold kot-end border-t-dashed">
        *** END OF KOT ***
      </div>

      <!-- Clearance feed for manual or auto tear-bar -->
      <div class="tear-feed"></div>
    </div>
  `;

  // 3. Cut separator when printing Both
  const cutSeparatorHtml = `
    <div class="ticket-cut-separator">
      <span>----------------- CUT TICKET HERE -----------------</span>
    </div>
  `;

  let contentHtml = '';
  if (mode === 'bill') {
    contentHtml = billHtml;
  } else if (mode === 'kot') {
    contentHtml = kotHtml;
  } else {
    contentHtml = billHtml + cutSeparatorHtml + kotHtml;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Order #${order.order_number} ${mode.toUpperCase()}</title>
  <style>
    @page {
      margin: 0mm !important;
      size: auto !important;
    }
    *, *:before, *:after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: 'Courier New', Courier, 'JetBrains Mono', monospace !important;
      font-size: ${fontSize};
      line-height: 1.35;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .print-container {
      width: ${paperSize === '58mm' ? '48mm' : '72mm'};
      max-width: ${paperSize === '58mm' ? '48mm' : '72mm'};
      margin: 0 auto;
      padding: 2mm 1mm 6mm 1mm;
      background: #fff;
      color: #000000;
    }
    .ticket {
      width: 100%;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .font-mono { font-family: inherit; }
    .text-muted { color: #000000; }
    .flex-between {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2px;
    }
    .address-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      word-break: break-word;
    }
    .border-b-dashed {
      border-bottom: 1px dashed #000000;
      padding-bottom: 4px;
      margin-bottom: 4px;
    }
    .border-t-dashed {
      border-top: 1px dashed #000000;
      padding-top: 4px;
      margin-top: 4px;
    }
    .border-b-solid {
      border-bottom: 1.5px solid #000000;
      padding-bottom: 4px;
      margin-bottom: 4px;
    }
    .border-t-solid {
      border-top: 1.5px solid #000000;
      padding-top: 4px;
      margin-top: 4px;
    }
    .border-solid {
      border: 1px solid #000000;
      padding: 4px;
      margin: 4px 0;
    }
    .logo-img {
      width: 54px;
      height: 54px;
      object-fit: contain;
      display: block;
      margin: 0 auto 4px auto;
    }
    .brand-name {
      font-size: ${headerFontSize};
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .sub-header {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .sub-text {
      font-size: 9.5px;
    }
    .order-title {
      font-size: ${titleFontSize};
      font-weight: 900;
      padding-bottom: 2px;
      margin-bottom: 3px;
      border-bottom: 1px solid #000000;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 2px 0;
    }
    .items-table th {
      font-size: 10.5px;
      padding: 2px 0;
    }
    .item-row td {
      padding: 3px 0;
      vertical-align: top;
    }
    .item-name {
      font-weight: 600;
      line-height: 1.25;
      word-break: break-word;
    }
    .item-sub {
      font-size: 9.5px;
      color: #000000;
    }
    .total-row {
      font-size: ${titleFontSize};
      font-weight: 900;
    }
    .payment-box {
      font-size: 10.5px;
      text-align: center;
      margin: 5px 0;
      font-weight: bold;
    }
    .footer-text {
      font-size: 10px;
      margin-top: 4px;
      font-weight: bold;
    }
    /* KOT Specific */
    .kot-header {
      font-size: ${headerFontSize};
      font-weight: 900;
      letter-spacing: 1px;
    }
    .kot-order-num {
      font-size: ${titleFontSize};
      font-weight: bold;
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
      padding: 3px 0;
      border-bottom: 1px dotted #000000;
    }
    .kot-qty-badge {
      font-size: 14px;
      font-weight: 900;
      width: 34px;
      shrink: 0;
    }
    .kot-item-details {
      flex: 1;
    }
    .kot-item-name {
      font-weight: 900;
      font-size: 12px;
      line-height: 1.2;
    }
    .kot-item-variant {
      font-size: 10px;
      font-weight: bold;
    }
    .kot-item-note {
      font-size: 10px;
      font-weight: bold;
      margin-top: 1px;
    }
    .special-instructions {
      font-size: 10.5px;
      margin: 6px 0;
    }
    .kot-end {
      font-size: 10.5px;
      padding-top: 4px;
      margin-top: 6px;
    }
    .ticket-cut-separator {
      margin: 10mm 0;
      text-align: center;
      font-size: 9.5px;
      font-weight: bold;
      page-break-before: always;
      break-before: page;
    }
    .tear-feed {
      height: 12mm;
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
}: ThermalPrintOptions): Promise<void> {
  return new Promise((resolve) => {
    const html = generateThermalReceiptHtml({ order, mode, paperSize, staffName });

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
    if (img && !img.complete) {
      img.onload = () => setTimeout(triggerPrint, 50);
      img.onerror = () => setTimeout(triggerPrint, 50);
    } else {
      setTimeout(triggerPrint, 60);
    }
  });
}
