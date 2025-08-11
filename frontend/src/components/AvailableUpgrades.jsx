import React, { useEffect, useState } from "react";

/**
 * Renders the list of available upgrades and handles the upgrade process.
 * @param {object} props The component props.
 * @param {string} props.userId The ID of the current user.
 * @param {function} props.onUpgradeSuccess A callback function to run after a successful upgrade.
 */
const AvailableUpgrades = ({ userId, onUpgradeSuccess }) => {
  // State for fetching upgrade data
  const [upgrades, setUpgrades] = useState([]);
  const [loadingUpgrades, setLoadingUpgrades] = useState(true);
  const [errorUpgrades, setErrorUpgrades] = useState(null);

  // State for fetching user economy data
  const [economy, setEconomy] = useState(null);
  const [loadingEconomy, setLoadingEconomy] = useState(true);
  const [errorEconomy, setErrorEconomy] = useState(null);

  // State to manage the currently upgrading item's key, for button disable/loading state
  const [upgradingKey, setUpgradingKey] = useState(null);
  // State for displaying success or error messages to the user
  const [actionMessage, setActionMessage] = useState(null);

  /**
   * Fetches the list of available upgrades from the backend.
   * This function is now simplified to only get the next available level.
   */
  const fetchUpgrades = async () => {
    try {
      setLoadingUpgrades(true);
      setErrorUpgrades(null);

      const res = await fetch(`/api/upgrades/available?userId=${userId}`);
      if (!res.ok) throw new Error(`Failed to fetch upgrades: ${res.status}`);

      const data = await res.json();
      setUpgrades(data);
    } catch (err) {
      setErrorUpgrades(err.message);
    } finally {
      setLoadingUpgrades(false);
    }
  };

  /**
   * Fetches the user's economy data from the backend.
   */
  const fetchEconomy = async () => {
    try {
      setLoadingEconomy(true);
      setErrorEconomy(null);

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

  /**
   * Effect to fetch data on component mount or when userId changes.
   */
  useEffect(() => {
    if (userId) {
      fetchUpgrades();
      fetchEconomy();
    }
  }, [userId]);

  /**
   * Handles the instant upgrade process.
   * @param {object} upgrade The upgrade details.
   * @param {string} defenseInstanceName The name of the defense instance.
   */
  async function handleFinishUpgrade(upgrade, defenseInstanceName) {
    if (!economy) return;

    // A unique key to identify the specific button that was clicked
    const uniqueKey = `${defenseInstanceName}-${upgrade.id}`;
    setUpgradingKey(uniqueKey);
    setActionMessage(null);

    // Calculate cost, including the gold pass discount if applicable
    const cost = economy.has_gold_pass
      ? Math.ceil(upgrade.build_cost * 0.8)
      : upgrade.build_cost;

    // Check if the user has enough resources
    if (economy.gold_amount < cost) {
      setActionMessage(`Error: Not enough ${upgrade.build_resource}!`);
      setUpgradingKey(null);
      return;
    }

    try {
      // Optimistically update the local state to provide immediate feedback
      setEconomy((prev) => ({
        ...prev,
        gold_amount: prev.gold_amount - cost,
      }));

      // Send the request to the backend to perform the instant upgrade
      const res = await fetch("/api/user-economy/start-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          upgradeId: upgrade.id,
          upgradeLevel: upgrade.level,
          buildCost: upgrade.build_cost, // Send original cost to backend for verification
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
        throw new Error(json.error || "Failed to finish upgrade");
      }

      setActionMessage("Upgrade finished successfully!");
      
      // Re-fetch all data to ensure the UI is in sync with the new state
      await Promise.all([fetchUpgrades(), fetchEconomy()]);
      
      // Call the callback function provided by the parent component
      if (onUpgradeSuccess) {
        onUpgradeSuccess();
      }

    } catch (err) {
      // Rollback the local state if the API call fails
      setEconomy((prev) => ({
        ...prev,
        gold_amount: prev.gold_amount + cost,
      }));
      setActionMessage(`Error: ${err.message}`);
    } finally {
      // Reset the upgrading key to re-enable the button
      setUpgradingKey(null);
    }
  }

  if (loadingUpgrades || loadingEconomy) return <p>Loading available upgrades...</p>;
  if (errorUpgrades) return <p>Error loading upgrades: {errorUpgrades}</p>;
  if (errorEconomy) return <p>Error loading economy: {errorEconomy}</p>;

  // A custom message box for displaying alerts and success messages
  const messageBoxStyle = {
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    backgroundColor: actionMessage?.startsWith('Error:') ? '#ffcccc' : '#ccffcc',
    color: '#333',
    border: `1px solid ${actionMessage?.startsWith('Error:') ? '#ff0000' : '#009900'}`,
    textAlign: 'center',
    cursor: 'pointer'
  };

  return (
    <div>
      {actionMessage && (
        <div style={messageBoxStyle} onClick={() => setActionMessage(null)}>
          {actionMessage}
        </div>
      )}
      <h2>Available Upgrades</h2>
      {upgrades.length === 0 ? (
        <p>
          You have unplaced defenses. Please go to the{' '}
          <a href="http://localhost:5173/profile">profile page</a> to add them.
        </p>
      ) : (
        upgrades.map((instance) => (
          <div key={instance.defense_instance} style={{ marginBottom: "1rem" }}>
            <h3>{instance.defense_instance}</h3>
            <p>Current Level: {instance.current_level}</p>
            <ul>
              {instance.available_upgrades.map((upg) => {
                const uniqueKey = `${instance.defense_instance}-${upg.id}`;
                const isUpgrading = upgradingKey === uniqueKey;
                const cost = economy?.has_gold_pass
                  ? Math.ceil(upg.build_cost * 0.8)
                  : upg.build_cost;

                return (
                  <li key={uniqueKey} style={{ marginBottom: "0.5rem" }}>
                    Upgrade to level {upg.level} - Cost: {cost}{" "}
                    {upg.build_resource}
                    <button
                      onClick={() => handleFinishUpgrade(upg, instance.defense_instance)}
                      disabled={isUpgrading}
                      style={{ marginLeft: "1rem" }}
                    >
                      {isUpgrading ? "loading" : "Finish Upgrade"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default AvailableUpgrades;
