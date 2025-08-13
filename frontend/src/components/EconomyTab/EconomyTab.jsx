import React, { useEffect, useState } from 'react';

/**
 * EconomyTab fetches and displays a user's economy information (gold, elixir, builders, etc.)
 *
 * @param {Object} props - Component props
 * @param {string} props.userId - ID of the user
 * @param {any} props.refreshFlag - Trigger to re-fetch economy data when changed
 */
export default function EconomyTab({ userId, refreshFlag }) {
  const [economy, setEconomy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError("No user ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/economy/status?userId=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Optionally apply gold pass logic here
        if (data.has_gold_pass) {
          data.gold_amount = Math.floor(data.gold_amount);
        }
        setEconomy(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId, refreshFlag]); // Re-run effect when userId or refreshFlag changes

  if (loading) return <p>Loading economy data...</p>;
  if (error) return <p>Error loading economy data: {error}</p>;
  if (!economy) return <p>No economy data available.</p>;

  const hoursTotal = Math.floor(economy.total_time_seconds / 3600);
  const hoursWithBuilders =
    economy.builders_count && economy.builders_count > 0
      ? Math.floor(hoursTotal / economy.builders_count)
      : 'N/A';

  return (
    <div>
      <h2>Economy Overview</h2>
      <p>Gold: {economy.gold_amount}</p>
      <p>Elixir: {economy.elixir_amount}</p>
      <p>Has Gold Pass: {economy.has_gold_pass ? 'Yes' : 'No'}</p>
      <p>Gold Needed to Max: {economy.total_gold_needed}</p>
      <p>
        Total Time to Max: {hoursTotal} hours, or {hoursWithBuilders} hours with {economy.builders_count || 1} builders
      </p>
    </div>
  );
}
