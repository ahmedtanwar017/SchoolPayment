import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // your backend API
  headers: {
    "Content-Type": "application/json", // <- important
  },
  withCredentials: true, // send cookies automatically
});

export default api;
