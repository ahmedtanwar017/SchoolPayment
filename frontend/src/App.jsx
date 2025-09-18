import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminProtectedRoute from "./Components/AdminProtectedRoute";
import Spinner from "./Components/Spinner";
import AdminDashboard from "./Pages/AdminDashboard.jsx";

// Lazy-loaded Pages
const Dashboard = lazy(() => import("./Pages/StudentDashboard"));
const Login = lazy(() => import("./Pages/Login"));
const Register = lazy(() => import("./Pages/Register"));
const Logout = lazy(() => import("./Pages/Logout"));
const AdminLogin = lazy(() => import("./Pages/LoginAdmin"));
const TransactionsDashboard = lazy(() => import("./Pages/TransactionsDashboard"));
const PaymentForm = lazy(() => import("./Pages/CreateAmount"));
const CheckPaymentStatus = lazy(() => import("./Pages/CheckPaymentStatus.jsx"));

function App() {
  return (
    <BrowserRouter>
      {/* Global toast notifications */}
      <ToastContainer position="top-center" autoClose={1500} hideProgressBar />

      {/* Suspense fallback for lazy-loaded pages */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <Spinner />
          </div>
        }
      >
        <Routes>
          {/* Default route → redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


          

          {/* Admin routes */}
          <Route path="/auth/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/transactions" element={<TransactionsDashboard />} />
         
           
      
          {/* Protected routes for regular users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-payment"
            element={
              <ProtectedRoute>
                <PaymentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/status"
            element={
              <ProtectedRoute>
                <CheckPaymentStatus />
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

          {/* Fallback route → 404 */}
          <Route
            path="*"
            element={
              <h1 className="text-center mt-20 text-2xl font-semibold">
                404 - Page Not Found
              </h1>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
