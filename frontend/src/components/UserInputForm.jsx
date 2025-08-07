import React, { useState } from 'react';
import { supabase } from '../client';
import BaseInput from './BaseInput';

export default function UserInputForm({ user }) {
  const [baseData, setBaseData] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleBaseChange = (type, levels) => {
    setBaseData(prev => ({
      ...prev,
      [type]: levels,
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setStatusMessage('');
    setIsSaving(true);

    try {
      // Flatten baseData into array of records matching your DB columns
      const records = [];

      Object.entries(baseData).forEach(([type, levels]) => {
        levels.forEach((level, idx) => {
          if (level > 0) {  // Only save levels > 0
            records.push({
              user_id: user.id,
              name: `${type} #${idx + 1}`, // You can customize this
              type: type,
              instance: idx + 1,
              current_level: level,
            });
          }
        });
      });

      if (records.length === 0) {
        setStatusMessage('Please enter at least one base instance.');
        setIsSaving(false);
        return;
      }

 const { data, error } = await supabase
  .from('user_base_data')
  .upsert(records, {
    onConflict: ['user_id', 'type', 'instance']
  });


      if (error) throw error;

      setStatusMessage('✅ Base data saved successfully!');
    } catch (error) {
      setStatusMessage('❌ Error saving base data: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Set up your base</h2>

      <BaseInput type="Archer Tower" onChange={handleBaseChange} />
      <BaseInput type="Cannon" onChange={handleBaseChange} />
      <BaseInput type="X-Bow" onChange={handleBaseChange} />
      <BaseInput type="Mortar" onChange={handleBaseChange} />
      {/* Add more BaseInput components as needed */}

      <button type="submit" disabled={isSaving} style={{ marginTop: '1rem' }}>
        {isSaving ? 'Saving...' : 'Save Base'}
      </button>

      {statusMessage && <p>{statusMessage}</p>}
    </form>
  );
}
