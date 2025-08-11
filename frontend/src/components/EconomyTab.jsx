import React, { useEffect, useState } from 'react';

export default function EconomyTab({ userId }) {
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
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        // Apply gold pass discount here if needed (or trust backend)
        if (data.has_gold_pass) {
          data.gold_amount = Math.floor(data.gold_amount); // or apply any logic if needed
        }
        setEconomy(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

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
