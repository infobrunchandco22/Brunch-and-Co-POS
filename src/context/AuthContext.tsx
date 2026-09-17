import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { Staff } from '../types/database.types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
  pendingOrdersCount: number;
  showLoginToast: boolean;
  dismissLoginToast: () => void;
  refreshPendingCount: () => Promise<number>;
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
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [showLoginToast, setShowLoginToast] = useState<boolean>(false);

  const checkPendingOrdersOnce = async (): Promise<number> => {
    try {
      if (!isSupabaseConfigured) return 0;
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (!error && typeof count === 'number') {
        setPendingOrdersCount(count);
        if (count > 0) {
          setShowLoginToast(true);
        }
        return count;
      }
    } catch (err) {
      console.error('[AuthContext] Error checking pending orders count on login:', err);
    }
    return 0;
  };

  const dismissLoginToast = () => {
    setShowLoginToast(false);
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        if (!isSupabaseConfigured) {
          console.error('[Auth Init Warning] Supabase credentials missing or invalid. Defaulting to unauthenticated login requirement.');
          if (isMounted) {
            setStaffProfile(null);
            setSession(null);
          }
          return;
        }

        const { staffProfile: profile, session: currentSession } = await queryGetCurrentStaffProfile();
        if (isMounted) {
          setStaffProfile(profile);
          setSession(currentSession);
          if (profile) {
            await checkPendingOrdersOnce();
          }
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
          setPendingOrdersCount(0);
          setShowLoginToast(false);
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
      // Run once at login: fetch count of orders with status = 'pending'
      await checkPendingOrdersOnce();
    }
    return result;
  };

  const handleSignOutStaff = async () => {
    await querySignOutStaff();
    setStaffProfile(null);
    setSession(null);
    setPendingOrdersCount(0);
    setShowLoginToast(false);
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
        pendingOrdersCount,
        showLoginToast,
        dismissLoginToast,
        refreshPendingCount: checkPendingOrdersOnce,
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


