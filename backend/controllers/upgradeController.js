const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Handles the instant upgrade of a defense, including creating a new one if it doesn't exist.
 */
async function startUpgrade(req, res) {
    try {
        const { userId, upgradeId, upgradeLevel, buildCost, defenseInstanceName } = req.body;

        if (!userId || !upgradeId || !upgradeLevel || !buildCost || !defenseInstanceName) {
            return res.status(400).json({ success: false, error: "Missing required fields for upgrade." });
        }

        // Fetch user economy to check resources
        const { data: economyData, error: economyError } = await supabase
            .from('user_economy')
            .select('gold_amount, has_gold_pass')
            .eq('user_id', userId)
            .single();

        if (economyError) throw economyError;
        if (!economyData) return res.status(404).json({ success: false, error: 'User economy data not found.' });

        // Apply gold pass discount if applicable
        const finalCost = economyData.has_gold_pass
            ? Math.ceil(buildCost * 0.8)
            : buildCost;

        // Check if the user has enough resources
        if (economyData.gold_amount < finalCost) {
            return res.status(409).json({ success: false, error: 'Not enough gold to start upgrade.' });
        }

        // Deduct gold and update economy
        const { error: resourceUpdateError } = await supabase
            .from('user_economy')
            .update({ gold_amount: economyData.gold_amount - finalCost })
            .eq('user_id', userId);

        if (resourceUpdateError) throw resourceUpdateError;

        // Check if the defense instance already exists in the user's base
        const { data: existingDefense, error: existingError } = await supabase
            .from('user_base_data')
            .select('id')
            .eq('user_id', userId)
            .eq('name', defenseInstanceName)
            .single();

        if (existingError && existingError.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error("Error checking for existing defense:", existingError);
            return res.status(500).json({ success: false, error: "Failed to check for defense." });
        }
        
        let updateBaseError;
        if (existingDefense) {
            // Defense exists, so update its level
            const { error } = await supabase
                .from('user_base_data')
                .update({ current_level: upgradeLevel })
                .eq('id', existingDefense.id);
            updateBaseError = error;
        } else {
            // Defense does not exist, so insert a new row for it
            const { error } = await supabase
                .from('user_base_data')
                .insert({
                    user_id: userId,
                    name: defenseInstanceName,
                    current_level: upgradeLevel
                });
            updateBaseError = error;
        }

        if (updateBaseError) {
            console.error("Update/Insert base data error:", updateBaseError);
            return res.status(500).json({ success: false, error: "Failed to update defense level." });
        }
        
        console.log(`Successfully upgraded/created ${defenseInstanceName} to level ${upgradeLevel}.`);
        return res.json({ success: true, message: `Upgrade to ${defenseInstanceName} level ${upgradeLevel} finished successfully.` });

    } catch (err) {
        console.error("Error starting upgrade:", err.message);
        return res.status(500).json({ success: false, error: "Internal server error." });
    }
}

// Helper function to strip the instance suffix, e.g., "Mortar #1" -> "Mortar"
function stripSuffix(name) {
  return name.replace(/\s#\d+$/, '');
}

async function getAvailableUpgrades(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required.' });
    }

    // 1. Get user's Town Hall level
    const { data: townHallData, error: townHallError } = await supabase
        .from('user_base_data')
        .select('current_level')
        .eq('user_id', userId)
        .eq('name', 'Town Hall')
        .single();
    
    if (townHallError || !townHallData) {
        return res.status(404).json({ success: false, error: 'Town Hall data not found.' });
    }
    const townHallLevel = townHallData.current_level;

    // 2. Get all defense upgrades and their placement limits up to the user's Town Hall level
    const { data: allDefenses, error: defensesError } = await supabase
        .from('defenses')
        .select('*')
        .lte('max_per_town_hall', townHallLevel);

    if (defensesError) throw defensesError;
    
    // 3. Get the user's currently placed defenses and count them
    const { data: userBaseData, error: baseDataError } = await supabase
        .from('user_base_data')
        .select('name, current_level')
        .eq('user_id', userId);

    if (baseDataError) throw baseDataError;

    const userDefensesCount = userBaseData.reduce((acc, defense) => {
        const defenseName = stripSuffix(defense.name);
        acc[defenseName] = (acc[defenseName] || 0) + 1;
        return acc;
    }, {});

    const availableUpgrades = [];
    
    // 4. Determine available upgrades by comparing user's defenses to allowed limits
    const groupedDefenses = allDefenses.reduce((acc, defense) => {
        if (!acc[defense.name]) {
            acc[defense.name] = [];
        }
        acc[defense.name].push(defense);
        return acc;
    }, {});

    for (const defenseName in groupedDefenses) {
        const defensesInGroup = groupedDefenses[defenseName].sort((a, b) => a.level - b.level);
        // Find the max_per_town_hall for the highest level of this defense
        const maxAllowed = defensesInGroup[defensesInGroup.length - 1].max_per_town_hall;
        const currentCount = userDefensesCount[defenseName] || 0;
        
        // Find existing instances and their next upgrade levels
        userBaseData
            .filter(d => stripSuffix(d.name) === defenseName)
            .forEach(instance => {
                const nextLevel = instance.current_level + 1;
                const upgradeDetails = defensesInGroup.find(d => d.level === nextLevel);
                if (upgradeDetails) {
                    availableUpgrades.push({
                        defense_instance: instance.name,
                        current_level: instance.current_level,
                        available_upgrades: [{
                            id: upgradeDetails.id,
                            level: upgradeDetails.level,
                            build_cost: upgradeDetails.build_cost,
                            build_resource: upgradeDetails.build_resource,
                            build_time_seconds: upgradeDetails.build_time_seconds,
                        }]
                    });
                }
            });

        // Add a new upgrade card for each instance the user can still build
        if (currentCount < maxAllowed) {
            const nextLevel = 1; // New defenses always start at level 1
            const upgradeDetails = defensesInGroup.find(d => d.level === nextLevel);
            if (upgradeDetails) {
                // Loop to create a card for each available new instance
                for (let i = currentCount; i < maxAllowed; i++) {
                    availableUpgrades.push({
                        defense_instance: `${defenseName} #${i + 1}`,
                        current_level: 0,
                        available_upgrades: [{
                            id: upgradeDetails.id,
                            level: upgradeDetails.level,
                            build_cost: upgradeDetails.build_cost,
                            build_resource: upgradeDetails.build_resource,
                            build_time_seconds: upgradeDetails.build_time_seconds,
                        }]
                    });
                }
            }
        }
    }

    return res.json(availableUpgrades);
  } catch (err) {
    console.error("Error fetching available upgrades:", err.message);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
}

// Export both functions
module.exports = { startUpgrade, getAvailableUpgrades };
