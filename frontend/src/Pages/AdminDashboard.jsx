import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/Axios";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get("/admins/admin/dashboard");

        if (data.user?.isAdmin) {
          // ✅ If admin, go to transactions
          navigate("/transactions", { replace: true });
        } else {
          navigate("/auth/login", { replace: true });
        }
      } catch (err) {
        console.error("Admin fetch error:", err);
        navigate("/auth/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [navigate]);

  if (loading) return <p>Checking admin...</p>;

  return null; // nothing to render, since we navigate away
}
