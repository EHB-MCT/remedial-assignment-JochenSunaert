const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to strip the instance suffix, e.g., "Mortar #1" -> "Mortar"
function stripSuffix(name) {
    return name.replace(/\s#\d+$/, '');
}

/**
 * Handles the completion of an upgrade, which is triggered from the frontend after the timer finishes.
 * This is the corrected version that avoids the infinite loop.
 */
async function completeUpgrade(req, res) {
    const { userId, upgradeId, defenseInstanceName, targetLevel } = req.body;

    if (!userId || !upgradeId || !defenseInstanceName || !targetLevel) {
        return res.status(400).json({ success: false, error: "Missing required fields for upgrade completion." });
    }

    console.log(`[BACKEND] Attempting to complete upgrade for ${defenseInstanceName} to level ${targetLevel}...`);

    try {
        // Find and delete the upgrade record by its unique ID.
        // This is a more atomic approach. If the record doesn't exist, it's already been deleted.
        const { data: deleteData, error: deleteError } = await supabase
            .from('user_upgrades')
            .delete()
            .eq('id', upgradeId)
            .eq('user_id', userId)
            .eq('defense_instance_name', defenseInstanceName)
            .select(); // Use .select() to get the deleted rows

        if (deleteError) {
            console.error("[BACKEND] Error deleting upgrade record:", deleteError);
            return res.status(500).json({ success: false, error: "Internal server error." });
        }
        
        // If no rows were deleted, the upgrade was already completed.
        if (deleteData.length === 0) {
            console.warn("[BACKEND] Upgrade record not found. It may have already been completed or deleted.");
            return res.json({ success: true, message: `Upgrade for ${defenseInstanceName} to level ${targetLevel} was already completed.` });
        }
        
        // Check if the defense instance already exists in the user's base
        const { data: existingDefense, error: existingError } = await supabase
            .from('user_base_data')
            .select('id')
            .eq('user_id', userId)
            .eq('name', defenseInstanceName)
            .single();

        if (existingError && existingError.code !== 'PGRST116') { // PGRST116 is a "no rows found" error
            console.error("Error checking for existing defense:", existingError);
            return res.status(500).json({ success: false, error: "Failed to check for defense." });
        }

        if (existingDefense) {
            // Defense exists, so update its level
            const { error } = await supabase
                .from('user_base_data')
                .update({ current_level: targetLevel })
                .eq('id', existingDefense.id);
            if (error) throw error;
            console.log(`[BACKEND] Updated existing defense instance: ${defenseInstanceName}.`);
        } else {
            // Defense does not exist, so insert a new row for it
            const { error } = await supabase
                .from('user_base_data')
                .insert({
                    user_id: userId,
                    name: defenseInstanceName,
                    current_level: targetLevel
                });
            if (error) throw error;
            console.log(`[BACKEND] Inserted new defense instance: ${defenseInstanceName}.`);
        }

        console.log(`[BACKEND] Successfully completed upgrade for ${defenseInstanceName} to level ${targetLevel}.`);
        return res.json({ success: true, message: `Upgrade to ${defenseInstanceName} level ${targetLevel} finished successfully.` });
    } catch (err) {
        console.error("Error completing upgrade:", err.message);
        return res.status(500).json({ success: false, error: "Internal server error." });
    }
}


/**
 * Endpoint to get a list of all upgrades currently in progress for a user.
 * This version has been simplified to only return the in-progress list,
 * leaving the completion logic to the frontend to prevent race conditions.
 */
async function getInProgressUpgrades(req, res) {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required.' });
        }
        
        console.log(`[BACKEND] Fetching in-progress upgrades for userId: ${userId}`);

        // Get all in-progress upgrades
        const { data: upgrades, error } = await supabase
            .from('user_upgrades')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'in_progress');

        if (error) throw error;
        
        console.log(`[BACKEND] Found ${upgrades.length} in-progress upgrades.`);

        return res.json(upgrades);

    } catch (err) {
        console.error("Error fetching in-progress upgrades:", err.message);
        return res.status(500).json({ success: false, error: "Internal server error." });
    }
}

