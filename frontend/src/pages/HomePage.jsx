/**
 * HomePage.jsx
 *
 * Main authenticated landing page.
 *
 * Responsibilities:
 * - Show basic navigation (logout, links to profile/base pages).
 * - Render economy and upgrade-related components.
 * - Provide a callback to refresh economy state after upgrades.
 *
 * Notes:
 * - This component is light: most business logic lives in child components
 *   (AvailableUpgrades, EconomyTab). We pass a simple `refreshFlag` and an
 *   `onUpgradeSuccess` callback for upward notification.
 * - `onUpgradeSuccess` is optional for the AvailableUpgrades child; if the
 *   child doesn't use it, nothing breaks.
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AvailableUpgrades from "../components/AvailableUpgrades/AvailableUpgrades";
import EconomyTab from "../components/EconomyTab/EconomyTab";

/**
 * HomePage component (authenticated area).
 *
 * @param {object} props
 * @param {object} props.user - Current authenticated user object (may be null)
 * @param {function} props.setToken - Setter to update authentication token
 * @param {function} props.setUser - Setter to update user object
 */
const HomePage = ({ user, setToken, setUser }) => {
  const navigate = useNavigate();

  // Simple counter used as a lightweight "refresh token" to force EconomyTab
  // to re-fetch data whenever an upgrade completes successfully.
  const [economyRefreshCounter, setEconomyRefreshCounter] = useState(0);

  /**
   * Clears client-side session storage and resets auth state.
   * Redirects the user to the login page afterwards.
   */
  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);

    navigate("/");
  }

  /**
   * Handler invoked when an upgrade completes successfully.
   * We increment a counter so children that accept `refreshFlag` can react.
   *
   * This is intentionally minimal — the child component (AvailableUpgrades)
   * is the source of truth for upgrades, and it calls this function to
   * notify the page that a refresh is desirable.
   */
  const handleUpgradeSuccess = () => {
    setEconomyRefreshCounter((prev) => prev + 1);
  };

  const userId = user?.id;

  return (
    <div className="p-6 inpgrogress-upgrades-container">

      {/* Primary actions */}
      <div className="nav">



        <Link to="/profile" className="text-blue-600 underline">
          Edit Your Profile / Base
        </Link>

        <button
          onClick={() => navigate("/user-economy-settings")}
          className="px-3 py-1 bg-indigo-600 text-white rounded"
        >
          Edit User Economy Settings
        </button>

          <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded">
          Logout
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-4">
        Welcome to the CoC Simulator, {user?.user_metadata?.fullName || "User"}
      </h1>


      {/* Economy overview: receives the refreshFlag and should refetch when it changes */}
      <EconomyTab userId={userId} refreshFlag={economyRefreshCounter} />

      {/* Available upgrades: passed userId and an optional onUpgradeSuccess callback.
          If AvailableUpgrades doesn't accept onUpgradeSuccess it will be ignored. */}
      {userId ? (
        <AvailableUpgrades userId={userId} onUpgradeSuccess={handleUpgradeSuccess} />
      ) : (
        <p className="mt-4 text-sm text-gray-600">Please log in to see your upgrades.</p>
      )}

      <div className="mt-6 text-sm defense-addition">
        Need to add a defense? <Link to="/profile" className="text-blue-600 underline">Click here</Link>
      </div>
    </div>
  );
};

export default HomePage;
