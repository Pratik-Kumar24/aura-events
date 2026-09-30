/**
 * Formats a monetary amount into Indian Rupee (₹) convention.
 * Supports compact formatting (e.g. ₹85.0 L, ₹1.50 Cr, ₹85k) or full formatted string (e.g. ₹85,00,000).
 */
export function formatINR(amount: number, compact = false): string {
  if (compact) {
    const abs = Math.abs(amount);
    if (abs >= 10000000) {
      const cr = (amount / 10000000).toFixed(2);
      return `₹${cr.replace(/\.00$/, "")} Cr`;
    }
    if (abs >= 100000) {
      const lakh = (amount / 100000).toFixed(1);
      return `₹${lakh.replace(/\.0$/, "")} L`;
    }
    if (abs >= 1000) {
      const k = (amount / 1000).toFixed(0);
      return `₹${k}k`;
    }
  }
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}
