import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  LoginRequest,
  RegisterRequest,
  UserProfileUpdate,
} from '../types';
import {
  loginUser as apiLogin,
  registerUser as apiRegister,
  getProfile as apiGetProfile,
  updateProfile as apiUpdateProfile,
} from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UserProfileUpdate) => Promise<User>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  }, []);

  const loadUserProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const profile = await apiGetProfile();
      setUser(profile);
    } catch (err: any) {
      console.warn('Session token invalid or expired. Logging out.');
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const login = async (data: LoginRequest) => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiLogin(data);
      localStorage.setItem('access_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.response?.data?.message || 'Failed to authenticate user.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiRegister(data);
      localStorage.setItem('access_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.response?.data?.message || 'Failed to register account.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: UserProfileUpdate): Promise<User> => {
    setError(null);
    setLoading(true);
    try {
      const updated = await apiUpdateProfile(data);
      setUser(updated);
      return updated;
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.response?.data?.message || 'Failed to update profile.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
