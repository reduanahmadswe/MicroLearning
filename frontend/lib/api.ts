import axios from "axios";

// Use localhost in development, production URL in production
const isDevelopment = process.env.NODE_ENV === 'development';
const defaultUrl = isDevelopment
  ? "http://localhost:5000/api/v1"
  : "https://microlearning-backend-reduan.onrender.com/api/v1";

// Force localhost in development to ensure we hit the local backend with our fixes
const rawApiUrl = isDevelopment
  ? "http://localhost:5000/api/v1"
  : (process.env.NEXT_PUBLIC_API_URL || defaultUrl);
const API_URL = rawApiUrl.replace(/([^:]\/)\/+/g, "$1");

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only access localStorage and window on client side
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);
