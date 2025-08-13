import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AvailableUpgrades from '../components/AvailableUpgrades/AvailableUpgrades';
import EconomyTab from "../components/EconomyTab/EconomyTab";

const HomePage = ({ user, setToken, setUser }) => {
  let navigate = useNavigate();
  // State to trigger a refresh of the economy data
  const [economyRefreshCounter, setEconomyRefreshCounter] = useState(0);

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);

    navigate("/");
  }

  // This function will be passed to AvailableUpgrades
  // and called on a successful upgrade to refresh the economy data.
  const handleUpgradeSuccess = () => {
    setEconomyRefreshCounter(prev => prev + 1);
  };

  const userId = user?.id;

  return (
    <div>
      <h1>Welcome to the Home Page, {user?.user_metadata?.fullName || "User"}</h1>
      <button onClick={handleLogout}>Logout</button>
      <Link to="/base-input">Make your base</Link>
      <Link to="/profile">Edit Your Profile / Base</Link>
      <button onClick={() => navigate("/user-economy-settings")}>
        Edit User Economy Settings
      </button>

      {/* Pass the refresh counter to EconomyTab */}
      <EconomyTab userId={userId} refreshFlag={economyRefreshCounter} />
      
      {userId ? (
        // Pass the refresh handler to AvailableUpgrades
        <AvailableUpgrades userId={userId} onUpgradeSuccess={handleUpgradeSuccess} />
      ) : (
        <p>Please log in to see your upgrades.</p>
      )}

      need to add a defense? <Link to="/profile">click here</Link>
    </div>
  );
};

export default HomePage;
