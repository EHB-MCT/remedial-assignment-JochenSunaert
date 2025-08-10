import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserEconomySettings({ userId }) {
  const [economy, setEconomy] = useState({
    has_gold_pass: false,
    builders_count: 4,
    gold_amount: 0,
    elixir_amount: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const url = `/api/user-economy/${userId}`;
    console.log("Fetching economy data from:", url);
    fetch(url)
      .then((res) => {
        console.log("Response status for GET economy:", res.status);
        return res.text();
      })
      .then((text) => {
        console.log("Raw GET response:", text);
        try {
          const data = JSON.parse(text);
          setEconomy(data);
        } catch (err) {
          console.error("Error parsing JSON from GET:", err);
        }
      });
  }, [userId]);

 const handleSubmit = async (e) => {
    e.preventDefault();
    const url = '/api/user-economy/status';
    console.log("Sending update to:", url, "with body:", { userId, ...economy });

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...economy }),
    });

    console.log("Response status for POST update:", res.status);
    const text = await res.text();
    console.log("Raw POST response:", text);

    try {
      const data = JSON.parse(text);
      console.log("Parsed POST response JSON:", data);
      if (data.success) {
        alert('Economy updated!');
        navigate('/home');  // <-- redirect here instead of '/'
      } else {
        alert('Update failed.');
      }
    } catch (err) {
      console.error("Error parsing JSON from POST:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Gold Pass:
        <input
          type="checkbox"
          checked={economy.has_gold_pass}
          onChange={(e) => setEconomy({ ...economy, has_gold_pass: e.target.checked })}
        />
      </label>
      <br />
      <label>
        Builders Count:
        <input
          type="number"
          min="1"
          value={economy.builders_count}
          onChange={(e) => setEconomy({ ...economy, builders_count: Number(e.target.value) })}
        />
      </label>
      <br />
      <label>
        Gold Amount:
        <input
          type="number"
          min="0"
          value={economy.gold_amount}
          onChange={(e) => setEconomy({ ...economy, gold_amount: Number(e.target.value) })}
        />
      </label>
      <br />
      <label>
        Elixir Amount:
        <input
          type="number"
          min="0"
          value={economy.elixir_amount}
          onChange={(e) => setEconomy({ ...economy, elixir_amount: Number(e.target.value) })}
        />
      </label>
      <br />
      <button type="submit">Update Economy</button>
    </form>
  );
}
