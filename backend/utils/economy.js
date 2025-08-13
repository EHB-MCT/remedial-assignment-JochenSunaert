// utils/economy.js
/**
 * Economy helpers.
 */

/**
 * Compute final cost, applying a 20% discount if user has gold pass.
 * @param {number} baseCost
 * @param {boolean} hasGoldPass
 * @returns {number}
 */
function computeFinalCost(baseCost, hasGoldPass) {
  if (hasGoldPass) return Math.ceil(baseCost * 0.8);
  return baseCost;
}

module.exports = { computeFinalCost };
