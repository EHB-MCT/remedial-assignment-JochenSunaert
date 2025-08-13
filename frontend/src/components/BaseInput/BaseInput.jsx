import React, { useState, useEffect } from 'react';

/**
 * BaseInput renders an input group for a specific type of base building/defense.
 * Supports multiple instances, dynamic adding/removing, and enforces maximum instances.
 *
 * @param {Object} props - Component props
 * @param {string} props.type - Type of building (e.g., "Cannon")
 * @param {number[]} [props.initialLevels=[]] - Initial levels for pre-population
 * @param {function} props.onChange - Callback when levels change: `(type, levels) => void`
 */
const BaseInput = ({ type, initialLevels = [], onChange }) => {
  const maxInstances = maxInstancesByType[type] || 10;

  // Track input values for each instance
  const [instances, setInstances] = useState(
    initialLevels.length > 0
      ? initialLevels.map(level => ({ level: level === 0 ? '' : String(level) }))
      : [{ level: '' }]
  );

  // Sync state when initialLevels changes from parent
  useEffect(() => {
    setInstances(
      initialLevels.length > 0
        ? initialLevels.map(level => ({ level: level === 0 ? '' : String(level) }))
        : [{ level: '' }]
    );
  }, [initialLevels]);

  const handleInstanceChange = (index, value) => {
    const updated = [...instances];
    updated[index].level = value;
    setInstances(updated);
    onChange(type, updated.map(i => parseInt(i.level) || 0));
  };

  const addInstance = () => {
    if (instances.length < maxInstances) {
      const newInstances = [...instances, { level: '' }];
      setInstances(newInstances);
      onChange(type, newInstances.map(i => parseInt(i.level) || 0));
    }
  };

  const removeInstance = (index) => {
    const updated = instances.filter((_, i) => i !== index);
    setInstances(updated);
    onChange(type, updated.map(i => parseInt(i.level) || 0));
  };

  return (
    <div className="base-input">
      <h3>{type} (max {maxInstances})</h3>
      {instances.map((instance, idx) => (
        <div key={idx} style={{ display: 'flex', marginBottom: '0.5rem' }}>
          <input
            type="number"
            value={instance.level}
            onChange={(e) => handleInstanceChange(idx, e.target.value)}
            min="0"
            max="100"
            placeholder="Level"
            style={{ width: '80px', marginRight: '0.5rem' }}
          />
          {instances.length > 1 && (
            <button type="button" onClick={() => removeInstance(idx)}>
              ❌
            </button>
          )}
        </div>
      ))}
      {instances.length < maxInstances && (
        <button type="button" onClick={addInstance}>
          ➕ Add {type}
        </button>
      )}
    </div>
  );
};

// Maximum instances allowed per building type
const maxInstancesByType = {
  'Town Hall': 1,
  'Eagle Artillery': 1,
  'Air Sweeper': 1,
  'Air Defense': 4,
  'Cannon': 6,
  'Archer Tower': 6,
  'Wizard Tower': 4,
  'Mortar': 4,
  'Hidden Tesla': 4,
  'Inferno Tower': 3,
  'Multi Archer Tower': 2,
  'Multi Gear Tower': 2,
  'Scattershot': 2,
  'Ricochet Cannon': 2,
  'Spell Tower': 1,
  'Fire Spitter': 1,
  'Monolith': 1,
  'Builder Hut': 5,
  'X-Bow': 4,
};

export default BaseInput;
