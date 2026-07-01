// src/admin/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { adminApi } from '../adminApi.js';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setToken(session.access_token);
        setUser({
          id: session.user.id,
          name: session.user.email.split('@')[0],
          email: session.user.email,
          role: session.user.user_metadata?.role || 'super_admin'
        });
      }
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setToken(session.access_token);
        setUser({
          id: session.user.id,
          name: session.user.email.split('@')[0],
          email: session.user.email,
          role: session.user.user_metadata?.role || 'super_admin'
        });
      } else {
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await adminApi.login(email, password);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('greenwood_admin_token');
      localStorage.removeItem('greenwood_admin_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return { user, token, loading, login, logout, isAuthenticated: !!token };
};

export default useAuth;

