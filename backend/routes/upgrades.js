/**
 * Upgrades routes
 * - List in-progress upgrades
 * - List available upgrades (next levels + brand-new placeables)
 */

const express = require('express');
const { supabase } = require('../database/supabaseClient');
const { getInProgressUpgrades } = require('../controllers/upgradeController');

const router = express.Router();

/** Strip instance suffix, e.g. "Mortar #1" → "Mortar" */
function stripSuffix(name) {
  return name.replace(/\s#\d+$/, '');
}

/**
 * List in-progress upgrades for a user.
 * @route GET /api/upgrades?userId=...
 * Delegates to controller (source of truth).
 */
router.get('/', getInProgressUpgrades);

/**
 * Compute available upgrades for a user.
 * Combines:
 *  - current base data
 *  - unlocked upgrades for Town Hall level
 *  - in-progress upgrades (to skip busy defenses)
 * Returns grouped list by defense instance.
 * @route GET /api/upgrades/available?userId=...
 */
router.get('/available', async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  try {
    // 1) Current base snapshot
    const { data: baseData, error: baseError } = await supabase
      .from('user_base_data')
      .select('name, current_level')
      .eq('user_id', userId);

    if (baseError) throw baseError;

    // Town Hall level is used to constrain unlocked upgrades
    const townHallEntry = baseData.find(def => def.name.toLowerCase().startsWith('town hall'));
    const townHallLevel = townHallEntry?.current_level;
    if (!townHallLevel) {
      return res.status(400).json({ error: 'Town Hall not found in base data' });
    }

    // 2) All upgrades user is eligible for
    const { data: allDefenseUpgrades, error: upgradesError } = await supabase
      .from('defense_upgrades')
      .select('*')
      .lte('unlocks_at_town_hall', townHallLevel);
    if (upgradesError) throw upgradesError;

    // 3) In-progress upgrades (to mark busy instances)
    const { data: userUpgradesData, error: userUpgradesError } = await supabase
      .from('user_upgrades')
      .select('defense_instance_name')
      .eq('user_id', userId)
      .eq('status', 'in_progress');
    if (userUpgradesError) throw userUpgradesError;

    const inProgressDefenses = new Set(userUpgradesData.map(u => u.defense_instance_name));

    // 4) Build response object keyed by instance
    const finalUpgradesOutput = {};

    // Existing instances → next level
    for (const defense of baseData) {
      const defenseName = stripSuffix(defense.name);

      // Skip if currently upgrading
      if (inProgressDefenses.has(defense.name)) continue;

      const nextLevel = defense.current_level + 1;
      const upgradeDetails = allDefenseUpgrades.find(
        upg =>
          upg.defense_name.toLowerCase() === defenseName.toLowerCase() &&
          upg.level === nextLevel
      );

      if (upgradeDetails) {
        finalUpgradesOutput[defense.name] = {
          defense_instance: defense.name,
          current_level: defense.current_level,
          available_upgrades: [
            {
              ...upgradeDetails,
              current_level: defense.current_level,
              status: 'not_started',
            },
          ],
        };
      }
    }

    // New instances → level 1
    const existingDefenseNames = new Set(baseData.map(def => def.name.toLowerCase()));
    allDefenseUpgrades.forEach(upg => {
      const defenseInstanceName = `${upg.defense_name} #1`;
      const isFirstLevel = upg.level === 1;
      const notOwned = !existingDefenseNames.has(defenseInstanceName.toLowerCase());
      const notBusy = !inProgressDefenses.has(defenseInstanceName);

      if (isFirstLevel && notOwned && notBusy) {
        finalUpgradesOutput[defenseInstanceName] = {
          defense_instance: defenseInstanceName,
          current_level: 0,
          available_upgrades: [
            {
              ...upg,
              current_level: 0,
              status: 'not_started',
            },
          ],
        };
      }
    });

    // Return array
    res.json(Object.values(finalUpgradesOutput));
  } catch (err) {
    console.error('Error fetching upgrades:', err.message);
    res.status(500).json({ error: 'Failed to fetch available upgrades' });
  }
});

module.exports = router;
