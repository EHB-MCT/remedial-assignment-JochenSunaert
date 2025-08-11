const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Helper function to strip the instance suffix, e.g., "Mortar #1" -> "Mortar"
function stripSuffix(name) {
  return name.replace(/\s#\d+$/, '');
}

router.get('/available', async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  try {
    // 1. Fetch the user's current defenses and their levels
    const { data: baseData, error: baseError } = await supabase
      .from('user_base_data')
      .select('name, current_level')
      .eq('user_id', userId);

    if (baseError) throw baseError;

    const townHallEntry = baseData.find(def => def.name.toLowerCase().startsWith('town hall'));
    const townHallLevel = townHallEntry?.current_level;

    if (!townHallLevel) {
      return res.status(400).json({ error: 'Town Hall not found in base data' });
    }

    // 2. Fetch all possible defense upgrades, we'll filter this list later
    const { data: allDefenseUpgrades, error: upgradesError } = await supabase
      .from('defense_upgrades')
      .select('*');

    if (upgradesError) throw upgradesError;
    
    const availableUpgradesList = [];

    // 3. Loop through the user's existing defenses to find their next upgrade
    for (const defense of baseData) {
        // Strip the suffix to find the general defense name (e.g., "Wizard Tower")
        const defenseName = stripSuffix(defense.name);
        
        // Find the next available upgrade level
        const nextLevel = defense.current_level + 1;
        
        // Find the upgrade details for the next level that is unlocked by the user's Town Hall
        const upgradeDetails = allDefenseUpgrades.find(upg => 
            upg.defense_name === defenseName && 
            upg.level === nextLevel && 
            upg.unlocks_at_town_hall <= townHallLevel
        );
        
        // If an upgrade exists, add it to our list
        if (upgradeDetails) {
            availableUpgradesList.push({
                defense_instance: defense.name,
                current_level: defense.current_level,
                available_upgrades: [{
                    ...upgradeDetails,
                    current_level: defense.current_level,
                    status: 'not_started',
                }]
            });
        }
    }

    // Return the list of found upgrades
    res.json(availableUpgradesList);
  } catch (err) {
    console.error('Error fetching upgrades:', err.message);
    res.status(500).json({ error: 'Failed to fetch available upgrades' });
  }
});

module.exports = router;
