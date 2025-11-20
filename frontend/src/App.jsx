import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { setAuthToken } from "./utils/api";

/**
 * ProtectedRoute: simple wrapper to guard routes that require authentication.
 * If not authenticated (no token in localStorage), redirect to /login
 */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  // ensure axios has token header set
  setAuthToken(token);
  return children;
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    // keep auth header in sync when app mounts
    const t = localStorage.getItem("token");
    if (t) setAuthToken(t);
    setLoggedIn(!!t);
  }, []);

  // simple handler for login/signup flows to update app state
  const handleAuthChange = (isLogged) => setLoggedIn(isLogged);

  return (
    <BrowserRouter>
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          

          <Routes>
            <Route path="/" element={<Navigate to={loggedIn ? "/dashboard" : "/login"} replace />} />
            <Route path="/login" element={<Login onAuthChange={handleAuthChange} />} />
            <Route path="/signup" element={<Signup onAuthChange={handleAuthChange} />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard onLogout={() => { localStorage.removeItem("token"); setAuthToken(null); handleAuthChange(false); }} />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
