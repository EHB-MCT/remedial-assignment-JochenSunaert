/**
 * Economy utility routes
 * - Update economy fields
 * - Compute “status” summary (gold/time needed for remaining upgrades)
 */

const express = require('express');
const { supabase } = require('../database/supabaseClient');

const router = express.Router();

/** Strip instance suffix, e.g. "Mortar #1" → "Mortar" */
function stripSuffix(name) {
  return name.replace(/\s#\d+$/, '');
}

/**
 * Update economy fields for a user.
 * @route POST /api/economy/update
 */
router.post('/update', async (req, res) => {
  try {
    const { userId, has_gold_pass, builders_count, gold_amount, elixir_amount } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing user ID' });
    }

    const { data, error } = await supabase
      .from('user_economy')
      .update({
        has_gold_pass,
        builders_count,
        gold_amount,
        elixir_amount,
      })
      .eq('user_id', userId)
      .select();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error updating user economy:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * Economy “status” summary.
 * Computes total gold/time needed to finish all remaining upgrades up to current Town Hall.
 * @route GET /api/economy/status?userId=...
 */
router.get('/status', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    // Economy snapshot
    const { data: userEconomy, error: userError } = await supabase
      .from('user_economy')
      .select('gold_amount, elixir_amount, has_gold_pass, builders_count')
      .eq('user_id', userId)
      .single();
    if (userError || !userEconomy) {
      return res.status(404).json({ error: 'User economy not found' });
    }

    // Base snapshot
    const { data: baseData, error: baseError } = await supabase
      .from('user_base_data')
      .select('name, current_level')
      .eq('user_id', userId);
    if (baseError || !baseData) {
      return res.status(404).json({ error: 'User base data not found' });
    }

    // Town Hall level
    const townHallEntry = baseData.find(def => def.name.toLowerCase().startsWith('town hall'));
    const townHall = townHallEntry?.current_level;
    if (!townHall) {
      return res.status(400).json({ error: 'Town Hall not found in base data' });
    }

    // All unlockable upgrades
    const { data: allUpgrades, error: upgradesError } = await supabase
      .from('defense_upgrades')
      .select('*')
      .lte('unlocks_at_town_hall', townHall);
    if (upgradesError || !allUpgrades) {
      return res.status(500).json({ error: 'Could not fetch upgrades' });
    }

    // Compute remaining upgrades vs current base
    const neededUpgrades = [];
    allUpgrades.forEach(upg => {
      const matchingDefs = baseData.filter(
        def => stripSuffix(def.name).toLowerCase() === upg.defense_name.toLowerCase()
      );

      // No instance yet → only need level 1
      if (matchingDefs.length === 0) {
        if (upg.level === 1) neededUpgrades.push(upg);
        return;
      }

      // Have instances → need any levels above current
      matchingDefs.forEach(def => {
        if (upg.level > def.current_level) neededUpgrades.push(upg);
      });
    });

    // Totals (gold + time)
    const totalGoldNeeded = neededUpgrades.reduce((sum, u) => sum + Number(u.build_cost), 0);
    const totalTimeNeeded = neededUpgrades.reduce((sum, u) => sum + Number(u.build_time_seconds), 0);

    // Apply Gold Pass discount to gold
    const goldPassDiscount = userEconomy.has_gold_pass ? totalGoldNeeded * 0.2 : 0;
    const goldNeededAfterDiscount = totalGoldNeeded - goldPassDiscount;

    res.json({
      gold_amount: userEconomy.gold_amount,
      elixir_amount: userEconomy.elixir_amount,
      has_gold_pass: userEconomy.has_gold_pass,
      builders_count: userEconomy.builders_count || 0,
      total_gold_needed: goldNeededAfterDiscount,
      total_time_seconds: totalTimeNeeded,
    });
  } catch (err) {
    console.error('Error fetching economy status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
