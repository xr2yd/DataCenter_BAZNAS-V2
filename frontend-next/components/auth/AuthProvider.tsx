'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { CurrentUser } from '@/lib/api/types';
import { getCachedUser, getClientToken, setClientSession, clearClientSession } from '@/lib/auth/session';
import { api } from '@/lib/api/client';

interface AuthContextType {
  user: CurrentUser | null;
  isLoading: boolean;
  login: (token: string, user: CurrentUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = getClientToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
        setClientSession(token, res.user);
      }
    } catch {
      // Invalid or expired token
      clearClientSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial optimistic hydrate from cache
    const cached = getCachedUser();
    if (cached) {
      setUser(cached);
    }
    refreshUser();
  }, []);

  const login = (token: string, newUser: CurrentUser) => {
    setClientSession(token, newUser);
    setUser(newUser);
  };

  const logout = () => {
    clearClientSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
