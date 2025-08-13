import React, { useState } from 'react';
import { computeDiscountedValue, formatTimeSeconds } from './utils';

/**
 * Single available-upgrade row. Handles the start button UI state.
 *
 * Props:
 *  - upgrade: the upgrade object (id, level, build_cost, build_resource, build_time_seconds)
 *  - defenseInstance: string
 *  - onStart(upgrade, defenseInstance): callback
 *  - economy: economy snapshot
 */
export default function UpgradeItem({ upgrade, defenseInstance, onStart, economy }) {
  const [loading, setLoading] = useState(false);
  const hasGoldPass = economy?.has_gold_pass;

  const discountedCost = computeDiscountedValue(upgrade.build_cost, hasGoldPass);
  const discountedTime = computeDiscountedValue(upgrade.build_time_seconds, hasGoldPass);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onStart(upgrade, defenseInstance);
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
      <div>
        <p className="text-gray-800">
          Upgrade to level <span className="font-bold">{upgrade.level}</span>
        </p>
        <p className="text-sm text-gray-500">
          Cost: <span className="font-medium text-gray-700">{discountedCost} {upgrade.build_resource}</span>
          {" | "}
          Time: <span className="font-medium text-gray-700">{formatTimeSeconds(discountedTime)}</span>
        </p>
      </div>
      <button
        onClick={handleClick}
        className={`text-white font-semibold py-2 px-4 rounded-full transition-all duration-200 ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 shadow-md'
        }`}
        disabled={loading}
      >
        {loading ? 'Starting...' : 'Start Upgrade'}
      </button>
    </li>
  );
}
