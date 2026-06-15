import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAuthTokens, clearAuthTokens, setOnTokenExpired } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  ACCESS: '@ppg_access_token',
  REFRESH: '@ppg_refresh_token',
  USER: '@ppg_user',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout/');
    } catch {}
    clearAuthTokens();
    setUser(null);
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS,
      STORAGE_KEYS.REFRESH,
      STORAGE_KEYS.USER,
    ]);
  }, []);

  useEffect(() => {
    setOnTokenExpired(logout);
  }, [logout]);

  useEffect(() => {
    (async () => {
      try {
        const [access, refresh, userJson] = await AsyncStorage.multiGet([
          STORAGE_KEYS.ACCESS,
          STORAGE_KEYS.REFRESH,
          STORAGE_KEYS.USER,
        ]);
        if (access[1] && refresh[1]) {
          setAuthTokens(access[1], refresh[1]);
          if (userJson[1]) {
            setUser(JSON.parse(userJson[1]));
          } else {
            const me = await api.get('/auth/me/');
            setUser(me.data);
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(me.data));
          }
        }
      } catch {
        await logout();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (phoneNumber, password) => {
    const res = await api.post('/auth/login/', {
      phone_number: phoneNumber,
      password,
      device_id: `mobile-${Date.now()}`,
    });
    const { access, refresh } = res.data;
    setAuthTokens(access, refresh);
    const me = await api.get('/auth/me/');
    setUser(me.data);
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS, access],
      [STORAGE_KEYS.REFRESH, refresh],
      [STORAGE_KEYS.USER, JSON.stringify(me.data)],
    ]);
    return me.data;
  };

  const signup = async (phoneNumber, password, role = 'PASSENGER') => {
    const res = await api.post('/auth/register/', {
      phone_number: phoneNumber,
      password,
      role,
    });
    return res.data;
  };

  const updateProfile = async (data) => {
    const res = await api.patch('/auth/me/', data);
    setUser(res.data);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data));
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        role: user?.role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
