/**
 * Formats monetary amounts in Pakistani Rupees (e.g. Rs 1,200)
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return 'Rs 0';
  const hasDecimals = amount % 1 !== 0;
  const formatted = new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `Rs ${formatted}`;
}

/**
 * Format date string for display with exact date, year, and 12-hour AM/PM time
 * e.g., "15 Aug 2026, 4:32 PM"
 */
export function formatExactDateTime(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = date.getDate();
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

/**
 * Format date string for display (e.g., Oct 24, 14:32 or Today, 14:30)
 */
export function formatDate(dateString: string): string {
  return formatExactDateTime(dateString);
}

/**
 * Class name builder utility
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
