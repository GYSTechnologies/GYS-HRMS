import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "http://localhost:4000/api",
    baseURL: "https://hrms-backend-jet.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
