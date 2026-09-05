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
  loginDemo: (role?: 'consumer' | 'advocate') => void;
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
    localStorage.removeItem('demo_user_profile');
    setToken(null);
    setUser(null);
  }, []);

  const loadUserProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    // Check if token is local demo session
    if (token.startsWith('demo-session-token')) {
      const cached = localStorage.getItem('demo_user_profile');
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          logout();
        }
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const profile = await apiGetProfile();
      setUser(profile);
    } catch (err: any) {
      console.warn('Session token could not be verified with backend. Checking cached demo profile.');
      const cached = localStorage.getItem('demo_user_profile');
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          logout();
        }
      } else {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const loginDemo = (role: 'consumer' | 'advocate' = 'consumer') => {
    const isAdv = role === 'advocate';
    const demoUser: User = {
      id: isAdv ? 999 : 101,
      email: isAdv ? 'advocate.priya@legal.in' : 'rajesh.verma@example.com',
      full_name: isAdv ? 'Adv. Priya Deshmukh' : 'Rajesh Kumar Verma',
      phone_number: isAdv ? '+91 91234 56789' : '+91 98765 43210',
      is_advocate: isAdv,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    const mockToken = `demo-session-token-${Date.now()}`;
    localStorage.setItem('access_token', mockToken);
    localStorage.setItem('demo_user_profile', JSON.stringify(demoUser));
    setToken(mockToken);
    setUser(demoUser);
    setError(null);
  };

  const login = async (data: LoginRequest) => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiLogin(data);
      localStorage.setItem('access_token', res.access_token);
      localStorage.removeItem('demo_user_profile');
      setToken(res.access_token);
      setUser(res.user);
    } catch (err: any) {
      // Check if backend is offline, returned 404, network failure, or HTML (Vercel SPA rewrite fallback)
      const isBackendOffline =
        !err.response ||
        err.response.status === 404 ||
        err.code === 'ERR_NETWORK' ||
        typeof err.response?.data === 'string';

      if (isBackendOffline) {
        console.warn('Backend server is offline or not reachable. Provisioning local demo session.');
        const namePart = data.email.split('@')[0].replace(/[._]/g, ' ');
        const derivedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const fallbackUser: User = {
          id: Date.now(),
          email: data.email,
          full_name: derivedName || 'Consumer User',
          phone_number: '+91 98765 43210',
          is_advocate: false,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        const mockToken = `demo-session-token-${Date.now()}`;
        localStorage.setItem('access_token', mockToken);
        localStorage.setItem('demo_user_profile', JSON.stringify(fallbackUser));
        setToken(mockToken);
        setUser(fallbackUser);
        return;
      }

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
      localStorage.removeItem('demo_user_profile');
      setToken(res.access_token);
      setUser(res.user);
    } catch (err: any) {
      // Check if backend is offline, returned 404, network failure, or HTML (Vercel SPA rewrite fallback)
      const isBackendOffline =
        !err.response ||
        err.response.status === 404 ||
        err.code === 'ERR_NETWORK' ||
        typeof err.response?.data === 'string';

      if (isBackendOffline) {
        console.warn('Backend server is offline or not reachable. Registering local session.');
        const fallbackUser: User = {
          id: Date.now(),
          email: data.email,
          full_name: data.full_name || 'Consumer User',
          phone_number: data.phone_number || '+91 98765 43210',
          is_advocate: !!data.is_advocate,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        const mockToken = `demo-session-token-${Date.now()}`;
        localStorage.setItem('access_token', mockToken);
        localStorage.setItem('demo_user_profile', JSON.stringify(fallbackUser));
        setToken(mockToken);
        setUser(fallbackUser);
        return;
      }

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
      if (token && token.startsWith('demo-session-token')) {
        const currentUser = user || ({} as User);
        const updated: User = {
          ...currentUser,
          full_name: data.full_name || currentUser.full_name,
          phone_number: data.phone_number || currentUser.phone_number,
          is_advocate: data.is_advocate !== undefined ? data.is_advocate : currentUser.is_advocate,
        };
        localStorage.setItem('demo_user_profile', JSON.stringify(updated));
        setUser(updated);
        return updated;
      }
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
        loginDemo,
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
