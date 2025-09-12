import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../Services/Axios";
import Spinner from "../Components/Spinner";

const Logout = () => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const logoutUser = async () => {
      try {
        // Call backend logout route
        await api.get("/users/logout", { signal });

        // Small delay to make the logout feel smooth
        setTimeout(() => {
          setLoggingOut(false);
          navigate("/login", { replace: true });
        }, 800); // 0.8 second delay
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Logout error:", err);
          toast.error(err.response?.data?.message || "Logout failed");
          navigate("/login", { replace: true });
        }
      }
    };

    logoutUser();

    return () => controller.abort();
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 transition-all duration-500">
      <div className="flex flex-col items-center space-y-4 animate-fade-in">
        <Spinner />
        <p className="text-gray-600 text-lg text-center">
          Logging you out, please wait...
        </p>
      </div>
    </div>
  );
};

export default Logout;
