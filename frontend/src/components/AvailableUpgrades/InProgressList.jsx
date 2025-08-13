import React from 'react';
import { formatTimeSeconds, formatFinishTime } from './utils';

/**
 * Presentational component that shows in-progress upgrades.
 * Props:
 *  - inProgress: array of upgrade rows with fields { id, defense_instance_name, upgrade_level, time_remaining, finishes_at }
 */
export default function InProgressList({ inProgress = [] }) {
  if (!inProgress || inProgress.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md text-center text-gray-500">
        <p>You have no upgrades in progress.</p>
        <p className="mt-2">
          This could mean all defenses are at max level, all builders are busy, or there are unplaced defenses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inProgress.map((upg) => (
        <div key={upg.id} className="p-4 bg-white rounded-lg shadow-md border-l-4 border-indigo-500">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">{upg.defense_instance_name}</h3>
            <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              Upgrading to Lvl. {upg.upgrade_level}
            </span>
          </div>
          <p className="text-gray-600 mt-2">
            Time remaining: <strong className="text-indigo-600">{formatTimeSeconds(upg.time_remaining)}</strong>
          </p>
          <p className="text-gray-500 text-sm">
            Finishes at: <strong className="text-gray-700">{formatFinishTime(upg.finishes_at)}</strong>
          </p>
        </div>
      ))}
    </div>
  );
}
