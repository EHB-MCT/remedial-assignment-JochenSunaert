/**
 * Constants for the user economy feature.
 * Keep game rules and caps here so they're easy to tweak and test.
 */

export const RESOURCE_CAP = 24_000_000;
export const GOLD_PRODUCTION_RATE_PER_SECOND = 500;
export const ELIXIR_PRODUCTION_RATE_PER_SECOND = 500;

/**
 * Timezone correction applied for offline-production calculation.
 * If your backend stores timestamps in UTC and the client is in a timezone
 * ahead of UTC (e.g. Europe/Brussels), set this appropriately.
 * Consider making this dynamic in the future (use Intl or server-provided tz).
 */
export const TIMEZONE_OFFSET_HOURS = 2;
