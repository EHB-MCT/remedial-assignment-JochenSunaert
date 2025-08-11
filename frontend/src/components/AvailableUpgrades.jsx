import React, { useEffect, useState } from "react";

const AvailableUpgrades = ({ userId }) => {
  const [upgrades, setUpgrades] = useState([]);
  const [loadingUpgrades, setLoadingUpgrades] = useState(true);
  const [errorUpgrades, setErrorUpgrades] = useState(null);

  const [economy, setEconomy] = useState(null);
  const [loadingEconomy, setLoadingEconomy] = useState(true);
  const [errorEconomy, setErrorEconomy] = useState(null);

  // Use a unique key that combines instance name and upgrade ID
  const [startingUpgradeKey, setStartingUpgradeKey] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [timeLeftMap, setTimeLeftMap] = useState({});

  const fetchUpgrades = async () => {
    try {
      setLoadingUpgrades(true);
      setErrorUpgrades(null);

      const res = await fetch(`/api/upgrades/available?userId=${userId}`);
      if (!res.ok) throw new Error(`Failed to fetch upgrades: ${res.status}`);

      const data = await res.json();
      setUpgrades(data);

      updateTimeLeft(data);
    } catch (err) {
      setErrorUpgrades(err.message);
    } finally {
      setLoadingUpgrades(false);
    }
  };

  const fetchEconomy = async () => {
    try {
      setLoadingEconomy(true);
      setErrorEconomy(null);

      // This is the corrected line to fix the 404 error
      const res = await fetch(`/api/user-economy/${userId}`);
      if (!res.ok) throw new Error(`Failed to fetch economy data: ${res.status}`);

      const data = await res.json();
      setEconomy(data);
    } catch (err) {
      setErrorEconomy(err.message);
    } finally {
      setLoadingEconomy(false);
    }
  };

  // This function now correctly creates a unique key for each upgrade instance
  const updateTimeLeft = (upgradesList) => {
    const now = Date.now();
    const newTimeLeftMap = {};

    upgradesList.forEach((instance) => {
      // The `available_upgrades` array will contain the upgrade details
      // from the `user_upgrades` table if an upgrade is in progress
      instance.available_upgrades.forEach((upg) => {
        // We create a unique key for each upgrade instance
        const uniqueKey = `${instance.defense_instance}-${upg.id}`;
        if (upg.status === "in_progress" && upg.finishes_at) {
          const finishTime = new Date(upg.finishes_at).getTime();
          const diff = Math.max(0, Math.floor((finishTime - now) / 1000));
          newTimeLeftMap[uniqueKey] = diff;
        }
      });
    });
    setTimeLeftMap(newTimeLeftMap);
  };

  useEffect(() => {
    // Only run the interval if we have upgrades to check
    if (upgrades.length === 0) return;

    const interval = setInterval(() => {
      setTimeLeftMap((prev) => {
        const updated = {};
        Object.entries(prev).forEach(([id, seconds]) => {
          updated[id] = seconds > 0 ? seconds - 1 : 0;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [upgrades]);

  useEffect(() => {
    if (userId) {
      fetchUpgrades();
      fetchEconomy();
    }
  }, [userId]);

  useEffect(() => {
    updateTimeLeft(upgrades);
  }, [upgrades]);

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return [
      h > 0 ? h + "h" : null,
      m > 0 ? m + "m" : null,
      s + "s",
    ].filter(Boolean).join(" ");
  }

  async function handleStartUpgrade(upgrade, defenseInstanceName) {
    if (!economy) return;

    setActionError(null);
    const uniqueKey = `${defenseInstanceName}-${upgrade.id}`; // Create the unique key
    setStartingUpgradeKey(uniqueKey);

    const cost = economy.has_gold_pass
      ? Math.ceil(upgrade.build_cost * 0.8)
      : upgrade.build_cost;

    // Check against the current state of economy
    if (economy.gold_amount < cost) {
      // Replaced alert with a custom message.
      setActionError(`Not enough ${upgrade.build_resource}! Please go to your Economy Settings to increase your resources.`);
      setStartingUpgradeKey(null);
      return;
    }

    try {
      const resourceField = upgrade.build_resource.toLowerCase().replace(' ', '_') + '_amount';
      // Optimistically update the local state
      setEconomy((prev) => ({
        ...prev,
        [resourceField]: prev[resourceField] - cost,
      }));

      const res = await fetch("/api/user-economy/start-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          upgradeId: upgrade.id,
          upgradeLevel: upgrade.level,
          buildCost: cost, // Use the calculated cost
          buildTimeSeconds: upgrade.build_time_seconds,
          defenseInstanceName: defenseInstanceName,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const msg = errJson?.error || `Server error: ${res.status}`;
        throw new Error(msg);
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Failed to start upgrade");
      }

      setActionError("Upgrade started!"); // Show success message in the error display area

      await Promise.all([fetchUpgrades(), fetchEconomy()]);
    } catch (err) {
      const resourceField = upgrade.build_resource.toLowerCase().replace(' ', '_') + '_amount';
      // Rollback the local state if the upgrade fails
      setEconomy((prev) => ({
        ...prev,
        [resourceField]: prev[resourceField] + cost,
      }));
      setActionError(err.message);
    } finally {
      setStartingUpgradeKey(null);
    }
  }

  if (loadingUpgrades || loadingEconomy) return <p>Loading available upgrades...</p>;
  if (errorUpgrades) return <p>Error loading upgrades: {errorUpgrades}</p>;
  if (errorEconomy) return <p>Error loading economy: {errorEconomy}</p>;

  // Display a custom message box instead of using alert()
  const messageBoxStyle = {
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    backgroundColor: actionError && actionError.includes('Error:') ? '#ffcccc' : '#ccffcc',
    color: '#333',
    border: `1px solid ${actionError && actionError.includes('Error:') ? '#ff0000' : '#009900'}`,
    textAlign: 'center',
    cursor: 'pointer'
  };

  return (
    <div>
      {actionError && (
        <div style={messageBoxStyle} onClick={() => setActionError(null)}>
          {actionError}
        </div>
      )}
      <h2>Available Upgrades</h2>
      {upgrades.length === 0 && <p>No upgrades available.</p>}
      {upgrades.map((instance) => (
        <div key={instance.defense_instance} style={{ marginBottom: "1rem" }}>
          <h3>{instance.defense_instance}</h3>
          <p>Current Level: {instance.current_level}</p>
          <ul>
            {instance.available_upgrades.map((upg) => {
              // The unique key for each list item and button
              const uniqueKey = `${instance.defense_instance}-${upg.id}`;
              const timeLeft = timeLeftMap[uniqueKey];
              const isInProgress = upg.status === "in_progress" && timeLeft > 0;
              const cost = economy?.has_gold_pass
                ? Math.ceil(upg.build_cost * 0.8)
                : upg.build_cost;

              return (
                <li key={uniqueKey} style={{ marginBottom: "0.5rem" }}>
                  Upgrade to level {upg.level} - Cost: {cost}{" "}
                  {upg.build_resource} — Time: {upg.build_time_seconds} seconds
                  {isInProgress && (
                    <span style={{ marginLeft: "1rem", fontWeight: "bold", color: "green" }}>
                      In Progress: {formatTime(timeLeft)} remaining
                    </span>
                  )}
                  <button
                    onClick={() => handleStartUpgrade(upg, instance.defense_instance)}
                    disabled={startingUpgradeKey === uniqueKey || isInProgress}
                    style={{ marginLeft: "1rem" }}
                  >
                    {startingUpgradeKey === uniqueKey ? "Starting..." : "Start Upgrade"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default AvailableUpgrades;
