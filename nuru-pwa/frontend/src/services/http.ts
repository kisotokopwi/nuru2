import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/tokenStorage';
import { refresh as apiRefresh } from './authService';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

http.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((newToken) => {
            if (newToken) {
              original.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(http(original));
          });
        });
      }
      isRefreshing = true;
      try {
        const rt = getRefreshToken();
        if (!rt) throw new Error('No refresh token');
        const { accessToken, refreshToken } = await apiRefresh(rt);
        setTokens(accessToken, refreshToken);
        pendingRequests.forEach((cb) => cb(accessToken));
        pendingRequests = [];
        original.headers.Authorization = `Bearer ${accessToken}`;
        return http(original);
      } catch (e) {
        clearTokens();
        pendingRequests.forEach((cb) => cb(null));
        pendingRequests = [];
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

