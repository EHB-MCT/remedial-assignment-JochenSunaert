import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// The pre-configured supabase client from your root client file
import { supabase } from '../client.js';

/**
 * A React component that manages the user's economy settings with Supabase persistence.
 * @param {object} props The component props.
 * @param {string} props.userId The ID of the current user.
 */
export default function UserEconomySettings({ userId }) {
  const navigate = useNavigate();

  // State to hold the user's economy data from Supabase.
  const [economy, setEconomy] = useState({
    user_id: userId,
    has_gold_pass: false,
    builders_count: 4,
    gold_amount: 0,
    elixir_amount: 0,
    dark_elixir_amount: 0,
    last_seen_at: null,
  });

  // State for resources produced in real-time, waiting to be collected
  const [producedGold, setProducedGold] = useState(0);
  const [producedElixir, setProducedElixir] = useState(0);

  // Constants for game logic
  const RESOURCE_CAP = 24000000;
  const GOLD_PRODUCTION_RATE_PER_SECOND = 500;
  const ELIXIR_PRODUCTION_RATE_PER_SECOND = 500;
  // User's local timezone is ahead of the UTC database timezone.
  const TIMEZONE_OFFSET_HOURS = 2;

  /**
   * Calculates offline production based on the last_seen_at timestamp.
   * This version explicitly subtracts the timezone offset to correct the time difference.
   * @param {object} data The user's economy data.
   */
  const calculateInitialOfflineProduction = useCallback((data) => {
    if (!data || !data.last_seen_at) {
      setProducedGold(0);
      setProducedElixir(0);
      return;
    }

    // Convert the database timestamp string to a Date object.
    const lastSeenDate = new Date(data.last_seen_at);
    
    // Get the current local time.
    const currentDate = new Date();

    // Calculate the raw time difference in milliseconds.
    const rawTimeDifferenceMillis = currentDate.getTime() - lastSeenDate.getTime();
    
    // --- CRITICAL FIX: Explicitly subtract the timezone offset. ---
    // The offset in milliseconds is 2 hours * 60 minutes * 60 seconds * 1000 milliseconds.
    const timezoneOffsetMillis = TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000;

    // The corrected time difference for the offline calculation.
    const correctedTimeDifferenceMillis = Math.max(0, rawTimeDifferenceMillis - timezoneOffsetMillis);

    const timeDifferenceInSeconds = Math.floor(correctedTimeDifferenceMillis / 1000);
    
    const goldProducedOffline = timeDifferenceInSeconds * GOLD_PRODUCTION_RATE_PER_SECOND;
    const elixirProducedOffline = timeDifferenceInSeconds * ELIXIR_PRODUCTION_RATE_PER_SECOND;

    // We only show the toast if a substantial amount has been produced.
    if (goldProducedOffline > 100 || elixirProducedOffline > 100) {
      toast.info(`Welcome back! You produced ${goldProducedOffline.toLocaleString()} gold and ${elixirProducedOffline.toLocaleString()} elixir while you were away.`);
    }
    
    setProducedGold(goldProducedOffline);
    setProducedElixir(elixirProducedOffline);
  }, []);

  /**
   * This useEffect is now responsible for the initial data fetch and the offline calculation.
   * It runs once on mount.
   */
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('user_economy')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setEconomy(data);
          calculateInitialOfflineProduction(data);
        } else {
          const initialData = {
            user_id: userId,
            has_gold_pass: false,
            builders_count: 4,
            gold_amount: 0,
            elixir_amount: 0,
            dark_elixir_amount: 0,
            last_seen_at: new Date().toISOString(),
          };
          setEconomy(initialData);
          await supabase.from('user_economy').upsert(initialData, { onConflict: 'user_id' });
        }
      } catch (err) {
        console.error("Error fetching initial economy data:", err.message);
        toast.error("Failed to load initial user economy data.");
      }
    };
    fetchInitialData();
  }, [userId, calculateInitialOfflineProduction]);

  /**
   * This useEffect handles the real-time production counter.
   * It remains unchanged and is separate from the polling logic.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setProducedGold(prev => prev + GOLD_PRODUCTION_RATE_PER_SECOND);
      setProducedElixir(prev => prev + ELIXIR_PRODUCTION_RATE_PER_SECOND);
    }, 1000); // Update every second

    return () => {
      clearInterval(interval);
    };
  }, []);

  /**
   * Handles the form submission to update builders count and gold pass status.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const updatedEconomy = {
      ...economy,
      // IMPORTANT: Always save the timestamp in a universal format (UTC).
      last_seen_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('user_economy')
        .upsert(updatedEconomy, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }
      
      toast.success('Economy updated successfully!');
    } catch (err) {
      console.error("Error updating economy:", err.message);
      toast.error(`Update failed: ${err.message}`);
    }
  };

  /**
   * Handles the collection of gold.
   */
  const handleCollectGold = async () => {
    const newGoldAmount = Math.min(economy.gold_amount + producedGold, RESOURCE_CAP);
    const updatedEconomy = {
      ...economy,
      gold_amount: newGoldAmount,
      last_seen_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('user_economy')
        .upsert(updatedEconomy, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }
      
      toast.info(`Collected ${producedGold.toLocaleString()} gold!`);
      // Optimistically reset produced gold to 0 for a snappier feel.
      setProducedGold(0); 
    } catch (err) {
      console.error("Error collecting gold:", err.message);
      toast.error(`Collection failed: ${err.message}`);
    }
  };

  /**
   * Handles the collection of elixir.
   */
  const handleCollectElixir = async () => {
    const newElixirAmount = Math.min(economy.elixir_amount + producedElixir, RESOURCE_CAP);
    const updatedEconomy = {
      ...economy,
      elixir_amount: newElixirAmount,
      last_seen_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('user_economy')
        .upsert(updatedEconomy, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }
      
      toast.info(`Collected ${producedElixir.toLocaleString()} elixir!`);
      // Optimistically reset produced elixir to 0 for a snappier feel.
      setProducedElixir(0); 
    } catch (err) {
      console.error("Error collecting elixir:", err.message);
      toast.error(`Collection failed: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-inter">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">User Economy</h1>
        
        {/* Resource Displays with Collection Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-yellow-50 p-6 rounded-lg shadow-md flex flex-col justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Gold</h2>
            <p className="text-4xl font-bold text-yellow-600 mb-2">
              {economy.gold_amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              + {producedGold.toLocaleString()} available to collect
            </p>
            <button
              onClick={handleCollectGold}
              className="w-full bg-yellow-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-yellow-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={producedGold === 0}
            >
              Collect Gold
            </button>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg shadow-md flex flex-col justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Elixir</h2>
            <p className="text-4xl font-bold text-purple-600 mb-2">
              {economy.elixir_amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              + {producedElixir.toLocaleString()} available to collect
            </p>
            <button
              onClick={handleCollectElixir}
              className="w-full bg-purple-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-purple-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={producedElixir === 0}
            >
              Collect Elixir
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Builders and Gold Pass controls */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-inner">
            <label htmlFor="gold-pass" className="text-lg font-medium text-gray-700 flex-1">
              Gold Pass
            </label>
            <input
              id="gold-pass"
              type="checkbox"
              checked={economy.has_gold_pass}
              onChange={(e) => setEconomy({ ...economy, has_gold_pass: e.target.checked })}
              className="w-6 h-6 rounded text-green-600 focus:ring-green-500 transition-colors duration-200"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-inner">
            <label htmlFor="builders-count" className="text-lg font-medium text-gray-700 flex-1">
              Builders Count
            </label>
            <input
              id="builders-count"
              type="number"
              min="1"
              value={economy.builders_count}
              onChange={(e) => setEconomy({ ...economy, builders_count: Number(e.target.value) })}
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
      </div>
    </div>
  );
}
