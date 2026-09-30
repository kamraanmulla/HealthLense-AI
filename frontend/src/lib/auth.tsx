import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, getToken, clearTokens } from './api';
import type { UserResponse } from '../types/api';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const u = await authApi.me();
      setUser(u);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi
        .me()
        .then(setUser)
        .catch(() => clearTokens())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    await authApi.login({ email, password });
    const u = await authApi.me();
    setUser(u);
  };

  const register = async (email: string, password: string, fullName?: string) => {
    await authApi.register({ email, password, full_name: fullName });
    await login(email, password);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
