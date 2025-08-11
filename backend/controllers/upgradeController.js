const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function startUpgrade(req, res) {
    try {
        // Updated to receive `defenseInstanceName` from the frontend
        const { userId, upgradeId, upgradeLevel, buildCost, buildTimeSeconds, defenseInstanceName } = req.body;

        if (!userId || !upgradeId || !upgradeLevel || !buildCost || !buildTimeSeconds || !defenseInstanceName) {
            return res.status(400).json({ success: false, error: "Missing required fields for upgrade." });
        }

        // Fetch user economy to check resources and builders
        const { data: economyData, error: economyError } = await supabase
            .from('user_economy')
            .select('gold_amount, builders_count')
            .eq('user_id', userId)
            .single();

        if (economyError) throw economyError;
        if (!economyData) return res.status(404).json({ success: false, error: 'User economy data not found.' });

        // Check for available builders
        const { data: inProgressUpgrades, error: upgradesError } = await supabase
            .from('user_upgrades')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'in_progress');

        if (upgradesError) throw upgradesError;

        if (inProgressUpgrades.length >= economyData.builders_count) {
            return res.status(409).json({ success: false, error: 'All builders are currently busy.' });
        }

        // Check if the user has enough resources
        if (economyData.gold_amount < buildCost) {
            return res.status(409).json({ success: false, error: 'Not enough gold to start upgrade.' });
        }

        // Deduct gold and update economy
        const { error: resourceUpdateError } = await supabase
            .from('user_economy')
            .update({ gold_amount: economyData.gold_amount - buildCost })
            .eq('user_id', userId);

        if (resourceUpdateError) throw resourceUpdateError;

        // **CRUCIAL FIX:** Find the specific defense instance in `user_base_data` and update its level
        const { error: baseDataUpdateError } = await supabase
            .from('user_base_data')
            .update({ current_level: upgradeLevel })
            .eq('user_id', userId)
            .eq('name', defenseInstanceName);

        if (baseDataUpdateError) {
            console.error("Base data update error:", baseDataUpdateError);
            return res.status(500).json({ success: false, error: "Failed to update defense level." });
        }
        
        // **NEW LOGIC:** Insert a new entry into the `user_upgrades` table to track the upgrade progress
        const now = new Date();
        const finishAt = new Date(now.getTime() + buildTimeSeconds * 1000);
        
        const { error: insertUpgradeError } = await supabase
            .from('user_upgrades')
            .insert([{
                user_id: userId,
                defense_id: upgradeId,
                defense_name: defenseInstanceName, // Storing the instance name for tracking
                upgrade_level: upgradeLevel,
                status: "in_progress",
                started_at: now.toISOString(),
                finishes_at: finishAt.toISOString()
            }]);

        if (insertUpgradeError) {
            console.error("Insert upgrade error:", insertUpgradeError);
            return res.status(500).json({ success: false, error: "Failed to start upgrade." });
        }

        return res.json({ success: true, message: "Upgrade started successfully." });

    } catch (err) {
        console.error("Error starting upgrade:", err.message);
        return res.status(500).json({ success: false, error: "Internal server error." });
    }
}

module.exports = { startUpgrade };