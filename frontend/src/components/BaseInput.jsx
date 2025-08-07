import React, { useState } from 'react';

const maxInstancesByType = {
  'Air Defense': 4,
  'Air Sweeper': 2,
  'Archer Tower': 10,
  'Bomb Tower': 2,
  'Builder Hut': 5,
  'Cannon': 8,
  'Eagle Artillery': 1,
  'Fire Spitter': 2,
  'Hidden Tesla': 5,
  'Inferno Tower': 3,
  'Monolith': 1,
  'Mortar': 4,
  'Multi Archer Tower': 2,
  'Multi Gear Tower': 1,
  'Ricochet Cannon': 2,
  'Scattershot': 2,
  'Spell Tower': 2,
  'Wizard Tower': 5,
  'X-Bow': 4,
  'Town Hall': 1,
};


const BaseInput = ({ type, onChange }) => {
  const maxInstances = maxInstancesByType[type] || 10; // default max if not set
  const [instances, setInstances] = useState([{ level: '' }]);

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
      {instances.map((instance, index) => (
        <div key={index} className="instance-row">
          <label>
            Level of {type} #{index + 1}:
            <input
              type="number"
              min="1"
              value={instance.level}
              onChange={e => handleInstanceChange(index, e.target.value)}
              
            />
          </label>
          {instances.length > 1 && (
            <button type="button" onClick={() => removeInstance(index)}>
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addInstance}
        disabled={instances.length >= maxInstances}
      >
        Add another {type}
      </button>
      {instances.length >= maxInstances && (
        <p style={{ color: 'red' }}>Maximum of {maxInstances} {type}s reached.</p>
      )}
    </div>
  );
};

export default BaseInput;
