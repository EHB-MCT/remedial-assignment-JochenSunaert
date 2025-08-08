import React from "react";
import { useNavigate, Link } from "react-router-dom";
import AvailableUpgrades from "../components/AvailableUpgrades";  // Adjust path if needed

const HomePage = ({ user, setToken, setUser }) => {
  let navigate = useNavigate();

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);

    navigate("/");
  }

  // Assuming your user object has user.id or similar unique user ID
  const userId = user?.id;

  return (
    <div>
      <h1>Welcome to the Home Page, {user?.user_metadata?.fullName || "User"}</h1>
      <button onClick={handleLogout}>Logout</button>
      <Link to="/base-input">Make your base</Link>
      <Link to="/profile">Edit Your Profile / Base</Link>
      
      {/* Show Available Upgrades here */}
      {userId ? (
        <AvailableUpgrades userId={userId} />
      ) : (
        <p>Please log in to see your upgrades.</p>
      )}
    </div>
  );
};

export default HomePage;
