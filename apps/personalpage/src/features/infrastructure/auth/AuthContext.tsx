import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { createComponentLogger } from '@websites/infrastructure/logging';

const logger = createComponentLogger('AuthContext');

export interface AuthUser {
  id: string;
  googleId: string;
  nickname?: string;
  preferences?: {
    language?: string;
    theme?: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/user/status');
      const data = await response.json();
      
      if (data.authenticated && data.user) {
        setUser(data.user);
        logger.debug('User authenticated', { userId: data.user.id });
      } else {
        setUser(null);
        logger.debug('User not authenticated');
      }
    } catch (error) {
      logger.error('Failed to check auth status', error instanceof Error ? error : new Error(String(error)));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(() => {
    const currentUrl = window.location.href;
    const loginUrl = `/api/auth/user/login?returnUrl=${encodeURIComponent(currentUrl)}`;
    logger.info('Initiating login', { returnUrl: currentUrl });
    window.location.href = loginUrl;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/user/logout', { method: 'POST' });
      setUser(null);
      logger.info('User logged out');
    } catch (error) {
      logger.error('Failed to logout', error instanceof Error ? error : new Error(String(error)));
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    await checkAuthStatus();
  }, [checkAuthStatus]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}




