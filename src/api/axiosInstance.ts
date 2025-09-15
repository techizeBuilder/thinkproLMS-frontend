import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const axiosInstance = axios.create({
  baseURL: API_URL,
});

console.log("API_URL:", API_URL);

// Inteceptor to check if any request returned 401 and logout the user by clearing localStorage
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401s if we have a token (meaning we're trying to access an authenticated route)
    if (error.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.reload(); // forces reloading the app and redirecting to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
