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
    const townHall = townHallEntry?.current_level;

    if (!townHall) {
      return res.status(400).json({ error: 'Town Hall not found in base data' });
    }

    // 2. Fetch all possible upgrades available up to the user's Town Hall level
    const { data: allUpgrades, error: upgradesError } = await supabase
      .from('defense_upgrades')
      .select('*')
      .lte('unlocks_at_town_hall', townHall);

    if (upgradesError) throw upgradesError;

    // 3. Fetch all of the user's currently active upgrades, including the defense_instance_name
    const { data: userUpgradesData, error: userUpgradesError } = await supabase
      .from('user_upgrades')
      .select('defense_id, upgrade_level, started_at, finishes_at, status, defense_instance_name')
      .eq('user_id', userId);

    if (userUpgradesError) throw userUpgradesError;

    // Create a map for quick lookup of in-progress upgrades by their instance name
    const inProgressUpgrades = new Map(
      userUpgradesData.filter(u => u.status === 'in_progress')
        .map(u => [u.defense_instance_name, u])
    );

    // Object to hold the final output, keyed by defense instance name
    const finalUpgradesOutput = {};

    // First, process all existing defenses
    baseData.forEach(def => {
      const defenseNameWithoutSuffix = stripSuffix(def.name);
      
      const inProgressUpgrade = inProgressUpgrades.get(def.name);

      if (inProgressUpgrade) {
        // If an upgrade is in progress for this specific instance, find its details from allUpgrades
        const upgradeDetails = allUpgrades.find(upg => upg.id === inProgressUpgrade.defense_id);
        if (upgradeDetails) {
          finalUpgradesOutput[def.name] = {
            defense_instance: def.name,
            current_level: def.current_level,
            available_upgrades: [{
              ...upgradeDetails,
              current_level: def.current_level,
              started_at: inProgressUpgrade.started_at,
              finishes_at: inProgressUpgrade.finishes_at,
              status: inProgressUpgrade.status,
            }]
          };
        }
      } else {
        // If no upgrade is in progress, find all available upgrades for this defense instance
        const availableForThisDefense = allUpgrades.filter(upg =>
          upg.defense_name.toLowerCase() === defenseNameWithoutSuffix.toLowerCase() && upg.level > def.current_level
        );

        if (availableForThisDefense.length > 0) {
          finalUpgradesOutput[def.name] = {
            defense_instance: def.name,
            current_level: def.current_level,
            available_upgrades: availableForThisDefense.map(upg => ({
              ...upg,
              current_level: def.current_level,
              started_at: null,
              finishes_at: null,
              status: 'not_started',
            }))
          };
        }
      }
    });

    // Finally, handle brand new defenses that can be built (Level 1)
    const existingDefenseTypes = new Set(baseData.map(def => stripSuffix(def.name).toLowerCase()));
    
    allUpgrades.forEach(upg => {
      // Check if it's a level 1 upgrade and the user doesn't have this defense type yet
      if (upg.level === 1 && !existingDefenseTypes.has(upg.defense_name.toLowerCase())) {
        const defenseInstanceName = upg.defense_name; // Use the defense name as the instance name for new builds
        const inProgressUpgrade = inProgressUpgrades.get(defenseInstanceName);
        
        if (inProgressUpgrade) {
            // New defense is in progress of being built
            const upgradeDetails = allUpgrades.find(u => u.id === inProgressUpgrade.defense_id);
            if (upgradeDetails) {
                finalUpgradesOutput[defenseInstanceName] = {
                    defense_instance: defenseInstanceName,
                    current_level: 0,
                    available_upgrades: [{
                        ...upgradeDetails,
                        current_level: 0,
                        started_at: inProgressUpgrade.started_at,
                        finishes_at: inProgressUpgrade.finishes_at,
                        status: inProgressUpgrade.status,
                    }]
                };
            }
        } else if (!finalUpgradesOutput[defenseInstanceName]) {
            // New defense is not in progress, and we haven't added it yet
            finalUpgradesOutput[defenseInstanceName] = {
                defense_instance: defenseInstanceName,
                current_level: 0,
                available_upgrades: [{
                    ...upg,
                    current_level: 0,
                    started_at: null,
                    finishes_at: null,
                    status: 'not_started',
                }]
            };
        }
      }
    });

    // Send the values of the object as the final JSON array
    res.json(Object.values(finalUpgradesOutput));
  } catch (err) {
    console.error('Error fetching upgrades:', err.message);
    res.status(500).json({ error: 'Failed to fetch available upgrades' });
  }
});

module.exports = router;
