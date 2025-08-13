/**
 * Small pure helpers used by the UserEconomySettings component.
 */

/**
 * Format integer numbers with thousands separators.
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  return (n ?? 0).toLocaleString();
}

/**
 * Safely parse a UTC timestamp string into a Date object.
 * Returns null if input is falsy or invalid.
 * @param {string|Date|null} ts
 * @returns {Date|null}
 */
export function parseUtc(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
}
