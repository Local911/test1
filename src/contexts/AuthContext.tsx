import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, primaryNiche: string, subNiche?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          // Update user profile
          const { error: profileError } = await supabase
            .from('users')
            .upsert({
              id: session.user.id,
              full_name: session.user.user_metadata.full_name,
              avatar_url: session.user.user_metadata.avatar_url,
              primary_niche: session.user.user_metadata.primary_niche,
              sub_niche: session.user.user_metadata.sub_niche,
              updated_at: new Date().toISOString()
            });

          if (profileError) {
            console.error('Error updating user profile:', profileError);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error initializing auth:', err);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
        setLoading(false);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
        return;
      }

      if (session?.user) {
        setUser(session.user);
        setLoading(false);

        // Update user profile
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            full_name: session.user.user_metadata.full_name,
            avatar_url: session.user.user_metadata.avatar_url,
            primary_niche: session.user.user_metadata.primary_niche,
            sub_niche: session.user.user_metadata.sub_niche,
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Error updating user profile:', profileError);
        }

        // Handle email confirmation
        if (event === 'SIGNED_IN') {
          const params = new URLSearchParams(window.location.search);
          if (params.get('email_confirmed') === 'true') {
            window.location.href = '/?email_confirmed=true';
          } else if (window.location.pathname === '/') {
            window.location.href = '/dashboard';
          }
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message === 'Email not confirmed') {
          throw new Error('Please check your email and confirm your account before signing in.');
        }
        if (error.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned from authentication');
      }

      setUser(data.user);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, primaryNiche: string, subNiche?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            primary_niche: primaryNiche,
            sub_niche: subNiche || null,
            avatar_url: null
          },
          emailRedirectTo: `${window.location.origin}/?email_confirmed=true`
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned from registration');
      }

      if (data.user.identities && data.user.identities.length === 0) {
        throw new Error('This email is already registered. Please sign in instead.');
      }

      return;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred during sign up');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`
      });

      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signInWithGoogle, 
      signOut,
      resetPassword 
    }}>
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
