import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, Group } from '@home-visit/common';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  group: Group | null;
  loading: boolean;
  error: string | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authService.login(username);
      setUser(userData);

      if (userData.group) {
        setGroup(userData.group);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setGroup(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, group, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

