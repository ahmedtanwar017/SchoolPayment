import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../Services/Axios";
import Spinner from "../Components/Spinner";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const logoutUser = async () => {
      try {
        // ✅ Call backend logout route (clears cookie/session)
        await api.get("/users/logout");

        if (active) {
          toast.success("👋 Logged out successfully!");
          setTimeout(() => navigate("/login", { replace: true }), 1500);
        }
      } catch (err) {
        if (active) {
          toast.error(err.response?.data?.message || "Logout failed");
          setTimeout(() => navigate("/login", { replace: true }), 1500);
        }
      }
    };

    logoutUser();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Spinner />
      <p className="ml-3 text-gray-600">Logging you out...</p>
    </div>
  );
};

export default Logout;
