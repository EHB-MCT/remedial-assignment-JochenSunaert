// services/upgradeService.js
/**
 * Upgrade Service
 * Contains economy/simulation orchestration and business rules.
 * No direct DB calls here, delegate to repositories.
 */

const repo = require('../repositories/upgradeRepository');
const { stripSuffix } = require('../utils/strings');
const { computeFinalCost } = require('../utils/economy');
const { applyDurationOffset, finishesAtFromSeconds } = require('../utils/time');

/** Magic number offset preserved from legacy behavior (+2 hours). */
const TWO_HOURS_SECONDS = 7200;

/**
 * Start an upgrade workflow.
 * - Validates resources & builders
 * - Deducts cost
 * - Creates in-progress upgrade record
 */
async function startUpgrade({ userId, upgradeId, upgradeLevel, defenseInstanceName }) {
  console.log(`[SRV] Starting upgrade for ${defenseInstanceName} -> L${upgradeLevel} (user: ${userId})`);

  // 1) Canonical upgrade info
  const upgrade = await repo.getUpgradeDetailsById(upgradeId);
  if (!upgrade) {
    const err = new Error('Upgrade details not found.');
    err.statusCode = 404;
    err.publicMessage = 'Upgrade details not found.';
    throw err;
  }

  const canonicalBuildCost = upgrade.build_cost;
  const canonicalBuildTimeSeconds = upgrade.build_time_seconds;
  const canonicalBuildResource = upgrade.build_resource;

  // 2) Economy + builders availability
  const economy = await repo.getUserEconomyByUserId(userId);
  if (!economy) {
    const err = new Error('User economy data not found.');
    err.statusCode = 404;
    err.publicMessage = 'User economy data not found.';
    throw err;
  }

  const inProgress = await repo.getInProgressUpgrades(userId);
  if (inProgress.length >= economy.builders_count) {
    const err = new Error('All builders are busy.');
    err.statusCode = 409;
    err.publicMessage = 'All builders are busy.';
    throw err;
  }

  // 3) Cost & resource deduction
  const resourceField = canonicalBuildResource === 'gold' ? 'gold_amount' : 'elixir_amount';
  const finalCost = computeFinalCost(canonicalBuildCost, economy.has_gold_pass);
  if (economy[resourceField] < finalCost) {
    const err = new Error(`Not enough ${canonicalBuildResource}.`);
    err.statusCode = 409;
    err.publicMessage = `Not enough ${canonicalBuildResource}.`;
    throw err;
  }

  const newAmount = economy[resourceField] - finalCost;
  await repo.updateUserEconomyResource(userId, resourceField, newAmount);
  console.log(`[SRV] Deducted ${finalCost} ${canonicalBuildResource}. New ${resourceField}: ${newAmount}`);

  // 4) Timer (preserve your +2h correction)
  const correctedSeconds = applyDurationOffset(canonicalBuildTimeSeconds, TWO_HOURS_SECONDS);
  const startedAt = new Date();
  const finishesAt = finishesAtFromSeconds(startedAt, correctedSeconds);

  // 5) Insert user_upgrades
  await repo.insertUserUpgrade({
    user_id: userId,
    defense_id: upgradeId,
    defense_instance_name: defenseInstanceName,
    upgrade_level: upgradeLevel,
    status: 'in_progress',
    started_at: startedAt.toISOString(),
    finishes_at: finishesAt.toISOString(),
  });

  console.log(
    `[SRV] Upgrade started. Duration=${correctedSeconds}s, finishesAt=${finishesAt.toISOString()}`
  );
}

/**
 * Return all in-progress upgrades for a user.
 */
async function getInProgressUpgrades(userId) {
  console.log(`[SRV] Fetching in-progress upgrades for user ${userId}`);
  return repo.getInProgressUpgrades(userId);
}

/**
 * Complete an upgrade:
 * - Delete in-progress record (id+user+instance match)
 * - Upsert defense instance level in user_base_data
 */
