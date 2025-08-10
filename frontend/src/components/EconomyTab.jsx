import React, { useEffect, useState } from 'react';

export default function EconomyTab({ userId }) {
  const [economy, setEconomy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch('http://localhost:3001/api/healthcheck')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));


    fetch(`http://localhost:3001/api/economy/status?userId=${userId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Economy data:', data);
        setEconomy(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p>Loading economy data...</p>;
  if (error) return <p>Error loading economy data: {error}</p>;
  if (!economy) return <p>No economy data available.</p>;

  return (
    <div>
      <h2>Economy Overview</h2>
      <p>Gold: {economy.gold_amount}</p>
      <p>Elixir: {economy.elixir_amount}</p>
      <p>Has Gold Pass: {economy.has_gold_pass ? 'Yes' : 'No'}</p>
      <p>Gold Needed to Max: {economy.total_gold_needed}</p>
      <p>Total Time to Max: {Math.floor(economy.total_time_seconds / 3600)} hours</p>
    </div>
  );
}
