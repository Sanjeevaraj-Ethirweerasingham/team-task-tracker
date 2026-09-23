import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../db/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Ensure user has a record in our public.users table
  const ensureUserProfile = async (authUser, name) => {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .single();

    if (!existing) {
      await supabase.from('users').insert({
        id: authUser.id,
        name: name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email,
        role: '',
        active: true,
      });
    }
  };

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    // Create profile in users table
    if (data.user) {
      await ensureUserProfile(data.user, name);
    }
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Ensure profile exists (in case it was lost)
    if (data.user) {
      await ensureUserProfile(data.user);
    }
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
