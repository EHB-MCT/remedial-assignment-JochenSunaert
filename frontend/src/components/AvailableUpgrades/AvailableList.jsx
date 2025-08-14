import React from 'react';
import UpgradeItem from './UpgradeItem';

/**
 * Presentational component for available upgrades grouped by instance.
 * Props:
 *  - upgrades: array of { defense_instance, current_level, available_upgrades: [...] }
 *  - onStart(upgrade, defenseInstance)
 *  - economy: user economy object (for client-side hints)
 */
export default function AvailableList({ upgrades = [], onStart, economy }) {
  if (!upgrades || upgrades.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md text-center text-gray-500">
        <p>You have no available upgrades at this time.</p>
        <p className="mt-2">
          This could mean all defenses are at max level, all builders are busy, or there are unplaced defenses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 available-upgrades-list">
      {upgrades.map((instance) => (
        <div key={instance.defense_instance} className="p-4 bg-white rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{instance.defense_instance}</h3>
          <p className="text-gray-600">Current Level: {instance.current_level}</p>
          <ul className="mt-4 space-y-3">
            {instance.available_upgrades.map((upg) => (
              <UpgradeItem
                key={`${instance.defense_instance}-${upg.id}`}
                upgrade={upg}
                defenseInstance={instance.defense_instance}
                onStart={onStart}
                economy={economy}
              />
              
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
