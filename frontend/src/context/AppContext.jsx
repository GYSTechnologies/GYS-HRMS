import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true); // loading state

  // Login function
  const login = async (email, password) => {
    const res = await axiosInstance.post("/auth/login", { email, password });
    setToken(res.data.token);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  // Request password reset OTP
  const requestPasswordReset = async (email) => {
    const res = await axiosInstance.post("/auth/forgot-password", { email });
    return res.data;
  };

  // Verify OTP
  const verifyOtp = async (email, otp) => {
    const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
    return res.data;
  };

  // Reset password
  const resetPassword = async (email, otp, password) => {
    const res = await axiosInstance.post("/auth/reset-password", {
      email,
      otp,
      password,
    });
    return res.data;
  };

  // Fetch user profile if token exists
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await axiosInstance.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        } catch (err) {
          logout();
        }
      }
      setLoading(false); // done fetching
    };
    fetchProfile();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        requestPasswordReset,
        verifyOtp,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
