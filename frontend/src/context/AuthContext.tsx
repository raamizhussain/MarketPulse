import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  quickDemoLogin: (role: 'institutional' | 'admin' | 'retail') => Promise<void>;
  register: (email: string, pass: string, name: string, tier?: string) => Promise<void>;
  sendOTP: (email: string, purpose?: string) => Promise<{ message: string; otp_preview: string; expires_in: number }>;
  verifyOTP: (email: string, otpCode: string, fullName?: string, tier?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('mp_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mp_access_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
      localStorage.setItem('mp_user_profile', JSON.stringify(profile));
    } catch {
      // If token expired, clear
      setUser(null);
      localStorage.removeItem('mp_access_token');
      localStorage.removeItem('mp_refresh_token');
      localStorage.removeItem('mp_user_profile');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, pass);
      localStorage.setItem('mp_access_token', res.access_token);
      localStorage.setItem('mp_refresh_token', res.refresh_token);
      setToken(res.access_token);
      const profile = await api.getProfile();
      setUser(profile);
      localStorage.setItem('mp_user_profile', JSON.stringify(profile));
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (email: string, purpose: string = 'login') => {
    return await api.sendOTP(email, purpose);
  };

  const verifyOTP = async (email: string, otpCode: string, fullName?: string, tier: string = 'pro') => {
    setLoading(true);
    try {
      const res = await api.verifyOTP(email, otpCode, fullName, tier);
      localStorage.setItem('mp_access_token', res.access_token);
      localStorage.setItem('mp_refresh_token', res.refresh_token);
      setToken(res.access_token);
      const profile = await api.getProfile();
      setUser(profile);
      localStorage.setItem('mp_user_profile', JSON.stringify(profile));
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = async (role: 'institutional' | 'admin' | 'retail') => {
    if (role === 'admin') {
      await login('admin@marketpulse.ai', 'adminpassword123');
    } else if (role === 'retail') {
      await login('retail@marketpulse.ai', 'password123');
    } else {
      await login('demo@marketpulse.ai', 'password123');
    }
  };

  const register = async (email: string, pass: string, name: string, tier: string = 'pro') => {
    setLoading(true);
    try {
      const res = await api.register(email, pass, name, tier);
      localStorage.setItem('mp_access_token', res.access_token);
      localStorage.setItem('mp_refresh_token', res.refresh_token);
      setToken(res.access_token);
      const profile = await api.getProfile();
      setUser(profile);
      localStorage.setItem('mp_user_profile', JSON.stringify(profile));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('mp_access_token');
    localStorage.removeItem('mp_refresh_token');
    localStorage.removeItem('mp_user_profile');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        quickDemoLogin,
        register,
        sendOTP,
        verifyOTP,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
