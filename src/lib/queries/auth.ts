import { supabase } from '../supabase';
import { Staff } from '../../types/database.types';

/**
 * Sign in a staff member using Supabase Auth (email/password).
 * Checks that a corresponding row exists in the `staff` table.
 * If no matching staff row exists, signs out immediately and returns an error.
 */
export async function signInStaff(
  email: string,
  password: string
): Promise<{ staffProfile: Staff | null; error?: string }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { staffProfile: null, error: authError?.message || 'Invalid email or password.' };
    }

    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (staffError || !staffData || staffData.is_active === false) {
      // Sign out immediately if no valid active staff row exists
      await supabase.auth.signOut();
      return {
        staffProfile: null,
        error: 'This account is not authorized for staff access',
      };
    }

    return { staffProfile: staffData as Staff };
  } catch (err: any) {
    return { staffProfile: null, error: err?.message || 'An unexpected error occurred during sign in.' };
  }
}

/**
 * Sign out the currently logged-in staff member.
 */
export async function signOutStaff(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Error signing out staff:', err);
  }
}

/**
 * Get current staff profile by joining the active Supabase Auth session to the `staff` table row.
 * Returns null if no active session or if no matching staff row exists.
 */
export async function getCurrentStaffProfile(): Promise<{ staffProfile: Staff | null; session: any }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { staffProfile: null, session: null };
    }

    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (staffError || !staffData || staffData.is_active === false) {
      // User is logged into Supabase Auth but has no valid staff row
      await supabase.auth.signOut();
      return { staffProfile: null, session: null };
    }

    return { staffProfile: staffData as Staff, session };
  } catch (err) {
    console.error('Error fetching current staff profile:', err);
    return { staffProfile: null, session: null };
  }
}
