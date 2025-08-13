/**
 * Small utility helpers for the AvailableUpgrades UI.
 * Keep pure functions here so they are easy to test.
 */

/** Apply gold-pass discount (20%) and round up */
export function computeDiscountedValue(originalValue, hasGoldPass) {
  if (!originalValue) return 0;
  return hasGoldPass ? Math.ceil(originalValue * 0.8) : Number(originalValue);
}

/** Format seconds -> H:MM:SS (accepts integer seconds). */
export function formatTimeSeconds(seconds) {
  if (seconds == null) return '0:00:00';
  const s = Math.max(0, Number(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${h}:${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
}

/** Format backend UTC finishes_at to a localized string with timezone */
export function formatFinishTime(utcTimestamp) {
  if (!utcTimestamp) return '';
  const d = new Date(utcTimestamp);
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };
  return d.toLocaleString(undefined, options);
}
