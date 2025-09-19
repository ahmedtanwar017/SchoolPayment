import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/Axios";
import Spinner from "../Components/Spinner";
import {
  CreditCardIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const options = [
    {
      id: "create-amount",
      name: "Pay Now",
      description: "Make a payment towards your school fees quickly and securely",
      icon: CreditCardIcon,
      action: () => navigate("/create-payment"),
    },
    {
      id: "check-status",
      name: "Check Status",
      description: "Track your recent payment history and status updates",
      icon: CheckCircleIcon,
      action: () => navigate("/status"),
    },
  ];

  useEffect(() => {
    const controller = new AbortController();
    const fetchUser = async () => {
      try {
        setError(null);
        setLoading(true);
        const { data } = await api.get("/users/me", {
          signal: controller.signal,
        });
        if (data.success) setUser(data.user);
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError("Failed to load user data. Redirecting to login...");
          console.error("Dashboard API error:", err);
          setTimeout(() => navigate("/login", { replace: true }), 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    return () => controller.abort();
  }, [navigate]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Fixed Logout Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          type="button"
          onClick={() => navigate("/logout")}
          className="flex items-center gap-2 bg-white text-gray-600 px-4 py-2.5 rounded-lg shadow-sm border border-gray-200 
          hover:shadow-md hover:border-gray-300 hover:bg-gray-100 font-medium transition-all duration-200 
          focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          aria-label="Logout"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Logout
        </button>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow p-8 border border-gray-100 w-full max-w-md">
            <Spinner />
            <p className="mt-4 text-gray-500 font-medium">
              Loading your information...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow p-8 border border-gray-100 text-center w-full max-w-md">
            <div className="rounded-full bg-red-100 p-3 inline-flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : (
          user && (
            <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-100 text-center w-full max-w-md mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                Welcome back,{" "}
                <span className="text-gray-700">{user.fullname}</span>
              </h2>
              <p className="text-gray-500">Choose an action to continue</p>
            </div>
          )
        )}

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                onClick={option.action}
                className="bg-white shadow-sm rounded-xl p-6 md:p-8 flex flex-col items-center text-center 
                border border-gray-200 hover:shadow-md hover:border-gray-300 hover:-translate-y-1 
                transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 group"
                aria-label={`Navigate to ${option.name}`}
              >
                <div className="bg-gray-100 p-3 md:p-4 rounded-full mb-4 group-hover:bg-gray-200 transition-colors duration-300">
                  {Icon && <Icon className="h-6 w-6 md:h-8 md:w-8 text-gray-600" />}
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
                  {option.name}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Need help?{" "}
            <a
              href="mailto:support@example.com"
              className="text-gray-600 font-medium hover:underline"
            >
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
