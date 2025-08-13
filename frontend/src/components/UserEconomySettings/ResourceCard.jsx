import React from 'react';
import { formatNumber } from './utils';

/**
 * Presentational card for a resource (Gold/Elixir).
 *
 * Props:
 *  - title: string
 *  - amount: number (current stored amount)
 *  - produced: number (available to collect)
 *  - onCollect: function
 *  - disabled: boolean
 *  - className: optional tailwind classes to style card
 */
export default function ResourceCard({ title, amount = 0, produced = 0, onCollect, disabled, className = '' }) {
  return (
    <div className={`p-6 rounded-lg shadow-md flex flex-col justify-between items-center ${className}`}>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-4xl font-bold mb-2">{formatNumber(amount)}</p>
      <p className="text-sm text-gray-500 mb-4">+ {formatNumber(produced)} available to collect</p>
      <button
        onClick={onCollect}
        className="w-full font-semibold py-3 px-6 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
      >
        Collect {title}
      </button>
    </div>
  );
}
