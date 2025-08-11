// routes/upgradeRoutes.js

const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');


router.post('/user-economy/start-upgrade', async (req, res) => {
  try {
    const { userId, upgradeId, upgradeLevel, buildCost, buildTimeSeconds } = req.body;

    if (!userId || !upgradeId || !buildCost || !buildTimeSeconds) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // 1. Fetch user economy data (builders_count, gold_amount, has_gold_pass)
    const { data: economy, error: econError } = await supabase
      .from('user_economy')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (econError || !economy) {
      return res.status(404).json({ success: false, error: 'User economy data not found' });
    }

    // 2. Calculate discounted cost if gold pass
    const cost = economy.has_gold_pass ? Math.ceil(buildCost * 0.8) : buildCost;

    // 3. Count ongoing upgrades for user
    const { data: ongoingUpgrades, error: ongoingError } = await supabase
      .from('user_upgrades')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'in_progress');

    if (ongoingError) {
      return res.status(500).json({ success: false, error: ongoingError.message });
    }

    const ongoingCount = ongoingUpgrades ? ongoingUpgrades.length : 0;

    if (ongoingCount >= economy.builders_count) {
      return res.status(400).json({ success: false, error: 'No free builders available' });
    }

    if (economy.gold_amount < cost) {
      return res.status(400).json({ success: false, error: 'Not enough gold' });
    }

    // 4. Deduct gold
    const { error: updateError } = await supabase
      .from('user_economy')
      .update({ gold_amount: economy.gold_amount - cost })
      .eq('user_id', userId);

    if (updateError) {
      return res.status(500).json({ success: false, error: updateError.message });
    }

    // 5. Insert new upgrade entry
    const startedAt = new Date().toISOString();
    const finishesAt = new Date(Date.now() + buildTimeSeconds * 1000).toISOString();

    const { error: insertError } = await supabase
      .from('user_upgrades')
      .insert([{
        user_id: userId,
        defense_id: upgradeId,
        upgrade_level: upgradeLevel,
        started_at: startedAt,
        finishes_at: finishesAt,
        status: 'in_progress',
      }]);

    if (insertError) {
      return res.status(500).json({ success: false, error: insertError.message });
    }

    return res.json({ success: true, message: 'Upgrade started' });

  } catch (err) {
    console.error('Error starting upgrade:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
