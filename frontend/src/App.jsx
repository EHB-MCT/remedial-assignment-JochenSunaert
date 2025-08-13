import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SignUp, Login, HomePage } from "./pages";
import BaseInputPage from './pages/BaseInputPage';
import MainPage from "./pages/HomePage";
import ProfileTab from './pages/ProfileTab'; 
import UserEconomySettings from '../components/UserEconomySettings/UserEconomySettings';

const App = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = sessionStorage.getItem("token");
    const savedUser = sessionStorage.getItem("user");
    if (savedToken && savedUser) {
      try {
        setToken(JSON.parse(savedToken));
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error parsing session storage data:", err);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token && user) {
      sessionStorage.setItem("token", JSON.stringify(token));
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    }
  }, [token, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Debug: see what user object looks like before rendering
  console.log("User object in App.jsx:", user);
  console.log("User ID:", user?.id);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login setToken={setToken} setUser={setUser} />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected */}
      <Route
        path="/home"
        element={
          token && user ? (
            <HomePage user={user} setToken={setToken} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/base-input"
        element={token && user ? <BaseInputPage user={user} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/main"
        element={token && user ? <MainPage token={token} user={user} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/profile"
        element={token && user ? <ProfileTab user={user} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/user-economy-settings"
        element={
          token && user && user.id ? (
            <UserEconomySettings userId={user.id} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
