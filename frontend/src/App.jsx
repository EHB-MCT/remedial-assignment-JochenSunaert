/**
 * App.jsx
 *
 * Root React component that defines application routes and handles simple
 * client-side session management (token + user stored in sessionStorage).
 *
 * Responsibilities:
 * - Load/save minimal authentication state (token, user) to sessionStorage.
 * - Block access to protected routes for unauthenticated users.
 * - Mount route components (public + protected).
 *
 * Notes:
 * - This component keeps authentication state in-memory and synced with
 *   sessionStorage for page reloads. For production consider a more secure
 *   storage/strategy (httpOnly cookies or secure token handling).
 * - Protected routes use a simple `token && user` check. Adjust as needed
 *   (e.g., verify token validity).
 */

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Page & feature imports
import { SignUp, Login, HomePage } from "./pages/authentication";
import BaseInputPage from './pages/BaseInputPage';
import MainPage from "./pages/HomePage";
import ProfileTab from './pages/ProfileTab';
import UserEconomySettings from './components/UserEconomySettings/UserEconomySettings';

 /**
  * App root component.
  *
  * Manages:
  * - token: authentication token (any shape your auth provides)
  * - user: user object (id and other profile fields)
  * - loading: initial load flag while reading sessionStorage
  *
  * Renders the router with public and protected routes.
  */
const App = () => {
  // Authentication state (kept lightweight; shape depends on your auth)
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Loading indicator while we read sessionStorage on mount
  const [loading, setLoading] = useState(true);

  /**
   * On mount: hydrate token and user from sessionStorage (if present).
   * - Stored values are JSON strings; we parse safely and ignore parse errors.
   * - After attempting hydration we clear the loading flag.
   */
  useEffect(() => {
    const savedToken = sessionStorage.getItem("token");
    const savedUser = sessionStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setToken(JSON.parse(savedToken));
        setUser(JSON.parse(savedUser));
      } catch (err) {
        // If parsing fails, log and continue with null state.
        // Parsing errors may indicate stale or tampered session data.
        console.error("Error parsing session storage data:", err);
      }
    }

    setLoading(false);
  }, []);

  /**
   * Persist token + user to sessionStorage when either changes.
   * - If either is falsy, remove stored values (logout behavior).
   * - sessionStorage is used for convenience during development; prefer
   *   a more secure approach for production.
   */
  useEffect(() => {
    if (token && user) {
      sessionStorage.setItem("token", JSON.stringify(token));
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    }
  }, [token, user]);

  // While hydrating, show a lightweight loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // DEBUG: helpful during development to inspect the hydrated user object.
  // Remove or guard these logs in production.
  console.log("User object in App.jsx:", user);
  console.log("User ID:", user?.id);

  /**
   * Routes:
   * - Public routes: "/", "/signup"
   * - Protected routes: require token && user (simple guard)
   *
   * If the guard fails, redirect to the login page using <Navigate replace />.
   */
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login setToken={setToken} setUser={setUser} />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected: /home */}
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

      {/* Protected: /base-input */}
      <Route
        path="/base-input"
        element={token && user ? <BaseInputPage user={user} /> : <Navigate to="/" replace />}
      />

      {/* Protected: /main */}
      <Route
        path="/main"
        element={token && user ? <MainPage token={token} user={user} /> : <Navigate to="/" replace />}
      />

      {/* Protected: /profile */}
      <Route
        path="/profile"
        element={token && user ? <ProfileTab user={user} /> : <Navigate to="/" replace />}
      />

      {/* Protected: user economy settings requires a user id */}
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