async function startUpgrade(req, res) {
    try {
        const { userId, upgradeId, upgradeLevel, defenseInstanceName } = req.body;

        if (!userId || !upgradeId || !upgradeLevel || !defenseInstanceName) {
            console.error("[BACKEND] Missing required fields for upgrade.");
            return res.status(400).json({ success: false, error: "Missing required fields for upgrade." });
        }
        
        console.log(`[BACKEND] Starting upgrade for ${defenseInstanceName} to level ${upgradeLevel} for userId: ${userId}`);

        // 1. Fetch the canonical upgrade details from the database. This is the crucial fix.
        const { data: upgradeDetails, error: detailsError } = await supabase
            .from('defense_upgrades')
            .select('build_cost, build_time_seconds, build_resource')
            .eq('id', upgradeId)
            .single();

        if (detailsError) throw detailsError;
        if (!upgradeDetails) return res.status(404).json({ success: false, error: 'Upgrade details not found.' });

        const canonicalBuildCost = upgradeDetails.build_cost;
        const canonicalBuildTimeSeconds = upgradeDetails.build_time_seconds;
        const canonicalBuildResource = upgradeDetails.build_resource;
        
        // --- START OF NEW FIX ---
        // Manually correct the upgrade duration by adding a 2-hour offset (7200 seconds)
        // This is a workaround for the incorrect data stored in the database.
        const correctedBuildTimeSeconds = canonicalBuildTimeSeconds + 7200;
        console.log(`[BACKEND] Original duration from DB: ${canonicalBuildTimeSeconds} seconds.`);
        console.log(`[BACKEND] Corrected duration with 2-hour offset: ${correctedBuildTimeSeconds} seconds.`);
        // --- END OF NEW FIX ---

        // 2. Fetch user economy to check resources and builder count
        const { data: economyData, error: economyError } = await supabase
            .from('user_economy')
            .select('gold_amount, elixir_amount, has_gold_pass, builders_count')
            .eq('user_id', userId)
            .single();

        if (economyError) throw economyError;
        if (!economyData) return res.status(404).json({ success: false, error: 'User economy data not found.' });
        
        console.log(`[BACKEND] User economy data:`, economyData);

        // 3. Fetch *active* in-progress upgrades to check for available builders
        const { data: inProgressUpgrades, error: progressError } = await supabase
            .from('user_upgrades')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'in_progress');

        if (progressError) throw progressError;
        if (inProgressUpgrades.length >= economyData.builders_count) {
            console.warn("[BACKEND] All builders are busy.");
            return res.status(409).json({ success: false, error: 'All builders are busy.' });
        }
        
        // 4. Check resources and deduct cost
        const resourceToDeduct = canonicalBuildResource === 'gold' ? 'gold_amount' : 'elixir_amount';
        const finalCost = economyData.has_gold_pass ? Math.ceil(canonicalBuildCost * 0.8) : canonicalBuildCost;
        
        if (economyData[resourceToDeduct] < finalCost) {
            console.warn(`[BACKEND] Not enough ${canonicalBuildResource}.`);
            return res.status(409).json({ success: false, error: `Not enough ${canonicalBuildResource}.` });
        }

        const newResourceAmount = economyData[resourceToDeduct] - finalCost;
        const { error: resourceUpdateError } = await supabase
            .from('user_economy')
            .update({ [resourceToDeduct]: newResourceAmount })
            .eq('user_id', userId);

        if (resourceUpdateError) throw resourceUpdateError;
        
        console.log(`[BACKEND] Deducted ${finalCost} ${canonicalBuildResource}. New amount: ${newResourceAmount}`);

        // 5. Insert new row into user_upgrades
        const startedAt = new Date();
        // Use the corrected duration to calculate the finish time
        const finishesAt = new Date(startedAt.getTime() + correctedBuildTimeSeconds * 1000);
        
        const upgradeDataToInsert = {
            user_id: userId,
            defense_id: upgradeId,
            defense_instance_name: defenseInstanceName,
            upgrade_level: upgradeLevel,
            status: 'in_progress',
            started_at: startedAt.toISOString(),
            finishes_at: finishesAt.toISOString()
        };

        const { error: insertUpgradeError } = await supabase
            .from('user_upgrades')
            .insert(upgradeDataToInsert);

        if (insertUpgradeError) {
            console.error("[BACKEND] Insert upgrade error:", insertUpgradeError);
            return res.status(500).json({ success: false, error: "Failed to start upgrade." });
        }
        
        console.log(`[BACKEND] Upgrade for ${defenseInstanceName} started successfully.`);
        // --- ADDED LOGGING FOR DEBUGGING THE TIMER DURATION ---
        console.log(`[BACKEND] Upgrade duration is supposed to be: ${correctedBuildTimeSeconds} seconds. It will finish at: ${finishesAt.toISOString()}`);

        return res.json({ success: true, message: `Upgrade for ${defenseInstanceName} started successfully.` });
    } catch (err) {
        console.error("Error starting upgrade:", err.message);
        return res.status(500).json({ success: false, error: "Internal server error." });
    }
}


