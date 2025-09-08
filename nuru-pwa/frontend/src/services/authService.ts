import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
});

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: 'SUPERVISOR' | 'ADMIN' };
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post('/auth/login', { email, password });
  return res.data as LoginResponse;
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await api.post('/auth/refresh', { refreshToken });
  return res.data as { accessToken: string; refreshToken: string };
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post('/auth/change-password', { currentPassword, newPassword }, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
}

export const authApi = api;

