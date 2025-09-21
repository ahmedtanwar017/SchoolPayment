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
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNlMmU2ZmYiIHN0cm9rZS13aWR0aD0iMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjgiLz48L2c+PC9zdmc+')]"></div>
      
      {/* Subtle school icons in background */}
      <div className="absolute top-10 left-10 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      </div>
      
      <div className="absolute bottom-10 right-10 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      
      <div className="absolute top-1/4 right-1/4 opacity-5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      
      <div className="absolute bottom-1/3 left-1/4 opacity-5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      </div>

      {/* Fixed Logout Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          type="button"
          onClick={() => navigate("/logout")}
          className="flex items-center gap-2 bg-white text-gray-600 px-4 py-2.5 rounded-lg shadow-sm border border-gray-200 
          hover:shadow-md hover:border-gray-300 hover:bg-gray-100 font-medium transition-all duration-200 
          focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 z-50"
          aria-label="Logout"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Logout
        </button>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 z-10">
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
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
              </div>
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