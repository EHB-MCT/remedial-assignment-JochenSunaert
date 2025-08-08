import React, { useEffect, useState } from "react";

const AvailableUpgrades = ({ userId }) => {
  const [upgrades, setUpgrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUpgrades() {
      try {
        const res = await fetch(`http://localhost:3001/api/upgrades/available?userId=${userId}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setUpgrades(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUpgrades();
    }
  }, [userId]); // <-- closing this useEffect here

  if (loading) return <p>Loading available upgrades...</p>;
  if (error) return <p>Error: {error}</p>;

  if (upgrades.length === 0) return <p>No upgrades available.</p>;

  // Group by defense instance
  const grouped = upgrades.reduce((acc, upg) => {
    const key = upg.defense_instance || "New Defense";
    if (!acc[key]) acc[key] = [];
    acc[key].push(upg);
    return acc;
  }, {});

  return (
    <div>
      <h2>Available Upgrades</h2>
      {Object.entries(grouped).map(([defenseInstance, ups]) => (
        <div key={defenseInstance} style={{ marginBottom: "1rem" }}>
          <h3>{defenseInstance}</h3>
          <ul>
            {ups.map((upg) => (
              <li key={upg.id}>
                {upg.defense_name} - Upgrade to level {upg.level} (Current: {upg.current_level})  
                Cost: {upg.build_cost} {upg.build_resource} — Time: {upg.build_time_seconds}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}; // <-- closing the component function here

export default AvailableUpgrades;
