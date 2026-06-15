import axios from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let authToken = null;
let refreshToken = null;
let onTokenExpired = null;

export const setAuthTokens = (access, refresh) => {
  authToken = access;
  refreshToken = refresh;
};

export const clearAuthTokens = () => {
  authToken = null;
  refreshToken = null;
};

export const setOnTokenExpired = (handler) => {
  onTokenExpired = handler;
};

const refreshAccessToken = async () => {
  if (!refreshToken) throw new Error('No refresh token');
  const res = await axios.post(`${API_BASE}/auth/token/refresh/`, {
    refresh: refreshToken,
  });
  authToken = res.data.access;
  return authToken;
};

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      refreshToken
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        clearAuthTokens();
        if (onTokenExpired) onTokenExpired();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
