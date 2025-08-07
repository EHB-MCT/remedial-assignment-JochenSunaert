import React from "react";
import { useNavigate, Link } from "react-router-dom";

const HomePage = ({ user, setToken, setUser }) => {
  let navigate = useNavigate();

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);

    navigate("/");
  }

  return (
    <div>
      <h1>Welcome to the Home Page, {user?.user_metadata?.fullName || 'User'}</h1>
      <button onClick={handleLogout}>Logout</button>
      <Link to="/base-input">Go to Base Input</Link>
    </div>
  );
};

export default HomePage;
