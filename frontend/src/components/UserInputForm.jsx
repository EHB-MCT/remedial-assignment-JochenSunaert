import React, { useState } from 'react';
import BaseInput from './BaseInput';

const UserInputForm = ({ user }) => {
  const [baseData, setBaseData] = useState({});
  const [builderCount, setBuilderCount] = useState(5);
  const [goldPass, setGoldPass] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleBaseChange = (type, levels) => {
    setBaseData((prev) => ({
      ...prev,
      [type]: levels,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');

    try {
      // 1. Save base data
      const baseRes = await fetch('http://localhost:3001/api/userdata/base-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          baseData,
        }),
      });

      if (!baseRes.ok) throw new Error('Failed to save base data');

      // 2. Save user settings
      const settingsRes = await fetch('http://localhost:3001/api/userdata/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          builder_count: builderCount,
          gold_pass: goldPass,
        }),
      });

      if (!settingsRes.ok) throw new Error('Failed to save settings');

      setStatusMessage('✅ Base and settings saved!');
    } catch (err) {
      console.error('Error saving data:', err);
      setStatusMessage('❌ Error saving data');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Set up your base</h2>

      <BaseInput type="Archer Tower" onChange={handleBaseChange} />
      <BaseInput type="Cannon" onChange={handleBaseChange} />
      <BaseInput type="X-Bow" onChange={handleBaseChange} />
      <BaseInput type="Mortar" onChange={handleBaseChange} />
      {/* Add more BaseInput components as needed */}

      <div style={{ marginTop: '2rem' }}>
        <label>
          Builder Count:
          <input
            type="number"
            value={builderCount}
            min={1}
            max={6}
            onChange={(e) => setBuilderCount(Number(e.target.value))}
          />
        </label>
      </div>

      <div>
        <label>
          Gold Pass:
          <input
            type="checkbox"
            checked={goldPass}
            onChange={(e) => setGoldPass(e.target.checked)}
          />
        </label>
      </div>

      <button type="submit" style={{ marginTop: '1rem' }}>
        Save Base
      </button>

      {statusMessage && <p>{statusMessage}</p>}
    </form>
  );
};

export default UserInputForm;
