/**
 * ProfileTab.jsx
 *
 * Displays and edits the user's base profile (defensive structures + levels).
 * - Loads the user's `user_base_data` rows from Supabase.
 * - Presents one BaseInput component per defense type.
 * - On submit, upserts all non-zero defense entries back to Supabase.
 *
 * Notes:
 * - This component expects `user` prop containing at least `user.id`.
 * - The Supabase row shape for user_base_data is expected to be:
 *   { user_id, name, type, instance, current_level }
 * - Upsert uses `onConflict: ['user_id', 'type', 'instance']` to ensure unique
 *   defense instances per user.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../client';
import BaseInput from '../components/BaseInput/BaseInput';

/**
 * Ordered list of defense types that the UI renders.
 * The order determines the rendering order on the profile page.
 */
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

/**
 * ProfileTab component
 *
 * @param {Object} props
 * @param {Object} props.user - The current user object (must include `id`)
 */
export default function ProfileTab({ user }) {
  // Local keyed representation of the base data:
  // {
  //   "Cannon": [2, 5, 0],   // cannon #1 = level 2, cannon #2 = level 5, cannon #3 = 0 (unplaced)
  //   "Mortar": [3],         // mortar #1 = level 3
  //   ...
  // }
  const [baseData, setBaseData] = useState({});

  // Status and UI state
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch saved user base data on mount or when user.id changes.
   * - Queries Supabase for `user_base_data` rows for the current user.
   * - Transforms the flat row array into the grouped `baseData` structure
   *   expected by BaseInput (an array indexed by instance-1).
   */
  useEffect(() => {
    async function fetchBaseData() {
      setLoading(true);
      setStatusMessage('');

      // Defensive: ensure we have a user id to query
      if (!user?.id) {
        setStatusMessage('User ID missing.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_base_data')
        .select('type, instance, current_level')
        .eq('user_id', user.id);

      if (error) {
        // Show a friendly error message in the UI
        setStatusMessage('❌ Error loading data: ' + error.message);
        setLoading(false);
        return;
      }

      // Convert rows to grouped structure keyed by defense type
      const grouped = {};
      data.forEach(({ type, instance, current_level }) => {
        // Ensure an array exists for this defense type
        if (!grouped[type]) grouped[type] = [];

        // Instances are 1-based in DB; store at index (instance - 1)
        grouped[type][instance - 1] = current_level;
      });

      // Ensure every DEFENSE_TYPE has an entry (even if empty array)
      // This keeps rendering predictable for BaseInput components.
      DEFENSE_TYPES.forEach((type) => {
        if (!grouped[type]) grouped[type] = [];
      });

      setBaseData(grouped);
      setLoading(false);
    }

    fetchBaseData();
  }, [user?.id]);

  /**
   * Update handler passed to BaseInput child components.
   * Receives the defense type and updated levels array.
   *
   * @param {string} type - Defense type name (e.g., 'Cannon')
   * @param {number[]} levels - Array of levels indexed by instance-1
   */
  const handleBaseChange = (type, levels) => {
    setBaseData((prev) => ({
      ...prev,
      [type]: levels,
    }));
  };

  /**
   * Form submit handler: gathers all non-zero defense entries and upserts them.
   * - Builds an array of records conforming to user_base_data table shape.
   * - Uses upsert with conflict on (user_id, type, instance) to update existing rows.
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setStatusMessage('');
    setIsSaving(true);

    try {
      const records = [];

      // Walk the grouped structure and emit DB rows for non-zero levels
      Object.entries(baseData).forEach(([type, levels]) => {
        // levels may be undefined or an array
        (levels || []).forEach((level, idx) => {
          // Only persist placed defenses (level > 0)
          if (level > 0) {
            records.push({
              user_id: user.id,
              name: `${type} #${idx + 1}`, // Friendly instance name
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

      // Upsert the records. `onConflict` ensures uniqueness per user/type/instance.
      const { error } = await supabase
        .from('user_base_data')
        .upsert(records, {
          onConflict: ['user_id', 'type', 'instance'],
        });

      if (error) throw error;

      setStatusMessage('✅ Base data saved successfully!');
    } catch (error) {
      // Show a helpful message to the user and keep the app usable
      setStatusMessage('❌ Error saving base data: ' + (error?.message || error));
    } finally {
      setIsSaving(false);
    }
  }

  // Loading state while initial data is being fetched
  if (loading) return <p>Loading base data...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Your Base Profile</h2>

      {/* Render one BaseInput per defense type.
          BaseInput is expected to call onChange(type, levels) when values change. */}
      {DEFENSE_TYPES.map((type) => (
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

      {/* Status message area: success or error feedback */}
      {statusMessage && <p>{statusMessage}</p>}
    </form>
  );
}
