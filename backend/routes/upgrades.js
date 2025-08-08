// backend/routes/upgrades.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Helper: strip suffix like ' #1' from name
function stripSuffix(name) {
  return name.replace(/\s#\d+$/, '');
}

router.get('/available', async (req, res) => {
  const userId = req.query.userId; // or use req.user.id if you use auth middleware

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  try {
    // Step 1: Get user's base data
    const { data: baseData, error: baseError } = await supabase
      .from('user_base_data')
      .select('name, current_level')
      .eq('user_id', userId);

    if (baseError) throw baseError;

    // Find Town Hall entry by matching name that starts with "Town Hall"
    const townHallEntry = baseData.find(def => def.name.toLowerCase().startsWith('town hall'));
    const townHall = townHallEntry?.current_level;

    if (!townHall) {
      return res.status(400).json({ error: 'Town Hall not found in base data' });
    }

    // Step 2: Get all upgrades up to user's Town Hall level
    const { data: allUpgrades, error: upgradesError } = await supabase
      .from('defense_upgrades')
      .select('*')
      .lte('unlocks_at_town_hall', townHall);

    if (upgradesError) throw upgradesError;

    // Step 3: Determine which upgrades are available (consider multiple instances)
    const availableUpgrades = [];

    allUpgrades.forEach(upg => {
      // Get all player's defenses matching this defense_name (strip suffix)
      const playerDefs = baseData.filter(def => stripSuffix(def.name) === upg.defense_name);

      if (playerDefs.length === 0) {
        // Player has no instance of this defense, so show level 1 upgrade only
        if (upg.level === 1) {
          availableUpgrades.push(upg);
        }
        return;
      }

      // For each defense instance, check if this upgrade is next level for that instance
      playerDefs.forEach(def => {
        if (upg.level === def.current_level + 1) {
          availableUpgrades.push(upg);
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
