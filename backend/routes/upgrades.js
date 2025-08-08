// backend/routes/upgrades.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

function stripSuffix(name) {
  return name.replace(/\s#\d+$/, '');
}

router.get('/available', async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  try {
    // 1. Get user's base data (defense instances and levels)
    const { data: baseData, error: baseError } = await supabase
      .from('user_base_data')
      .select('name, current_level')
      .eq('user_id', userId);

    if (baseError) throw baseError;

    // 2. Find Town Hall level for filtering upgrades
    const townHallEntry = baseData.find(def => def.name.toLowerCase().startsWith('town hall'));
    const townHall = townHallEntry?.current_level;

    if (!townHall) {
      return res.status(400).json({ error: 'Town Hall not found in base data' });
    }

    // 3. Get all upgrades up to user's Town Hall level
    const { data: allUpgrades, error: upgradesError } = await supabase
      .from('defense_upgrades')
      .select('*')
      .lte('unlocks_at_town_hall', townHall);

    if (upgradesError) throw upgradesError;

    const availableUpgrades = [];

    // 4. For each upgrade, find matching defenses and check all levels above current_level
    allUpgrades.forEach(upg => {
      // Matching defenses for this upgrade's base name (case-insensitive)
      const matchingDefs = baseData.filter(def => stripSuffix(def.name).toLowerCase() === upg.defense_name.toLowerCase());

      if (matchingDefs.length === 0) {
        // User has no instance of this defense, so only show level 1 upgrades (new defense)
        if (upg.level === 1) {
          availableUpgrades.push({
            ...upg,
            defense_instance: null,
            current_level: 0
          });
        }
        return;
      }

      matchingDefs.forEach(def => {
        // Instead of only checking next level, add upgrades for all levels above current_level, including this upg.level
        // So push this upgrade if upg.level > def.current_level
        if (upg.level > def.current_level) {
          availableUpgrades.push({
            ...upg,
            defense_instance: def.name,
            current_level: def.current_level
          });
        }
      });
    });

    res.json(availableUpgrades);

  } catch (err) {
    console.error('Error fetching upgrades:', err.message);
    res.status(500).json({ error: 'Failed to fetch available upgrades' });
  }
});

module.exports = router;
