import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SignUp, Login, HomePage } from "./pages";
import BaseInputPage from './pages/BaseInputPage';
import MainPage from "./pages/HomePage";

const App = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // loading flag

  useEffect(() => {
    const savedToken = sessionStorage.getItem("token");
    const savedUser = sessionStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(JSON.parse(savedToken));
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);  // loading done
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
    return <div>Loading...</div>; // or null, spinner etc.
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login setToken={setToken} setUser={setUser} />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected */}
      <Route
        path="/home"
        element={token && user ? <HomePage user={user} setToken={setToken} setUser={setUser} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/base-input"
        element={token && user ? <BaseInputPage user={user} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/main"
        element={token && user ? <MainPage token={token} user={user} /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default App;
