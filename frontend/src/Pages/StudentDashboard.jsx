import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/Axios";
import Spinner from "../Components/Spinner";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const options = [
    {
      name: "Create Amount",
      description: "Add a new payment amount",
      action: () => alert("Create Amount clicked"),
    },
    {
      name: "View My Payment",
      description: "See your payment history",
      action: () => alert("View My Payment clicked"),
    },
    {
      name: "Check Status",
      description: "Check the status of your payments",
      action: () => alert("Check Status clicked"),
    },
  ];

  // Fetch user details
  useEffect(() => {
    let isMounted = true; // prevent state updates if unmounted

    const fetchUser = async () => {
      try {
        const { data } = await api.get("/users/me");
        if (isMounted && data.success) {
          setUser(data.user);
        }
      } catch (err) {
        console.error(
          "Fetch user failed:",
          err.response?.data?.message || err.message
        );
        navigate("/login", { replace: true }); // redirect if not logged in
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false; // cleanup
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-5xl mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={() => navigate("/logout")}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow transition"
        >
          Logout
        </button>
      </div>

      {/* User Info */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-40">
          <Spinner />
          <p className="mt-3 text-gray-500">Loading user...</p>
        </div>
      ) : user ? (
        <h2 className="text-lg font-medium text-gray-700 mb-10">
          Welcome, <span className="font-semibold">{user.fullname}</span> 🎉
        </h2>
      ) : (
        <p className="text-red-500 mb-10">
          Could not load user info. Please log in again.
        </p>
      )}

      {/* Dashboard Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={option.action}
            className="bg-white hover:bg-gray-100 shadow-md rounded-xl p-6 flex flex-col items-center text-center transition transform hover:scale-105 focus:outline-none"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {option.name}
            </h2>
            <p className="text-gray-500">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
