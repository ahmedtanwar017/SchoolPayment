import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./Components/ProtectedRoute";

// Pages
import Dashboard from "./Pages/StudentDashboard";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Logout from "./Pages/Logout";
import AdminLogin from "./Pages/LoginAdmin";

function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications (global) */}
      <ToastContainer position="top-center" autoClose={1500} hideProgressBar />

      <Routes>
        {/* Default route → redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        { /* Admin routes */}
        <Route path="/auth/login" element={<AdminLogin />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logout"
          element={
            <ProtectedRoute>
              <Logout />
            </ProtectedRoute>
          }
        />

        {/* Fallback route (404) */}
        <Route path="*" element={<h1 className="text-center mt-20 text-2xl">404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