async function completeUpgrade({ userId, upgradeId, defenseInstanceName, targetLevel }) {
  console.log(
    `[SRV] Completing upgrade ${defenseInstanceName} -> L${targetLevel} (user: ${userId})`
  );

  const deletedRows = await repo.deleteUserUpgradeById(userId, upgradeId, defenseInstanceName);

  if (deletedRows === 0) {
    console.warn('[SRV] Upgrade record not found; probably already completed.');
    return `Upgrade for ${defenseInstanceName} to level ${targetLevel} was already completed.`;
  }

  const existingDefense = await repo.getExistingDefenseInstance(userId, defenseInstanceName);
  if (existingDefense) {
    await repo.updateDefenseLevelById(existingDefense.id, targetLevel);
    console.log(`[SRV] Updated existing defense ${defenseInstanceName} -> L${targetLevel}`);
  } else {
    await repo.insertDefenseInstance(userId, defenseInstanceName, targetLevel);
    console.log(`[SRV] Inserted new defense ${defenseInstanceName} -> L${targetLevel}`);
  }

  return `Upgrade to ${defenseInstanceName} level ${targetLevel} finished successfully.`;
}

/**
 * Compute available upgrades for a user.
 * - Skips busy instances
 * - Suggests next levels for existing defenses
 * - Suggests new instances up to max_per_town_hall
 */
async function getAvailableUpgrades(userId) {
  console.log(`[SRV] Computing available upgrades for user ${userId}`);

  // Busy names
  const busy = await repo.getBusyDefenseInstanceNames(userId);
  const busySet = new Set(busy);

  // Town Hall
  const thLevel = await repo.getTownHallLevel(userId);
  if (!Number.isInteger(thLevel)) {
    const err = new Error('Town Hall data not found.');
    err.statusCode = 404;
    err.publicMessage = 'Town Hall data not found.';
    throw err;
  }

  // All defenses up to TH
  const allDefenses = await repo.getAllDefensesUpToTownHall(thLevel);

  // Current base
  const base = await repo.getUserBaseDataByUserId(userId);

  // Count placed types
  const countByName = base.reduce((acc, d) => {
    const name = stripSuffix(d.name);
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const available = [];

  // Upgrades for existing instances
  for (const inst of base) {
    if (busySet.has(inst.name)) continue;

    const defName = stripSuffix(inst.name);
    const nextLevel = inst.current_level + 1;
    const next = allDefenses.find((u) => u.defense_name === defName && u.level === nextLevel);

    if (next) {
      available.push({
        defense_instance: inst.name,
        current_level: inst.current_level,
        available_upgrades: [
          {
            id: next.id,
            level: next.level,
            build_cost: next.build_cost,
            build_resource: next.build_resource,
            build_time_seconds: next.build_time_seconds,
          },
        ],
      });
    }
  }

  // New instances up to max_per_town_hall
  const allTypes = [...new Set(allDefenses.map((d) => d.defense_name))];

  for (const defName of allTypes) {
    const first = allDefenses.find((u) => u.defense_name === defName && u.level === 1);
    if (!first) continue;

    const maxAllowed = first.max_per_town_hall; // assumes column exists in your schema
    const currentCount = countByName[defName] || 0;

    for (let i = currentCount; i < maxAllowed; i++) {
      const candidate = `${defName} #${i + 1}`;
      if (!busySet.has(candidate)) {
        available.push({
          defense_instance: candidate,
          current_level: 0,
          available_upgrades: [
            {
              id: first.id,
              level: first.level,
              build_cost: first.build_cost,
              build_resource: first.build_resource,
              build_time_seconds: first.build_time_seconds,
            },
          ],
        });
      }
    }
  }

  return available;
}

module.exports = {
  startUpgrade,
  getInProgressUpgrades,
  completeUpgrade,
  getAvailableUpgrades,
};
