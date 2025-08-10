// economy.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Helper function
function stripSuffix(name) {
  return name.replace(/\s#\d+$/, '');
}

// --- NEW UPDATE ROUTE ---
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
        elixir_amount
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

// --- EXISTING STATUS ROUTE ---
router.get('/status', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    const { data: userEconomy, error: userError } = await supabase
      .from('user_economy')
      .select('gold_amount, elixir_amount, has_gold_pass, builders_count')
      .eq('user_id', userId)
      .single();

    if (userError || !userEconomy) {
      return res.status(404).json({ error: 'User economy not found' });
    }

    const { data: baseData, error: baseError } = await supabase
      .from('user_base_data')
      .select('name, current_level')
      .eq('user_id', userId);

    if (baseError || !baseData) {
      return res.status(404).json({ error: 'User base data not found' });
    }

    const townHallEntry = baseData.find(def => def.name.toLowerCase().startsWith('town hall'));
    const townHall = townHallEntry?.current_level;
    if (!townHall) {
      return res.status(400).json({ error: 'Town Hall not found in base data' });
    }

    const { data: allUpgrades, error: upgradesError } = await supabase
      .from('defense_upgrades')
      .select('*')
      .lte('unlocks_at_town_hall', townHall);

    if (upgradesError || !allUpgrades) {
      return res.status(500).json({ error: 'Could not fetch upgrades' });
    }

    const neededUpgrades = [];
    allUpgrades.forEach(upg => {
      const matchingDefs = baseData.filter(
        def => stripSuffix(def.name).toLowerCase() === upg.defense_name.toLowerCase()
      );

      if (matchingDefs.length === 0) {
        if (upg.level === 1) neededUpgrades.push(upg);
        return;
      }

      matchingDefs.forEach(def => {
        if (upg.level > def.current_level) neededUpgrades.push(upg);
      });
    });

    const totalGoldNeeded = neededUpgrades.reduce((sum, u) => sum + Number(u.build_cost), 0);
    const totalTimeNeeded = neededUpgrades.reduce((sum, u) => sum + Number(u.build_time_seconds), 0);

    const goldPassDiscount = userEconomy.has_gold_pass ? totalGoldNeeded * 0.2 : 0;
    const goldNeededAfterDiscount = totalGoldNeeded - goldPassDiscount;

    res.json({
      gold_amount: userEconomy.gold_amount,
      elixir_amount: userEconomy.elixir_amount,
      has_gold_pass: userEconomy.has_gold_pass,
      builders_count: userEconomy.builders_count || 0,
      total_gold_needed: goldNeededAfterDiscount,
      total_time_seconds: totalTimeNeeded
    });
  } catch (err) {
    console.error('Error fetching economy status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
