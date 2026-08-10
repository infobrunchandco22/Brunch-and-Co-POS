import { supabase } from '../supabase';
import { Staff } from '../../types/database.types';

/**
 * Get all active staff members for the POS "Created By Staff" dropdown.
 * Returns id, full_name, role ordered by full_name.
 *
 * Note: RLS applies — this will only return rows the current user is
 * allowed to SELECT (e.g. an "admin can read all staff" policy).
 */
export async function getStaffList(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from('staff')
    .select('id, full_name, role')
    .eq('is_active', true)
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching staff list:', error);
    throw error;
  }

  return (data || []) as Staff[];
}
