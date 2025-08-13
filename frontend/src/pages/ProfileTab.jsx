import React, { useState, useEffect } from 'react';
import { supabase } from '../client';
import BaseInput from '../components/BaseInput/BaseInput';

const DEFENSE_TYPES = [
  'Air Defense',
  'Air Sweeper',
  'Archer Tower',
  'Bomb Tower',
  'Builder Hut',
  'Cannon',
  'Eagle Artillery',
  'Fire Spitter',
  'Hidden Tesla',
  'Inferno Tower',
  'Monolith',
  'Mortar',
  'Multi Archer Tower',
  'Multi Gear Tower',
  'Ricochet Cannon',
  'Scattershot',
  'Spell Tower',
  'Wizard Tower',
  'X-Bow',
  'Town Hall',
];

export default function ProfileTab({ user }) {
  const [baseData, setBaseData] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved base data on mount
  useEffect(() => {
    async function fetchBaseData() {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_base_data')
        .select('type, instance, current_level')
        .eq('user_id', user.id);

      if (error) {
        setStatusMessage('❌ Error loading data: ' + error.message);
        setLoading(false);
        return;
      }

      // Transform fetched data into { type: [levels] }
      const grouped = {};
      data.forEach(({ type, instance, current_level }) => {
        if (!grouped[type]) grouped[type] = [];
        grouped[type][instance - 1] = current_level;
      });

      // Fill missing instances with 0
      DEFENSE_TYPES.forEach(type => {
        if (!grouped[type]) {
          grouped[type] = [];
        }
      });

      setBaseData(grouped);
      setLoading(false);
    }

    fetchBaseData();
  }, [user.id]);

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
      const records = [];

      Object.entries(baseData).forEach(([type, levels]) => {
        levels.forEach((level, idx) => {
          if (level > 0) {
            records.push({
              user_id: user.id,
              name: `${type} #${idx + 1}`,
              type,
              instance: idx + 1,
              current_level: level,
            });
          }
        });
      });

      if (records.length === 0) {
        setStatusMessage('Please enter at least one defense level.');
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('user_base_data')
        .upsert(records, {
          onConflict: ['user_id', 'type', 'instance'],
        });

      if (error) throw error;

      setStatusMessage('✅ Base data saved successfully!');
    } catch (error) {
      setStatusMessage('❌ Error saving base data: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) return <p>Loading base data...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Your Base Profile</h2>

      {DEFENSE_TYPES.map(type => (
        <BaseInput
          key={type}
          type={type}
          initialLevels={baseData[type] || []}
          onChange={handleBaseChange}
        />
      ))}

      <button type="submit" disabled={isSaving} style={{ marginTop: '1rem' }}>
        {isSaving ? 'Saving...' : 'Save Base'}
      </button>

      {statusMessage && <p>{statusMessage}</p>}
    </form>
  );
}
