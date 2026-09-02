import axios from "axios";

function getApiBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (url) {
    // Remove any trailing slashes
    url = url.replace(/\/+$/, "");
    // Automatically append /api/v1 if not present
    if (!url.endsWith("/api/v1")) {
      url = `${url}/api/v1`;
    }
    return url;
  }
  return typeof window !== "undefined" ? "/api/v1" : "http://localhost:8000/api/v1";
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach bearer token if stored
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("codelens_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to catch 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("codelens_token");
        localStorage.removeItem("codelens_user");
      }
    }
    return Promise.reject(error);
  }
);
