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
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
