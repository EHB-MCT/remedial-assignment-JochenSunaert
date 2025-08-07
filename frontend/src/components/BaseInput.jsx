// import UserInputForm from '../components/UserInputForm';

// export default function BaseInput() {
//   return (
//     <div>
//       <h2>Create Your Base</h2>
//       <UserInputForm />
//     </div>
//   );
// }

import React, { useState } from 'react';

const BaseInput = ({ type, onChange }) => {
  const [instances, setInstances] = useState([{ level: '' }]);

  const handleInstanceChange = (index, value) => {
    const updated = [...instances];
    updated[index].level = value;
    setInstances(updated);
    onChange(type, updated.map((i) => parseInt(i.level) || 0));
  };

  const addInstance = () => {
    setInstances([...instances, { level: '' }]);
  };

  const removeInstance = (index) => {
    const updated = instances.filter((_, i) => i !== index);
    setInstances(updated);
    onChange(type, updated.map((i) => parseInt(i.level) || 0));
  };

  return (
    <div className="base-input">
      <h3>{type}</h3>
      {instances.map((instance, index) => (
        <div key={index} className="instance-row">
          <label>
            Level of {type} #{index + 1}:
            <input
              type="number"
              min="1"
              value={instance.level}
              onChange={(e) => handleInstanceChange(index, e.target.value)}
            />
          </label>
          {instances.length > 1 && (
            <button type="button" onClick={() => removeInstance(index)}>
              Remove
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={addInstance}>
        Add another {type}
      </button>
    </div>
  );
};

export default BaseInput;
