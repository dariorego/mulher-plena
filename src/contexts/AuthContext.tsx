import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      if (profile) {
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: profile.name,
          role: (roleData?.role as UserRole) || 'aluno',
          avatarUrl: profile.avatar_url || undefined,
          createdAt: profile.created_at,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          // Defer Supabase calls with setTimeout to avoid deadlock
          setTimeout(async () => {
            const userData = await fetchUserData(newSession.user);
            setUser(userData);
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        fetchUserData(existingSession.user).then((userData) => {
          setUser(userData);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  const register = async (email: string, password: string, name: string): Promise<{ error: string | null }> => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  const logout = async () => {
    if (user) {
      // Log logout directly to avoid circular dependency with useActivityLogger
      supabase
        .from('user_activity_logs')
        .insert([{ user_id: user.id, action: 'logout', resource_type: 'platform', metadata: {} }])
        .then(({ error }) => {
          if (error) console.error('Error logging logout:', error);
        });
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, register, logout }}>
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
