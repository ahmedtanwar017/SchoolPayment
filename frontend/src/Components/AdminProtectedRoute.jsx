import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../Services/Axios";
import { toast } from "react-toastify";

const AdminProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const res = await api.get("/admins/admin/dashboard");
        if (res.data?.user?.isAdmin) setAuthorized(true);
        else setAuthorized(false);
      } catch (err) {
        setAuthorized(false);
        toast.error("Unauthorized. Please login as admin.");
      } finally {
        setLoading(false);
      }
    };
    checkAdminAuth();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-700">
        <div className="animate-spin border-4 border-gray-300 border-t-gray-600 rounded-full w-12 h-12 mb-4"></div>
        <p>Verifying admin privileges...</p>
      </div>
    );

  if (!authorized) return <Navigate to="/auth/login" replace />;

  return children;
};

export default AdminProtectedRoute;
