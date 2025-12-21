import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Group } from '@home-visit/common';
import Cookies from 'js-cookie';
import { authService } from '../services/authService';

const USERNAME_COOKIE_NAME = 'home-visit-username';

interface AuthContextType {
  user: User | null;
  group: Group | null;
  loading: boolean;
  initializing: boolean;
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
  const [initializing, setInitializing] = useState(true);
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

  useEffect(() => {
    const autoLogin = async () => {
      const savedUsername = Cookies.get(USERNAME_COOKIE_NAME);
      if (savedUsername) {
        try {
          setLoading(true);
          const userData = await authService.login(savedUsername);
          setUser(userData);
          if (userData.group) {
            setGroup(userData.group);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Auto-login failed');
        } finally {
          setLoading(false);
          setInitializing(false);
        }
      } else {
        setInitializing(false);
      }
    };

    autoLogin();
  }, []);

  return (
    <AuthContext.Provider value={{ user, group, loading, initializing, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

