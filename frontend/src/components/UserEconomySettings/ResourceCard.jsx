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
    <div className={`economyuser ${className}`}>
      <h2 >{title}</h2>
      <p >{formatNumber(amount)}</p>
      <p >+ {formatNumber(produced)} available to collect</p>
      <button class="collect-button"
        onClick={onCollect}
  
        disabled={disabled}
      >
        Collect {title}
      </button>
    </div>
  );
}
