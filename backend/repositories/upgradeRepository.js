// repositories/upgradeRepository.js
/**
 * Upgrade Repository
 * Encapsulates all DB access. Returns plain data or throws on hard errors.
 */

const { supabase } = require('../database/supabaseClient');

/** Get canonical upgrade details by id. */
async function getUpgradeDetailsById(id) {
  const { data, error } = await supabase
    .from('defense_upgrades')
    .select('id, build_cost, build_time_seconds, build_resource')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/** Get user economy snapshot. */
async function getUserEconomyByUserId(userId) {
  const { data, error } = await supabase
    .from('user_economy')
    .select('gold_amount, elixir_amount, has_gold_pass, builders_count')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

/** List all in-progress upgrades. */
async function getInProgressUpgrades(userId) {
  const { data, error } = await supabase
    .from('user_upgrades')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'in_progress');

  if (error) throw error;
  return data || [];
}

/** Names of busy defense instances. */
async function getBusyDefenseInstanceNames(userId) {
  const { data, error } = await supabase
    .from('user_upgrades')
    .select('defense_instance_name')
    .eq('user_id', userId)
    .eq('status', 'in_progress');

  if (error) throw error;
  return (data || []).map((r) => r.defense_instance_name);
}

/** Update a single resource field in user_economy. */
async function updateUserEconomyResource(userId, field, newValue) {
  const { error } = await supabase
    .from('user_economy')
    .update({ [field]: newValue })
    .eq('user_id', userId);

  if (error) throw error;
}

/** Insert a row into user_upgrades. */
async function insertUserUpgrade(row) {
  const { error } = await supabase.from('user_upgrades').insert(row);
  if (error) throw error;
}

/** Delete an upgrade row by id/user/instance; return count deleted. */
async function deleteUserUpgradeById(userId, upgradeId, defenseInstanceName) {
  const { data, error } = await supabase
    .from('user_upgrades')
    .delete()
    .eq('id', upgradeId)
    .eq('user_id', userId)
    .eq('defense_instance_name', defenseInstanceName)
    .select();

  if (error) throw error;
  return (data || []).length;
}

/** Get an existing defense instance row by name. */
async function getExistingDefenseInstance(userId, defenseInstanceName) {
  const { data, error } = await supabase
    .from('user_base_data')
    .select('id')
    .eq('user_id', userId)
    .eq('name', defenseInstanceName)
    .single();

  // "no rows" in PostgREST returns PGRST116; treat as null instance
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/** Update defense level by row id. */
async function updateDefenseLevelById(id, targetLevel) {
  const { error } = await supabase
    .from('user_base_data')
    .update({ current_level: targetLevel })
    .eq('id', id);

  if (error) throw error;
}

/** Insert a new defense instance row. */
async function insertDefenseInstance(userId, defenseInstanceName, targetLevel) {
  const { error } = await supabase
    .from('user_base_data')
    .insert({ user_id: userId, name: defenseInstanceName, current_level: targetLevel });

  if (error) throw error;
}

/** Get Town Hall level. */
async function getTownHallLevel(userId) {
  const { data, error } = await supabase
    .from('user_base_data')
    .select('current_level')
    .eq('user_id', userId)
    .eq('name', 'Town Hall')
    .single();

  if (error) throw error;
  return data?.current_level;
}

/** All defense upgrades available up to a Town Hall level. */
async function getAllDefensesUpToTownHall(thLevel) {
  const { data, error } = await supabase
    .from('defense_upgrades')
    .select('*')
    .lte('unlocks_at_town_hall', thLevel);

  if (error) throw error;
  return data || [];
}

/** All user base rows. */
async function getUserBaseDataByUserId(userId) {
  const { data, error } = await supabase
    .from('user_base_data')
    .select('name, current_level')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

module.exports = {
  getUpgradeDetailsById,
  getUserEconomyByUserId,
  getInProgressUpgrades,
  getBusyDefenseInstanceNames,
  updateUserEconomyResource,
  insertUserUpgrade,
  deleteUserUpgradeById,
  getExistingDefenseInstance,
  updateDefenseLevelById,
  insertDefenseInstance,
  getTownHallLevel,
  getAllDefensesUpToTownHall,
  getUserBaseDataByUserId,
};
