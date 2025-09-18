// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000", // your backend API
//   headers: {
//     "Content-Type": "application/json", // <- important
//   },
//   withCredentials: true, // send cookies automatically
// });

// export default api;

// import axios from "axios";

// const api = axios.create({
//   baseURL: "https://school-payment-psi.vercel.app/", // your backend API
//   headers: {
//     "Content-Type": "application/json", // <- important
//   },
//   withCredentials: true, // send cookies automatically
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("userToken") || localStorage.getItem("adminToken");
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Handle 401 globally
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.warn("Unauthorized. Clearing tokens...");
//       localStorage.removeItem("adminToken");
//       localStorage.removeItem("userToken");
//       window.location.href = "/login"; // redirect to login
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

// Services/Axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://school-payment-psi.vercel.app",
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // cookies nahi, header se token bhejenge
});

// Interceptor to add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken") || localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
