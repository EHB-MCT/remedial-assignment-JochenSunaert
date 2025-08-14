import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  computeDiscountedValue,
  formatTimeSeconds,
} from './utils';

/**
 * Custom hook that encapsulates:
 * - fetching in-progress upgrades
 * - fetching available upgrades
 * - fetching economy
 * - starting upgrades
 * - timer that detects finished upgrades and calls completion
 *
 * Returns:
 *  { economy, upgrades, inProgress, isLoading, startUpgrade, refresh }
 */
export default function useAvailableUpgrades(userId) {
  const [upgrades, setUpgrades] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [economy, setEconomy] = useState(null);

  const [loadingUpgrades, setLoadingUpgrades] = useState(true);
  const [loadingInProgress, setLoadingInProgress] = useState(true);
  const [loadingEconomy, setLoadingEconomy] = useState(true);

  const timerRef = useRef(null);
  const isMounted = useRef(true);

  // consolidated loading indicator
  const isLoading = loadingUpgrades || loadingInProgress || loadingEconomy;

  // fetch functions
  const fetchInProgress = useCallback(async () => {
    setLoadingInProgress(true);
    try {
      const res = await fetch(`https://remedial-assignment-jochensunaert.onrender.com/api/upgrades?userId=${userId}`);
      if (!res.ok) throw new Error(`Failed to fetch in-progress upgrades: ${res.status}`);
      const data = await res.json();

      // compute remaining time in seconds
      const now = Date.now();
      const processed = data.map((u) => {
        const finishesAt = new Date(u.finishes_at).getTime();
        const time_remaining = Math.max(0, Math.floor((finishesAt - now) / 1000));
        return { ...u, time_remaining };
      });

      if (isMounted.current) setInProgress(processed);
    } catch (err) {
      console.error('[hook] fetchInProgress:', err);
      toast.error(`Error loading in-progress upgrades: ${err.message}`);
      if (isMounted.current) setInProgress([]);
    } finally {
      if (isMounted.current) setLoadingInProgress(false);
    }
  }, [userId]);

  const fetchAvailable = useCallback(async () => {
    setLoadingUpgrades(true);
    try {
      const res = await fetch(`https://remedial-assignment-jochensunaert.onrender.com/api/upgrades/available?userId=${userId}`);
      if (!res.ok) throw new Error(`Failed to fetch available upgrades: ${res.status}`);
      const data = await res.json();
      if (isMounted.current) setUpgrades(data);
    } catch (err) {
      console.error('[hook] fetchAvailable:', err);
      toast.error(`Error loading available upgrades: ${err.message}`);
      if (isMounted.current) setUpgrades([]);
    } finally {
      if (isMounted.current) setLoadingUpgrades(false);
    }
  }, [userId]);

  const fetchEconomy = useCallback(async () => {
    setLoadingEconomy(true);
    try {
      const res = await fetch(`https://remedial-assignment-jochensunaert.onrender.com/api/user-economy/${userId}`);
      if (!res.ok) throw new Error(`Failed to fetch economy: ${res.status}`);
      const data = await res.json();
      if (isMounted.current) setEconomy(data);
    } catch (err) {
      console.error('[hook] fetchEconomy:', err);
      toast.error(`Error loading economy: ${err.message}`);
      if (isMounted.current) setEconomy(null);
    } finally {
      if (isMounted.current) setLoadingEconomy(false);
    }
  }, [userId]);

  // refresh all data
  const refresh = useCallback(() => {
    fetchInProgress();
    fetchAvailable();
    fetchEconomy();
  }, [fetchInProgress, fetchAvailable, fetchEconomy]);

  // start an upgrade (validates on server but performs client-side prechecks)
  const startUpgrade = useCallback(async (upgrade, defenseInstanceName) => {
    if (!economy) return;

    const hasGoldPass = economy?.has_gold_pass;
    const discountedCost = computeDiscountedValue(upgrade.build_cost, hasGoldPass);
    const discountedTime = computeDiscountedValue(upgrade.build_time_seconds, hasGoldPass);

    const canAfford = (upgrade.build_resource === 'gold' && economy.gold_amount >= discountedCost) ||
                      (upgrade.build_resource === 'elixir' && economy.elixir_amount >= discountedCost);

    const isBuilderBusy = economy.builders_count <= inProgress.length;
    if (isBuilderBusy) {
      toast.error('All your builders are busy!');
      return;
    }
    if (!canAfford) {
      toast.error(`Not enough ${upgrade.build_resource}`);
      return;
    }

    try {
      const res = await fetch('https://remedial-assignment-jochensunaert.onrender.com/api/user-economy/start-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          upgradeId: upgrade.id,
          upgradeLevel: upgrade.level,
          defenseInstanceName,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Server returned ${res.status}`);
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to start upgrade');

      toast.success('Upgrade started successfully!');
      // immediately refresh so frontend shows updated state
      refresh();
    } catch (err) {
      console.error('[hook] startUpgrade:', err);
      toast.error(`Failed to start upgrade: ${err.message}`);
    }
  }, [economy, inProgress.length, userId, refresh]);

  // complete upgrades that reached time_remaining === 0
  const completeUpgrades = useCallback(async (toComplete) => {
    if (!toComplete || toComplete.length === 0) return;
    try {
      await Promise.all(toComplete.map(async (u) => {
        const res = await fetch('https://remedial-assignment-jochensunaert.onrender.com/api/user-economy/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            upgradeId: u.id,
            defenseInstanceName: u.defense_instance_name,
            targetLevel: u.upgrade_level,
          }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || `Failed to complete upgrade ${u.id}`);
        }
      }));
      toast.info('Completed upgrades processed');
      refresh();
    } catch (err) {
      console.error('[hook] completeUpgrades:', err);
      toast.error(`Error completing upgrades: ${err.message}`);
      // still refresh to ensure UI consistency
      refresh();
    }
  }, [userId, refresh]);

  // timer effect: ticks every second, updates time_remaining and triggers completion
  useEffect(() => {
    // ensure mounted flag
    isMounted.current = true;
    // clear old interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // only set timer if there are in-progress upgrades
    if (inProgress.length === 0) {
      return () => { isMounted.current = false; };
    }

    timerRef.current = setInterval(() => {
      setInProgress((prev) => {
        const now = Date.now();
        const updated = prev.map((u) => {
          const finishesAt = new Date(u.finishes_at).getTime();
          const time_remaining = Math.max(0, Math.floor((finishesAt - now) / 1000));
          return { ...u, time_remaining };
        });

        // detect completed
        const completed = updated.filter((u) => u.time_remaining === 0);
        if (completed.length > 0) {
          // pass completed to completion handler (async)
          // run asynchronously but avoid awaiting inside setState reducer
          completeUpgrades(completed);
        }

        return updated.filter((u) => u.time_remaining > 0);
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      isMounted.current = false;
    };
  }, [inProgress.length, completeUpgrades]);

  // initial load
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    economy,
    upgrades,
    inProgress,
    isLoading,
    startUpgrade,
    refresh,
    formatTime: formatTimeSeconds, // handy for UI
  };
}