async function getAvailableUpgrades(req, res) {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required.' });
        }
        
        console.log(`[BACKEND] Fetching available upgrades for userId: ${userId}`);

        // Fetch in-progress upgrades first to know which defenses are busy
        const { data: inProgressUpgrades, error: progressError } = await supabase
            .from('user_upgrades')
            .select('defense_instance_name')
            .eq('user_id', userId)
            .eq('status', 'in_progress');
        
        if (progressError) throw progressError;

        const busyDefenseNames = new Set(inProgressUpgrades.map(upg => upg.defense_instance_name));

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
            .from('defense_upgrades')
            .select('*')
            .lte('unlocks_at_town_hall', townHallLevel);

        if (defensesError) throw defensesError;
        
        // 3. Get the user's currently placed defenses and their counts
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
        
        // 4. Determine available upgrades for existing defenses
        userBaseData.forEach(instance => {
            if (busyDefenseNames.has(instance.name)) {
                return; // Skip busy defenses
            }
            
            const defenseName = stripSuffix(instance.name);
            const nextLevel = instance.current_level + 1;
            
            const upgradeDetails = allDefenses.find(upg => 
                upg.defense_name === defenseName && upg.level === nextLevel
            );
            
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

        // 5. Determine available upgrades for brand new defenses
        const allDefenseTypes = [...new Set(allDefenses.map(d => d.defense_name))];

        for (const defenseName of allDefenseTypes) {
            const firstLevelUpgrade = allDefenses.find(upg => 
                upg.defense_name === defenseName && upg.level === 1
            );
            
            if (firstLevelUpgrade) {
                const maxAllowed = firstLevelUpgrade.max_per_town_hall;
                const currentCount = userDefensesCount[defenseName] || 0;
                
                for (let i = currentCount; i < maxAllowed; i++) {
                    const newDefenseName = `${defenseName} #${i + 1}`;
                    if (!busyDefenseNames.has(newDefenseName)) {
                        availableUpgrades.push({
                            defense_instance: newDefenseName,
                            current_level: 0,
                            available_upgrades: [{
                                id: firstLevelUpgrade.id,
                                level: firstLevelUpgrade.level,
                                build_cost: firstLevelUpgrade.build_cost,
                                build_resource: firstLevelUpgrade.build_resource,
                                build_time_seconds: firstLevelUpgrade.build_time_seconds,
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

// Export all functions
module.exports = { startUpgrade, getAvailableUpgrades, getInProgressUpgrades, completeUpgrade };
