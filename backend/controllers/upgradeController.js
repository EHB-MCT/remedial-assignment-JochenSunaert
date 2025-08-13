// controllers/upgradeController.js
/**
 * Upgrade Controller
 * Maps HTTP requests/responses to service calls.
 * Keep this layer thin and free of business logic.
 */

const upgradeService = require('../services/upgradeService');

/**
 * POST /api/user-economy/start-upgrade
 */
async function startUpgrade(req, res) {
  try {
    const { userId, upgradeId, upgradeLevel, defenseInstanceName } = req.body;
    if (!userId || !upgradeId || !upgradeLevel || !defenseInstanceName) {
      return res.status(400).json({ success: false, error: 'Missing required fields for upgrade.' });
    }

    await upgradeService.startUpgrade({ userId, upgradeId, upgradeLevel, defenseInstanceName });
    return res.json({ success: true, message: `Upgrade for ${defenseInstanceName} started successfully.` });
  } catch (err) {
    console.error('[CTRL] Error starting upgrade:', err);
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, error: err.publicMessage || 'Internal server error.' });
  }
}

/**
 * GET /api/upgrades/in-progress?userId=...
 */
async function getInProgressUpgrades(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID is required.' });

    const upgrades = await upgradeService.getInProgressUpgrades(userId);
    return res.json(upgrades);
  } catch (err) {
    console.error('[CTRL] Error fetching in-progress upgrades:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}

/**
 * POST /api/user-economy/complete-upgrade
 */
async function completeUpgrade(req, res) {
  try {
    const { userId, upgradeId, defenseInstanceName, targetLevel } = req.body;
    if (!userId || !upgradeId || !defenseInstanceName || !targetLevel) {
      return res.status(400).json({ success: false, error: 'Missing required fields for upgrade completion.' });
    }

    const msg = await upgradeService.completeUpgrade({ userId, upgradeId, defenseInstanceName, targetLevel });
    return res.json({ success: true, message: msg });
  } catch (err) {
    console.error('[CTRL] Error completing upgrade:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}

/**
 * GET /api/upgrades/available?userId=...
 */
async function getAvailableUpgrades(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID is required.' });

    const list = await upgradeService.getAvailableUpgrades(userId);
    return res.json(list);
  } catch (err) {
    console.error('[CTRL] Error fetching available upgrades:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}

module.exports = {
  startUpgrade,
  getInProgressUpgrades,
  completeUpgrade,
  getAvailableUpgrades,
};
