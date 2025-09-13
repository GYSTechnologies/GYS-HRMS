import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Login function
  const login = async (email, password) => {
    const res = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

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

  // Fetch profile if token already stored
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await axiosInstance.get("/auth/me");
          setUser(res.data);
        } catch (err) {
          logout();
        }
      }
    };
    fetchProfile();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
