const express = require('express');
const router = express.Router();
const supabase = require('../database/supabaseClient');
const { getAvailableUpgrades, getInProgressUpgrades } = require('../controllers/upgradeController');


// Helper function to strip the instance suffix, e.g., "Mortar #1" -> "Mortar"
function stripSuffix(name) {
  return name.replace(/\s#\d+$/, '');
}

router.get('/', getInProgressUpgrades);

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

    // 2. Fetch all possible defense upgrades up to the user's Town Hall level
    const { data: allDefenseUpgrades, error: upgradesError } = await supabase
      .from('defense_upgrades')
      .select('*')
      .lte('unlocks_at_town_hall', townHallLevel);

    if (upgradesError) throw upgradesError;
    
    // 3. Fetch all of the user's currently active upgrades to check for busy defenses
    const { data: userUpgradesData, error: userUpgradesError } = await supabase
      .from('user_upgrades')
      .select('defense_instance_name')
      .eq('user_id', userId)
      .eq('status', 'in_progress');

    if (userUpgradesError) throw userUpgradesError;

    // Create a set for quick lookup of in-progress defense instance names
    const inProgressDefenses = new Set(userUpgradesData.map(u => u.defense_instance_name));

    // Object to hold the final output, keyed by defense instance name
    const finalUpgradesOutput = {};

    // 4. Loop through the user's existing defenses to find their next available upgrade
    for (const defense of baseData) {
      const defenseName = stripSuffix(defense.name);
      
      // Skip this defense if it's currently being upgraded
      if (inProgressDefenses.has(defense.name)) {
        continue;
      }
      
      const nextLevel = defense.current_level + 1;
      
      const upgradeDetails = allDefenseUpgrades.find(upg => 
        upg.defense_name.toLowerCase() === defenseName.toLowerCase() && 
        upg.level === nextLevel
      );
      
      if (upgradeDetails) {
        finalUpgradesOutput[defense.name] = {
          defense_instance: defense.name,
          current_level: defense.current_level,
          available_upgrades: [{
            ...upgradeDetails,
            current_level: defense.current_level,
            status: 'not_started',
          }]
        };
      }
    }

    // 5. Handle brand new defenses that can be built for the first time (level 1)
    const existingDefenseNames = new Set(baseData.map(def => def.name.toLowerCase()));
    
    allDefenseUpgrades.forEach(upg => {
      // Check if it's a level 1 upgrade and the user doesn't have this defense type yet
      const defenseInstanceName = upg.defense_name + ' #1';
      if (upg.level === 1 && !existingDefenseNames.has(defenseInstanceName.toLowerCase())) {
        if (!inProgressDefenses.has(defenseInstanceName)) {
            finalUpgradesOutput[defenseInstanceName] = {
                defense_instance: defenseInstanceName,
                current_level: 0, // A new defense starts at level 0
                available_upgrades: [{
                    ...upg,
                    current_level: 0,
                    status: 'not_started',
                }]
            };
        }
      }
    });

    // Return the values of the object as the final JSON array
    res.json(Object.values(finalUpgradesOutput));
  } catch (err) {
    console.error('Error fetching upgrades:', err.message);
    res.status(500).json({ error: 'Failed to fetch available upgrades' });
  }
});

module.exports = router;
