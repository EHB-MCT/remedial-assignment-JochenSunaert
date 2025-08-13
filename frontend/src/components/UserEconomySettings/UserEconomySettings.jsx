/**
 * Container component for User Economy settings.
 * Uses the useUserEconomySettings hook and renders ResourceCard components.
 *
 * Props:
 *  - userId: string (required)
 *
 * This component is intentionally light — most logic lives in the hook.
 */

import React from 'react';
import { ToastContainer } from 'react-toastify';
import useUserEconomySettings from './useUserEconomySettings';
import ResourceCard from './ResourceCard';

export default function UserEconomySettings({ userId }) {
  const {
    economy,
    producedGold,
    producedElixir,
    loading,
    refresh,
    updateSettings,
    collectGold,
    collectElixir,
  } = useUserEconomySettings(userId);

  if (loading) return <p>Loading economy...</p>;

  // local handlers for form inputs (keep state inside hook in more advanced refactor)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings({});
    } catch (err) {
      // updateSettings already shows toast; no-op
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-inter">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">User Economy</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ResourceCard
            title="Gold"
            amount={economy?.gold_amount || 0}
            produced={producedGold}
            onCollect={collectGold}
            disabled={producedGold === 0}
            className="bg-yellow-50 text-center"
          />

          <ResourceCard
            title="Elixir"
            amount={economy?.elixir_amount || 0}
            produced={producedElixir}
            onCollect={collectElixir}
            disabled={producedElixir === 0}
            className="bg-purple-50 text-center"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-inner">
            <label htmlFor="gold-pass" className="text-lg font-medium text-gray-700 flex-1">Gold Pass</label>
            <input
              id="gold-pass"
              type="checkbox"
              checked={Boolean(economy?.has_gold_pass)}
              onChange={(e) => updateSettings({ has_gold_pass: e.target.checked })}
              className="w-6 h-6 rounded text-green-600 focus:ring-green-500 transition-colors duration-200"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-inner">
            <label htmlFor="builders-count" className="text-lg font-medium text-gray-700 flex-1">Builders Count</label>
            <input
              id="builders-count"
              type="number"
              min="1"
              value={economy?.builders_count || 0}
              onChange={(e) => updateSettings({ builders_count: Number(e.target.value) })}
              className="w-24 text-center rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Update Settings
          </button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={refresh} className="underline text-sm text-gray-500">Refresh</button>
        </div>
      </div>
    </div>
  );
}
