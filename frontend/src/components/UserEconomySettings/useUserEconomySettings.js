/**
 * Hook encapsulating all data and actions for the UserEconomySettings UI.
 *
 * Responsibilities:
 *  - fetch initial economy row (or create it)
 *  - compute offline production using last_seen_at
 *  - run live production counters (per-second)
 *  - expose handlers: collectGold, collectElixir, updateSettings, refresh
 *
 * NOTE: This hook talks to the backend (supabase client imported by the page).
 * Keep business rules (caps, rates) in constants.js.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../client.js'; // your app's frontend supabase client
import {
  RESOURCE_CAP,
  GOLD_PRODUCTION_RATE_PER_SECOND,
  ELIXIR_PRODUCTION_RATE_PER_SECOND,
  TIMEZONE_OFFSET_HOURS,
} from './constants';
import { parseUtc } from './utils';

const DEFAULT_ECONOMY = {
  has_gold_pass: false,
  builders_count: 4,
  gold_amount: 0,
  elixir_amount: 0,
  dark_elixir_amount: 0,
  last_seen_at: null,
};

/**
 * @param {string} userId
 * @returns {{
 *   economy: object|null,
 *   producedGold: number,
 *   producedElixir: number,
 *   loading: boolean,
 *   refresh: function,
 *   updateSettings: function,
 *   collectGold: function,
 *   collectElixir: function
 * }}
 */
export default function useUserEconomySettings(userId) {
  const [economy, setEconomy] = useState(null);
  const [producedGold, setProducedGold] = useState(0);
  const [producedElixir, setProducedElixir] = useState(0);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);
  const isMounted = useRef(true);

  // compute offline produced resources since last_seen_at
  const computeOfflineProduction = useCallback((row) => {
    if (!row || !row.last_seen_at) {
      return { gold: 0, elixir: 0 };
    }

    // parse DB UTC timestamp
    const lastSeenDate = parseUtc(row.last_seen_at);
    if (!lastSeenDate) return { gold: 0, elixir: 0 };

    // current local time
    const now = new Date();

    // raw difference in ms
    const rawDiffMs = now.getTime() - lastSeenDate.getTime();

    // subtract a manual timezone offset to account for database UTC vs client local
    // NOTE: this is a pragmatic correction — if your backend returns timezone-aware times,
    // this offset should be removed or calculated dynamically with Intl API.
    const tzOffsetMs = TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000;
    const correctedMs = Math.max(0, rawDiffMs - tzOffsetMs);

    const seconds = Math.floor(correctedMs / 1000);

    const goldProduced = Math.floor(seconds * GOLD_PRODUCTION_RATE_PER_SECOND);
    const elixirProduced = Math.floor(seconds * ELIXIR_PRODUCTION_RATE_PER_SECOND);

    return { gold: goldProduced, elixir: elixirProduced };
  }, []);

  // load or create initial economy row
  const loadInitial = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_economy')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // real error
        throw error;
      }

      if (data) {
        if (!isMounted.current) return;
        setEconomy(data);
        const produced = computeOfflineProduction(data);
        setProducedGold(produced.gold);
        setProducedElixir(produced.elixir);
        // notify user if useful amounts produced
        if (produced.gold > 100 || produced.elixir > 100) {
          toast.info(
            `Welcome back — you produced ${produced.gold.toLocaleString()} gold and ${produced.elixir.toLocaleString()} elixir while away.`
          );
        }
      } else {
        // No row — create default
        const initial = {
          user_id: userId,
          ...DEFAULT_ECONOMY,
          last_seen_at: new Date().toISOString(),
        };
        const { error: upsertErr } = await supabase
          .from('user_economy')
          .upsert(initial, { onConflict: 'user_id' });
        if (upsertErr) throw upsertErr;
        if (!isMounted.current) return;
        setEconomy(initial);
        setProducedGold(0);
        setProducedElixir(0);
      }
    } catch (err) {
      console.error('[useUserEconomySettings] loadInitial error', err);
      toast.error('Failed to load user economy data.');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [userId, computeOfflineProduction]);

  // live production counter (runs every second)
  useEffect(() => {
    isMounted.current = true;
    // clear previous
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    intervalRef.current = setInterval(() => {
      setProducedGold((prev) => Math.min(prev + GOLD_PRODUCTION_RATE_PER_SECOND, RESOURCE_CAP));
      setProducedElixir((prev) => Math.min(prev + ELIXIR_PRODUCTION_RATE_PER_SECOND, RESOURCE_CAP));
    }, 1000);

    return () => {
      isMounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // refresh function exposed to UI
  const refresh = useCallback(() => {
    loadInitial();
  }, [loadInitial]);

  // update settings (builders / gold pass)
  const updateSettings = useCallback(
    async (partialEconomy) => {
      if (!userId) return;
      try {
        const payload = {
          ...economy,
          ...partialEconomy,
          last_seen_at: new Date().toISOString(),
        };
        const { error } = await supabase
          .from('user_economy')
          .upsert(payload, { onConflict: 'user_id' });
        if (error) throw error;
        setEconomy(payload);
        toast.success('Economy updated successfully!');
      } catch (err) {
        console.error('[useUserEconomySettings] updateSettings error', err);
        toast.error('Update failed.');
        throw err;
      }
    },
    [economy, userId]
  );

  // collect produced gold
  const collectGold = useCallback(async () => {
    if (!economy || producedGold <= 0) return;
    const newGold = Math.min((economy.gold_amount || 0) + producedGold, RESOURCE_CAP);
    const updated = { ...economy, gold_amount: newGold, last_seen_at: new Date().toISOString() };
    try {
      const { error } = await supabase
        .from('user_economy')
        .upsert(updated, { onConflict: 'user_id' });
      if (error) throw error;
      setEconomy(updated);
      setProducedGold(0);
      toast.info(`Collected ${producedGold.toLocaleString()} gold!`);
    } catch (err) {
      console.error('[useUserEconomySettings] collectGold error', err);
      toast.error('Collection failed.');
      throw err;
    }
  }, [economy, producedGold]);

  // collect produced elixir
  const collectElixir = useCallback(async () => {
    if (!economy || producedElixir <= 0) return;
    const newElixir = Math.min((economy.elixir_amount || 0) + producedElixir, RESOURCE_CAP);
    const updated = { ...economy, elixir_amount: newElixir, last_seen_at: new Date().toISOString() };
    try {
      const { error } = await supabase
        .from('user_economy')
        .upsert(updated, { onConflict: 'user_id' });
      if (error) throw error;
      setEconomy(updated);
      setProducedElixir(0);
      toast.info(`Collected ${producedElixir.toLocaleString()} elixir!`);
    } catch (err) {
      console.error('[useUserEconomySettings] collectElixir error', err);
      toast.error('Collection failed.');
      throw err;
    }
  }, [economy, producedElixir]);

  // initial load
  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    economy,
    producedGold,
    producedElixir,
    loading,
    refresh,
    updateSettings,
    collectGold,
    collectElixir,
  };
}
