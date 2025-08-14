import React, { useEffect, useState } from 'react';

/**
 * EconomyTab fetches and displays a user's economy information (gold, elixir, builders, etc.)
 *
 * @param {Object} props
 * @param {string} props.userId - ID of the user
 * @param {any} props.refreshFlag - Trigger to re-fetch economy data when changed
 */
export default function EconomyTab({ userId, refreshFlag }) {
  const [economy, setEconomy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError("No user ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/economy/status?userId=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Optionally apply gold pass logic here
        if (data.has_gold_pass) {
          data.gold_amount = Math.floor(data.gold_amount);
        }
        setEconomy(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId, refreshFlag]);

  if (loading) return <div className="clan-skel">Loading economy data...</div>;
  if (error) return <div className="clan-error">Error loading economy data: {error}</div>;
  if (!economy) return <div className="clan-empty">No economy data available.</div>;

  const hoursTotal = Math.floor(economy.total_time_seconds / 3600);
  const hoursWithBuilders =
    economy.builders_count && economy.builders_count > 0
      ? Math.floor(hoursTotal / economy.builders_count)
      : 'N/A';

  // safe numeric fallback
  const gold = Number.isFinite(economy.gold_amount) ? economy.gold_amount : 0;
  const elixir = Number.isFinite(economy.elixir_amount) ? economy.elixir_amount : 0;
  const totalNeeded = Number.isFinite(economy.total_gold_needed) ? economy.total_gold_needed : 1;
  const goldPct = Math.min(100, Math.round((gold / Math.max(totalNeeded, 1)) * 100));

  return (
    <section className="clan-economy" aria-labelledby="clan-economy-title">
      <header className="clan-header">
        <div className="plank-left" />
        <h2 id="clan-economy-title" className="clan-title">
          <span className="shield">🛡️</span> Economy Overview
        </h2>
        <div className="plank-right" />
      </header>

      <div className="clan-grid">
        {/* Card: Gold */}
        <div className="clan-card gold-card">
          <div className="card-top">
            <div className="card-icon gold-icon" aria-hidden>
              {/* stylized gold pile SVG */}
              <svg viewBox="0 0 24 24" className="stat-svg" aria-hidden>
                <g>
                  <ellipse cx="12" cy="18.5" rx="7" ry="2.2" />
                  <path d="M7 16c1-3 5-4.5 7-4.5s6 1.5 6 4.5c0 0-3 1-6 .8S7 16 7 16z" />
                </g>
              </svg>
            </div>
            <div className="card-title">Gold</div>
            <div className="gold-amount">{gold.toLocaleString()}</div>
          </div>

          <div className="progress-wrap">
            <div className="progress-label">
              <span>To Max: {totalNeeded.toLocaleString()}</span>
              <span>{goldPct}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill gold-fill"
                style={{ width: `${goldPct}%` }}
                aria-valuenow={goldPct}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
          </div>

          <div className="card-footer">
            <div className="mini-badge">Gold Pass: {economy.has_gold_pass ? 'Yes' : 'No'}</div>
            <div className="mini-note">Needed: {economy.total_gold_needed?.toLocaleString() || '—'}</div>
          </div>
        </div>

        {/* Card: Elixir */}
        <div className="clan-card elixir-card">
          <div className="card-top">
            <div className="card-icon elixir-icon" aria-hidden>
              {/* stylized elixir droplet */}
              <svg viewBox="0 0 24 24" className="stat-svg" aria-hidden>
                <path d="M12 2s6 6 6 9a6 6 0 01-12 0c0-3 6-9 6-9z" />
              </svg>
            </div>
            <div className="card-title">Elixir</div>
            <div className="elixir-amount">{elixir.toLocaleString()}</div>
          </div>

          <div className="progress-wrap">
            <div className="progress-label">
              <span>Stored</span>
              <span>{economy.elixir_amount?.toLocaleString() || 0}</span>
            </div>
            <div className="progress-bar">
              {/* Elixir doesn't have a 'max' in the response; show a subtle animated sheen */}
              <div className="progress-fill elixir-fill" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="card-footer">
            <div className="mini-badge">Gold Pass: {economy.has_gold_pass ? 'Yes' : 'No'}</div>
            <div className="mini-note">Needed: {economy.total_elixer_needed?.toLocaleString() || '0'}</div>
          </div>
        </div>

        {/* Card: Builders & Time */}
        <div className="clan-card builders-card">
          <div className="card-top">
            <div className="card-icon builders-icon" aria-hidden>
              <svg viewBox="0 0 24 24" className="stat-svg" aria-hidden>
                <path d="M4 21v-7l8-5 8 5v7H4zM12 3v4" strokeWidth="0" />
              </svg>
            </div>
            <div className="card-title">Builders</div>
            <div className="builders-count">{economy.builders_count || 0}</div>
          </div>

          <div className="time-info">
            <div className="time-line">
              <strong>Total time:</strong> {hoursTotal} hours
            </div>
            <div className="time-line">
              <strong>With {economy.builders_count || 1} builders:</strong> {hoursWithBuilders} hours
            </div>
          </div>

          <div className="card-footer">
            <div className="mini-note"> gold pass Speed bonus: {economy.has_gold_pass ? '20%' : '0%'}</div>
          </div>
        </div>
      </div>

      <footer className="clan-foot">
        <div className="foot-left">Keep your village strong — plan upgrades wisely!</div>
        <div className="foot-right">Last refresh: {new Date().toLocaleTimeString()}</div>
      </footer>
    </section>
  );
}
