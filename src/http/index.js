import axios from "axios";

const baseURL = import.meta.env.VITE_URL;

const API = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const apiAuthenticated = axios.create({
  baseURL: baseURL,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

// Add request interceptor to set Content-Type only for non-FormData requests
apiAuthenticated.interceptors.request.use((config) => {
  // If data is FormData, let browser set Content-Type automatically (with boundary)
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

export { API, apiAuthenticated };
export default API;
