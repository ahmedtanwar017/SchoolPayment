import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../Components/Spinner";
import api from "../Services/Axios";

// Reusable Input Component
const InputField = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  showToggle,
  toggleState,
  setToggleState,
}) => (
  <div>
    <label
      className="block text-sm font-medium text-gray-700 mb-1"
      htmlFor={name}
    >
      {label}
    </label>
    <div className="relative">
      <input
        type={showToggle ? (toggleState ? "text" : "password") : type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full border border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-200 outline-none transition pr-12"
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setToggleState((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={toggleState ? "Hide password" : "Show password"}
        >
          {toggleState ? (
            // Eye open
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 
                   8.268 2.943 9.542 7-1.274 4.057-5.064 
                   7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          ) : (
            // Eye closed
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 
                   19c-4.478 0-8.268-2.943-9.543-7a9.97 
                   9.97 0 011.563-3.029m5.858.908a3 3 0 
                   114.243 4.243M9.878 9.878l4.242 
                   4.242M9.88 9.88l-3.29-3.29m7.532 
                   7.532l3.29 3.29M3 3l3.59 3.59m0 
                   0A9.953 9.953 0 0112 5c4.478 0 
                   8.268 2.943 9.543 7a10.025 10.025 
                   0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // 🔹 error state

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    setLoading(true);
    setError(""); // clear previous error
    try {
      // 1️⃣ Login request
      const { data } = await api.post("/users/login", formData);

      // 2️⃣ Save token to localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      } else {
        throw new Error("Login failed: no token received");
      }

      // 3️⃣ Fetch current user
      const userResponse = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${data.token}` },
      });

      if (userResponse.data.user) {
        // You can store the user in global state or localStorage if needed
        console.log("Logged in user:", userResponse.data.user);
      } else {
        throw new Error("Failed to fetch user details");
      }

      // 4️⃣ Navigate to dashboard
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
          Student Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />

          <InputField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            showToggle
            toggleState={showPassword}
            setToggleState={setShowPassword}
          />

          {/* 🔹 Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center shadow-sm hover:shadow-md"
          >
            {loading ? <Spinner /> : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center pt-5 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            New student?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold text-gray-700 hover:text-gray-800 hover:underline transition-colors"
            >
              Create your account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
