// utils/time.js
/**
 * Time helpers.
 */

/**
 * Apply a positive/negative offset (in seconds) to a base duration (seconds).
 * @param {number} baseSeconds
 * @param {number} offsetSeconds
 * @returns {number}
 */
function applyDurationOffset(baseSeconds, offsetSeconds) {
  const n = Number(baseSeconds) + Number(offsetSeconds || 0);
  return Math.max(0, n);
}

/**
 * Compute a finishesAt Date from a start and a duration in seconds.
 * @param {Date} startedAt
 * @param {number} durationSeconds
 * @returns {Date}
 */
function finishesAtFromSeconds(startedAt, durationSeconds) {
  return new Date(startedAt.getTime() + Number(durationSeconds) * 1000);
}

module.exports = { applyDurationOffset, finishesAtFromSeconds };
