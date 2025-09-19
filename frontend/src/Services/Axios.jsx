// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000",
//   withCredentials: true, // 👈 important for cookies
//   headers: {
//     "Content-Type": "application/json",
//   },
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

