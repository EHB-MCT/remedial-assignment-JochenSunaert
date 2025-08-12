import React, { useEffect, useState, useRef, useCallback } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Renders the list of available upgrades and handles the upgrade process.
 * @param {object} props The component props.
 * @param {string} props.userId The ID of the current user.
 */
const AvailableUpgrades = ({ userId }) => {
  // State for fetching available upgrades
  const [upgrades, setUpgrades] = useState([]);
  const [loadingUpgrades, setLoadingUpgrades] = useState(true);
  const [errorUpgrades, setErrorUpgrades] = useState(null);

  // State for fetching user economy data
  const [economy, setEconomy] = useState(null);
  const [loadingEconomy, setLoadingEconomy] = useState(true);
  const [errorEconomy, setErrorEconomy] = useState(null);

  // New state to manage upgrades that are currently in progress
  const [inProgressUpgrades, setInProgressUpgrades] = useState([]);
  const [loadingInProgress, setLoadingInProgress] = useState(true);
  const [errorInProgress, setErrorInProgress] = useState(null);

  // State for button disable/loading state
  const [upgradingKey, setUpgradingKey] = useState(null);

  // useRef to hold the timer interval, so we can clear it when needed
  const timerRef = useRef(null);
  
  /**
   * Helper function to calculate the discounted value if the user has a gold pass.
   * The discount is 20% (multiplied by 0.8), and the result is rounded up to the nearest integer.
   * @param {number} originalValue The original cost or time.
   * @param {boolean} hasGoldPass Whether the user has the gold pass enabled.
   * @returns {number} The discounted value.
   */
  const getDiscountedValue = (originalValue, hasGoldPass) => {
    return hasGoldPass ? Math.ceil(originalValue * 0.8) : originalValue;
  };

  /**
   * Helper function to format seconds into a more readable format (H:MM:SS)
   * @param {number} seconds The number of seconds remaining.
   * @returns {string} The formatted time string.
   */
  const formatTime = (seconds) => {
    if (seconds < 0) return "0:00:00"; // Handle negative time
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  /**
   * Helper function to format a UTC timestamp into a user's local time string.
   * The JavaScript Date object handles the timezone conversion automatically.
   * @param {string} utcTimestamp The UTC timestamp from the backend (e.g., '2025-08-11T19:39:56.570Z').
   * @returns {string} The formatted local time string with a time zone indicator.
   */
  const formatFinishTime = (utcTimestamp) => {
    const date = new Date(utcTimestamp);
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    };
    return date.toLocaleString(undefined, options);
  };

  /**
   * Handles the finalization of a completed upgrade by calling the backend,
   * then re-fetching all data to update the UI.
   * @param {object} completed The completed upgrade object.
   */
  const handleCompletedUpgrade = useCallback(async (completed) => {
    try {
      console.log("Attempting to complete upgrade:", completed);
      const res = await fetch(`/api/user-economy/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          upgradeId: completed.id, // This is the ID of the user_upgrades table row
          defenseInstanceName: completed.defense_instance_name,
          targetLevel: completed.upgrade_level
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to complete upgrade: ${res.status}`);
      }
      
      console.log("Upgrade completed successfully for:", completed.defense_instance_name);
      // Trigger a full data refresh from within this component
      fetchAllData();
    } catch (err) {
      console.error("Error completing upgrade:", err);
      toast.error(`Error completing upgrade: ${err.message}`);
      // In case of an error, re-fetch all data to revert any inconsistent state
      fetchAllData();
    }
  }, [userId]);

  /**
   * Fetches all necessary data from the backend. This function handles the
   * fetching of in-progress upgrades, available upgrades, and user economy.
   */
  const fetchAllData = useCallback(async () => {
    if (!userId) {
      console.error("No userId provided to fetchAllData.");
      return;
    }

    try {
      // Fetch in-progress upgrades
      setLoadingInProgress(true);
      setErrorInProgress(null);
      const inProgressRes = await fetch(`/api/upgrades?userId=${userId}`);
      if (!inProgressRes.ok) throw new Error(`Failed to fetch in-progress upgrades: ${inProgressRes.status}`);
      const inProgressData = await inProgressRes.json();
      
      // Calculate remaining time for each upgrade on the frontend
      const now = new Date();
      const processedUpgrades = inProgressData.map(upg => {
        const finishesAt = new Date(upg.finishes_at);
        const timeRemaining = Math.max(0, Math.floor((finishesAt - now) / 1000));
        return { ...upg, time_remaining: timeRemaining };
      });
      
      setInProgressUpgrades(processedUpgrades);
      setLoadingInProgress(false);
      console.log("In-progress upgrades fetched:", processedUpgrades.length);
      
      // Fetch available upgrades
      setLoadingUpgrades(true);
      setErrorUpgrades(null);
      const upgradesRes = await fetch(`/api/upgrades/available?userId=${userId}`);
      if (!upgradesRes.ok) throw new Error(`Failed to fetch available upgrades: ${upgradesRes.status}`);
      const upgradesData = await upgradesRes.json();
      setUpgrades(upgradesData);
      setLoadingUpgrades(false);
      console.log("Available upgrades fetched:", upgradesData.length);

      // Fetch economy data
      setLoadingEconomy(true);
      setErrorEconomy(null);
      const economyRes = await fetch(`/api/user-economy/${userId}`);
      if (!economyRes.ok) throw new Error(`Failed to fetch economy data: ${economyRes.status}`);
      const economyData = await economyRes.json();
      setEconomy(economyData);
      setLoadingEconomy(false);
      console.log("User economy data fetched:", economyData);
    } catch (err) {
      console.error("Error fetching all data:", err);
      toast.error(`Error fetching data: ${err.message}`);
      setLoadingInProgress(false);
      setLoadingUpgrades(false);
      setLoadingEconomy(false);
    }
  }, [userId]);

  /**
   * Effect to fetch all data on component mount or when userId changes.
   */
  useEffect(() => {
    console.log("Initial data fetch triggered.");
    fetchAllData();
  }, [userId, fetchAllData]);

  /**
   * Effect to handle the countdown timer for in-progress upgrades.
   * This effect now correctly handles upgrade completion.
   */
  useEffect(() => {
    // If there are no in-progress upgrades, clear the timer
    if (inProgressUpgrades.length === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    // Clear any existing timer before setting a new one
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setInProgressUpgrades((prevUpgrades) => {
        const now = new Date();
        const updatedUpgrades = prevUpgrades.map((upg) => {
          const finishesAt = new Date(upg.finishes_at);
          const timeRemaining = Math.max(0, Math.floor((finishesAt - now) / 1000));
          return { ...upg, time_remaining: timeRemaining };
        });

        const stillInProgress = updatedUpgrades.filter((upg) => upg.time_remaining > 0);
        const completedUpgrades = updatedUpgrades.filter((upg) => upg.time_remaining === 0);
        
        if (completedUpgrades.length > 0) {
          completedUpgrades.forEach(handleCompletedUpgrade);
        }

        return stillInProgress;
      });
    }, 1000);

    // Clean up the interval when the component unmounts or upgrades list is empty
    return () => clearInterval(timerRef.current);
  }, [inProgressUpgrades, handleCompletedUpgrade]);

  /**
   * Handles the upgrade process, starting a new upgrade and saving it to the database.
   * Now, it first checks if the upgrade is possible and shows a toast message if not.
   * @param {object} upgrade The upgrade details.
   * @param {string} defenseInstanceName The name of the defense instance.
   */
  async function handleStartUpgrade(upgrade, defenseInstanceName) {
    if (!economy) return;

    // Apply the Gold Pass discount to both cost and time for client-side validation
    const hasGoldPass = economy?.has_gold_pass;
    const discountedCost = getDiscountedValue(upgrade.build_cost, hasGoldPass);
    const discountedTime = getDiscountedValue(upgrade.build_time_seconds, hasGoldPass);

    const canAfford = (upgrade.build_resource === 'gold' && economy?.gold_amount >= discountedCost) ||
                     (upgrade.build_resource === 'elixir' && economy?.elixir_amount >= discountedCost);
    const isBuilderBusy = economy?.builders_count <= inProgressUpgrades.length;

    // Check conditions and show a toast message if they are not met.
    if (isBuilderBusy) {
      toast.error("All your builders are busy!");
      return;
    }

    if (!canAfford) {
      toast.error(`Not enough ${upgrade.build_resource} to start this upgrade!`);
      return;
    }

    // Proceed with the upgrade if all conditions pass
    const uniqueKey = `${defenseInstanceName}-${upgrade.id}`;
    setUpgradingKey(uniqueKey);
    toast.info("Starting upgrade...");

    try {
      console.log(`Attempting to start upgrade for ${defenseInstanceName} to level ${upgrade.level}...`);
      
      const res = await fetch("/api/user-economy/start-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          upgradeId: upgrade.id,
          upgradeLevel: upgrade.level,
          defenseInstanceName,
          // Sending discounted time to the backend for consistency, though backend should be source of truth
          // buildTimeSeconds: discountedTime, 
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
      
      console.log("Upgrade started successfully!");
      toast.success("Upgrade started successfully!");
      
      fetchAllData();
    } catch (err) {
      console.error(`Failed to start upgrade for ${defenseInstanceName}:`, err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setUpgradingKey(null);
    }
  }

  // Handle loading states
  const isLoading = loadingUpgrades || loadingEconomy || loadingInProgress;
  if (isLoading) return <p>Loading available upgrades...</p>;
  
  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto my-8 space-y-8">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">In-Progress Upgrades</h2>
        <p className="text-gray-600 mt-2">({inProgressUpgrades.length}/{economy?.builders_count || 0} builders busy)</p>
      </div>

      <button
        onClick={fetchAllData}
        className="w-full bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-200"
      >
        Refresh Data
      </button>

      {inProgressUpgrades.length > 0 ? (
        <div className="space-y-4">
          {inProgressUpgrades.map((upg) => (
            <div key={upg.id} className="p-4 bg-white rounded-lg shadow-md border-l-4 border-indigo-500">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">{upg.defense_instance_name}</h3>
                <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  Lvl. {upg.upgrade_level}
                </span>
              </div>
              <p className="text-gray-600 mt-2">
                Time remaining: <strong className="text-indigo-600">{formatTime(upg.time_remaining)}</strong>
              </p>
              <p className="text-gray-500 text-sm">
                Finishes at: <strong className="text-gray-700">{formatFinishTime(upg.finishes_at)}</strong>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-white rounded-lg shadow-md text-center text-gray-500">
          <p>You have no upgrades in progress.</p>
          <p className="mt-2">
            This could mean all defenses are at max level, all builders are busy, or there are unplaced defenses.
          </p>
        </div>
      )}

      <hr className="border-gray-300" />

      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Available Upgrades</h2>
      </div>

      {upgrades.length === 0 ? (
        <div className="p-4 bg-white rounded-lg shadow-md text-center text-gray-500">
          <p>You have no available upgrades at this time.</p>
          <p className="mt-2">
            This could mean all defenses are at max level, all builders are busy, or there are unplaced defenses.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {upgrades.map((instance) => (
            <div key={instance.defense_instance} className="p-4 bg-white rounded-lg shadow-md border-l-4 border-green-500">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{instance.defense_instance}</h3>
              <p className="text-gray-600">Current Level: {instance.current_level}</p>
              <ul className="mt-4 space-y-3">
                {instance.available_upgrades.map((upg) => {
                  const uniqueKey = `${instance.defense_instance}-${upg.id}`;
                  const isUpgrading = upgradingKey === uniqueKey;
                  
                  // Use the new helper function to get discounted values
                  const hasGoldPass = economy?.has_gold_pass;
                  const discountedCost = getDiscountedValue(upg.build_cost, hasGoldPass);
                  const discountedTime = getDiscountedValue(upg.build_time_seconds, hasGoldPass);

                  return (
                    <li key={uniqueKey} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="text-gray-800">
                          Upgrade to level <span className="font-bold">{upg.level}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Cost: <span className="font-medium text-gray-700">{discountedCost} {upg.build_resource}</span>
                          {" | "}
                          Time: <span className="font-medium text-gray-700">{formatTime(discountedTime)}</span>
                        </p>
                      </div>
                      <button
                        // The button is no longer disabled. The click handler will validate and show a toast if necessary.
                        onClick={() => handleStartUpgrade(upg, instance.defense_instance)}
                        className={`text-white font-semibold py-2 px-4 rounded-full transition-all duration-200 ${
                          isUpgrading 
                            ? "bg-gray-400 cursor-not-allowed" 
                            : "bg-green-500 hover:bg-green-600 shadow-md"
                        }`}
                      >
                        {isUpgrading ? "Starting..." : "Start Upgrade"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableUpgrades;
