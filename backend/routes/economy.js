const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

function stripSuffix(name) {
  return name.replace(/\s#\d+$/, '');
}

router.get('/status', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    // 1. Get user's economy data
    const { data: userEconomy, error: userError } = await supabase
      .from('user_economy')
      .select('gold_amount, elixir_amount, has_gold_pass')
      .eq('user_id', userId)
      .single();

    if (userError || !userEconomy) {
      return res.status(404).json({ error: 'User economy not found' });
    }

    // 2. Get user's base data (defenses and levels)
    const { data: baseData, error: baseError } = await supabase
      .from('user_base_data')
      .select('name, current_level')
      .eq('user_id', userId);

    if (baseError || !baseData) {
      return res.status(404).json({ error: 'User base data not found' });
    }

    // 3. Find Town Hall level
    const townHallEntry = baseData.find(def => def.name.toLowerCase().startsWith('town hall'));
    const townHall = townHallEntry?.current_level;
    if (!townHall) {
      return res.status(400).json({ error: 'Town Hall not found in base data' });
    }

    // 4. Get all upgrades up to Town Hall level
    const { data: allUpgrades, error: upgradesError } = await supabase
      .from('defense_upgrades')
      .select('*')
      .lte('unlocks_at_town_hall', townHall);

    if (upgradesError || !allUpgrades) {
      return res.status(500).json({ error: 'Could not fetch upgrades' });
    }

    // 5. Filter only upgrades the user still needs, like in your upgrades.js logic
    const neededUpgrades = [];

    allUpgrades.forEach(upg => {
      // Find user's defenses matching this upgrade base name
      const matchingDefs = baseData.filter(def => stripSuffix(def.name).toLowerCase() === upg.defense_name.toLowerCase());

      if (matchingDefs.length === 0) {
        // User doesn't have this defense yet, add level 1 upgrade only
        if (upg.level === 1) {
          neededUpgrades.push(upg);
        }
        return;
      }

      matchingDefs.forEach(def => {
        // Add upgrade if level is above user's current defense level
        if (upg.level > def.current_level) {
          neededUpgrades.push(upg);
        }
      });
    });

    // 6. Sum gold and time for needed upgrades only
    const totalGoldNeeded = neededUpgrades.reduce((sum, u) => sum + Number(u.build_cost), 0);
    const totalTimeNeeded = neededUpgrades.reduce((sum, u) => sum + Number(u.build_time_seconds), 0);

    // 7. Apply gold pass discount
    const goldPassDiscount = userEconomy.has_gold_pass ? totalGoldNeeded * 0.2 : 0;
    const goldNeededAfterDiscount = totalGoldNeeded - goldPassDiscount;

    // 8. Return economy info with filtered sums
    res.json({
      gold_amount: userEconomy.gold_amount,
      elixir_amount: userEconomy.elixir_amount,
      has_gold_pass: userEconomy.has_gold_pass,
      total_gold_needed: goldNeededAfterDiscount,
      total_time_seconds: totalTimeNeeded
    });

  } catch (err) {
    console.error('Error fetching economy status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
