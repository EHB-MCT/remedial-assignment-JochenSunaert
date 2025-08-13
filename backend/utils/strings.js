// utils/strings.js
/**
 * String utilities.
 */

/**
 * Strip trailing instance suffix, e.g., "Mortar #1" -> "Mortar".
 * @param {string} name
 * @returns {string}
 */
function stripSuffix(name) {
  return String(name).replace(/\s#\d+$/, '');
}

module.exports = { stripSuffix };
