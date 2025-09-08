import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin } from '../services/authService';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../utils/tokenStorage';

type User = { id: string; email: string; role: 'SUPERVISOR' | 'ADMIN' } | null;

type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const at = getAccessToken();
    const rt = getRefreshToken();
    if (at && rt) {
      // Minimal bootstrapping: trust tokens exist; user details will be fetched after login in future features
      setUser({ id: 'unknown', email: 'unknown', role: 'SUPERVISOR' });
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const { accessToken, refreshToken, user } = await apiLogin(email, password);
    setTokens(accessToken, refreshToken);
    setUser(user);
  };

  const handleLogout = () => {
    clearTokens();
    setUser(null);
  };

  const value = useMemo(() => ({ user, isAuthenticated: !!user, login: handleLogin, logout: handleLogout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

