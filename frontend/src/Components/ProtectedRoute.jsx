import React from "react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../Services/Axios"; // <-- your Axios instance

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/users/me"); // cookie is auto-sent
        setAuthorized(true);
      } catch (err) {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!authorized) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
