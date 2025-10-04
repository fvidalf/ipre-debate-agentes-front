import { useState, useEffect, useCallback } from 'react';
import { debateApi } from '@/lib/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = (): AuthState => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const isValid = await debateApi.checkAuth();
      setIsAuthenticated(isValid);
      
      // Store auth state in localStorage for UI persistence
      localStorage.setItem('auth:isAuthenticated', isValid.toString());
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('auth:isAuthenticated');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await debateApi.login(email, password);
      setIsAuthenticated(true);
      localStorage.setItem('auth:isAuthenticated', 'true');
    } catch (error) {
      setIsAuthenticated(false);
      localStorage.removeItem('auth:isAuthenticated');
      throw error; // Re-throw for UI error handling
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await debateApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      setIsAuthenticated(false);
      localStorage.removeItem('auth:isAuthenticated');
      setIsLoading(false);
    }
  }, []);

  // Handle global auth logout events (from 401 responses)
  useEffect(() => {
    const handleAuthLogout = () => {
      console.log('Auth logout event received');
      setIsAuthenticated(false);
      localStorage.removeItem('auth:isAuthenticated');
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check localStorage for previous auth state
      const storedAuthState = localStorage.getItem('auth:isAuthenticated');
      
      if (storedAuthState === 'true') {
        // Verify the httpOnly cookie is still valid
        await checkAuth();
      } else {
        setIsLoading(false);
        setIsAuthenticated(false);
      }
    };

    initAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };
};