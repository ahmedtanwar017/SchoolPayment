// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000", // your backend API
//   headers: {
//     "Content-Type": "application/json", // <- important
//   },
//   withCredentials: true, // send cookies automatically
// });

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "https://school-payment-psi.vercel.app/", // your backend API
  headers: {
    "Content-Type": "application/json", // <- important
  },
  withCredentials: true, // send cookies automatically
});

api.interceptors.request.use(
  (config) => {
    // Prefer admin token if exists
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("userToken");
    const token = adminToken || userToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → handle unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized. Clearing tokens...");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("userToken");

    }
    return Promise.reject(error);
  }
);

export default api;
