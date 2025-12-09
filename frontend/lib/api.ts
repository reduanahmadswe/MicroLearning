import axios from "axios";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://microlearnignbackend.vercel.app/api/v1";
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
