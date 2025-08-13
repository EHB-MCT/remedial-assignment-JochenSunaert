/**
 * User economy routes
 * - Read/update user economy (gold, elixir, builders, gold pass)
 * - Delegate upgrade start/completion to upgradeController
 */

const express = require('express');
const { supabase } = require('../database/supabaseClient');
const { startUpgrade, completeUpgrade } = require('../controllers/upgradeController');

const router = express.Router();

/**
 * Start an upgrade.
 * Delegates to controller which performs:
 * - validations
 * - builder availability check
 * - resource deduction
 * - user_upgrades insert
 * @route POST /api/user-economy/start-upgrade
 */
router.post('/start-upgrade', startUpgrade);

/**
 * Complete an upgrade.
 * Delegates to controller which performs:
 * - user_upgrades delete (by id)
 * - user_base_data insert/update to target level
 * @route POST /api/user-economy/complete
 */
router.post('/complete', completeUpgrade);

/**
 * Get economy snapshot for a user.
 * @route GET /api/user-economy/:userId
 * @param {string} userId - Path param (supabase user id)
 */
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from('user_economy')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
  res.json(data);
});

/**
 * Update economy fields.
 * Accepts partial/full updates for: has_gold_pass, builders_count, gold_amount, elixir_amount
 * @route POST /api/user-economy/update
 */
router.post('/update', async (req, res) => {
  const { userId, has_gold_pass, builders_count, gold_amount, elixir_amount } = req.body;

  const { error } = await supabase
    .from('user_economy')
    .update({
      has_gold_pass,
      builders_count,
      gold_amount,
      elixir_amount,
    })
    .eq('user_id', userId);

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
  res.json({ success: true });
});

/**
 * Alias for updating economy status (same as /update).
 * Consider consolidating to avoid duplication.
 * @route POST /api/user-economy/status
 */
router.post('/status', async (req, res) => {
  const { userId, has_gold_pass, builders_count, gold_amount, elixir_amount } = req.body;

  const { error } = await supabase
    .from('user_economy')
    .update({
      has_gold_pass,
      builders_count,
      gold_amount,
      elixir_amount,
    })
    .eq('user_id', userId);

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
  res.json({ success: true });
});

module.exports = router;
