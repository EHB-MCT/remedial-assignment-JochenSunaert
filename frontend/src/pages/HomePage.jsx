import React from "react";
import { useNavigate, Link } from "react-router-dom";
import AvailableUpgrades from "../components/AvailableUpgrades";  // Adjust path if needed
import EconomyTab from "../components/EconomyTab"; // Import the EconomyTab component

const HomePage = ({ user, setToken, setUser }) => {
  let navigate = useNavigate();

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);

    navigate("/");
  }

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
      <EconomyTab userId={userId}></EconomyTab>
      
      {userId ? (
        <AvailableUpgrades userId={userId} />
      ) : (
        <p>Please log in to see your upgrades.</p>
      )}
    </div>
  );
};

export default HomePage;
