"use client";

import { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = "http://localhost:5000";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload, loading: false };
    case "LOGOUT":
      return { ...state, user: null, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true
  });

  // Set auth token in axios headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  };

  // Load user from token
  const loadUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      try {
        const res = await axios.get("/api/auth/me");
        dispatch({ type: "SET_USER", payload: res.data.user });
      } catch (error) {
        console.error("Error loading user:", error);
        localStorage.removeItem("token");
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      const { token, user } = res.data;

      setAuthToken(token);
      dispatch({ type: "SET_USER", payload: user });
      toast.success("Login successful!");
      return true;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return false;
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      console.log("Registering with data:", userData); // Debug log

      const res = await axios.post("/api/auth/register", userData);
      console.log("Registration response:", res.data); // Debug log

      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error("Invalid response format");
      }

      setAuthToken(token);
      dispatch({ type: "SET_USER", payload: user });
      toast.success("Registration successful!");
      return true;
    } catch (error) {
      console.error("Registration error:", error); // Debug log
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    setAuthToken(null);
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully");
  };

  useEffect(() => {
    loadUser();
  }, []);

  const value = {
    user: state.user,
    loading: state.loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
