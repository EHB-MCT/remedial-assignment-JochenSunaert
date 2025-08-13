import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useAvailableUpgrades from './useAvailableUpgrades';
import InProgressList from './InProgressList';
import AvailableList from './AvailableList';

/**
 * Container component for the AvailableUpgrades feature.
 * Uses a custom hook that encapsulates all data fetching and actions.
 *
 * Props:
 *  - userId: string (required)
 */
export default function AvailableUpgrades({ userId }) {
  const {
    economy,
    upgrades,
    inProgress,
    isLoading,
    startUpgrade,
    refresh,
  } = useAvailableUpgrades(userId);

  if (isLoading) return <p>Loading available upgrades...</p>;

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto my-8 space-y-8">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">In-Progress Upgrades</h2>
        <p className="text-gray-600 mt-2">
          ({inProgress.length}/{economy?.builders_count || 0} builders busy)
        </p>
      </div>

      <button
        onClick={refresh}
        className="w-full bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-200"
      >
        Refresh Data
      </button>

      <InProgressList inProgress={inProgress} />

      <hr className="border-gray-300" />

      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Available Upgrades</h2>
      </div>

      <AvailableList upgrades={upgrades} onStart={startUpgrade} economy={economy} />
    </div>
  );
}
