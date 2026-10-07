/**
 * API Service Layer
 * 
 * Centralized Axios instance with:
 *  - Base URL from environment variable
 *  - Automatic Authorization header injection from localStorage
 *  - Standardized error handling
 */

import axios from "axios";

/**
 * Get the API base URL from environment variables.
 * Falls back to localhost:3000 if not set.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor
 * Automatically attaches the JWT token to every outgoing request
 * if one exists in localStorage.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles common HTTP errors and normalizes the response format.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login on client side
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // Normalize error message
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    return Promise.reject(new Error(message));
  }
);

export default api;
