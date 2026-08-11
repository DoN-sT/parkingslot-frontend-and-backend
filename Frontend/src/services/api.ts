/// <reference types="vite/client" />
import axios from "axios";

// Access environment variable or fallback to relative /api
const API_URL = (import.meta as any).env?.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to dynamically inject Bearer JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("parkingspot_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 unauthorized
      localStorage.removeItem("parkingspot_token");
      localStorage.removeItem("parkingspot_user");
    }
    const message =
      error.response?.data?.message || error.message || "An unexpected network error occurred";
    return Promise.reject(new Error(message));
  }
);

export default api;
