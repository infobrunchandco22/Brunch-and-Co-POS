import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { Staff } from '../types/database.types';
import { supabase } from '../lib/supabase';
import {
  signInStaff as querySignInStaff,
  signOutStaff as querySignOutStaff,
  getCurrentStaffProfile as queryGetCurrentStaffProfile,
} from '../lib/queries/auth';

interface AuthContextType {
  staffProfile: Staff | null;
  user: Staff | null; // Alias for staffProfile for backwards compatibility
  session: Session | null;
  role: 'admin' | 'staff' | null;
  loading: boolean;
  signInStaff: (email: string, password: string) => Promise<{ staffProfile: Staff | null; error?: string }>;
  signOutStaff: () => Promise<void>;
  getCurrentStaffProfile: () => Promise<{ staffProfile: Staff | null; session: Session | null }>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffProfile, setStaffProfile] = useState<Staff | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { staffProfile: profile, session: currentSession } = await queryGetCurrentStaffProfile();
        if (isMounted) {
          setStaffProfile(profile);
          setSession(currentSession);
        }
      } catch (err) {
        console.error('Error initializing auth session:', err);
        if (isMounted) {
          setStaffProfile(null);
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'SIGNED_OUT' || !currentSession) {
        if (isMounted) {
          setStaffProfile(null);
          setSession(null);
          setLoading(false);
        }
      } else if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'INITIAL_SESSION' ||
        event === 'USER_UPDATED'
      ) {
        if (currentSession?.user) {
          const { staffProfile: profile, session: updatedSession } = await queryGetCurrentStaffProfile();
          if (isMounted) {
            setStaffProfile(profile);
            setSession(updatedSession);
            setLoading(false);
          }
        } else {
          if (isMounted) {
            setStaffProfile(null);
            setSession(null);
            setLoading(false);
          }
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignInStaff = async (email: string, password: string) => {
    const result = await querySignInStaff(email, password);
    if (result.staffProfile) {
      setStaffProfile(result.staffProfile);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
    }
    return result;
  };

  const handleSignOutStaff = async () => {
    await querySignOutStaff();
    setStaffProfile(null);
    setSession(null);
  };

  const loginWrapper = async (email: string, password: string) => {
    const result = await handleSignInStaff(email, password);
    return { error: result.error };
  };

  return (
    <AuthContext.Provider
      value={{
        staffProfile,
        user: staffProfile,
        session,
        role: staffProfile?.role ?? null,
        loading,
        signInStaff: handleSignInStaff,
        signOutStaff: handleSignOutStaff,
        getCurrentStaffProfile: queryGetCurrentStaffProfile,
        login: loginWrapper,
        logout: handleSignOutStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};


