import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../Components/Spinner";
import api from "../Services/Axios";

const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const InputField = ({ label, type, name, value, onChange, placeholder, showToggle, toggleState, setToggleState }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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
          onClick={() => setToggleState(prev => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={toggleState ? "Hide password" : "Show password"}
        >
          {toggleState ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
        </button>
      )}
    </div>
  </div>
);

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(""); // clear error when typing again
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setError("Both email and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/admins/auth/login", formData);

      if (!res.data.user?.isAdmin) {
        setError("Access denied. Admins only.");
        setLoading(false);
        return;
      }

      // Keep spinner for 800ms then redirect
      setTimeout(() => {
        navigate("/admin/dashboard", { replace: true });
      }, 800);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Invalid email or password.");
      } else if (err.request) {
        setError("Server is not responding. Please try again later.");
      } else {
        setError("Unexpected error occurred. Please try again.");
      }
      setLoading(false); // stop spinner immediately on error
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Admin Login</h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Only authorized administrators can access this panel.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm font-medium bg-red-100 text-red-700 border border-red-200">
            {error}
          </div>
        )}

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
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center shadow-sm hover:shadow-md disabled:opacity-70"
          >
            {loading ? <Spinner /> : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
