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
 * Format date string for display (e.g., Oct 24, 14:32 or Today, 14:30)
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (isToday) {
    return `Today, ${timeStr}`;
  }

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();

  return `${month} ${day}, ${timeStr}`;
}

/**
 * Class name builder utility
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
