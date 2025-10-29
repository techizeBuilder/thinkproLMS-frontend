import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const axiosInstance = axios.create({
  baseURL: API_URL,
});

console.log("API_URL:", API_URL);

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
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

// Interceptor to check if any request returned 401 or 403 and logout the user by clearing localStorage
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401s (unauthorized) and 403s (forbidden - account deactivated) if we have a token
    if (error.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.reload(); // forces reloading the app and redirecting to login
    }
    if (error.response?.status === 403 && error.response?.data?.isAccountDeactivated) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      alert("Your account has been deactivated. Please contact your administrator.");
      window.location.reload(); // forces reloading the app and redirecting to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
