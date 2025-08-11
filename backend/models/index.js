require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // <-- use this

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;

// then query, e.g. to insert an upgrade start:
async function startUpgrade(userId, upgradeId, upgradeLevel, buildCost, buildTimeSeconds) {
  const { data, error } = await supabase
    .from('user_upgrades')
    .insert([{ user_id: userId, upgrade_id: upgradeId, level: upgradeLevel, cost: buildCost, time_seconds: buildTimeSeconds }]);

  if (error) throw error;
  return data;
}
