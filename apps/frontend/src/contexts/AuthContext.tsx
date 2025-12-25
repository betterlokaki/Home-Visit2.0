import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, Group } from '@home-visit/common';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  group: Group | null;
  loading: boolean;
  error: string | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      logger.info('User logged in', { username, userId: userData.userId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      logger.error('Login failed', { username, error: errorMessage });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    const username = user?.username;
    setUser(null);
    setGroup(null);
    setError(null);
    if (username) {
      logger.info('User logged out', { username });
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, group, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

