import { supabase } from '../supabase';
import { Reward, CustomerRewardProgress } from '../../types/database.types';

/**
 * Fetch all reward campaigns.
 */
export async function getRewardCampaigns(): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching reward campaigns:', error);
    throw error;
  }

  return (data || []) as Reward[];
}

/**
 * Create a new reward campaign (Admin only).
 */
export async function createRewardCampaign(data: Partial<Reward> & { name: string }): Promise<Reward> {
  const payload = {
    name: data.name,
    description: data.description || null,
    icon_url: data.icon_url || 'stars',
    requirement_type: data.requirement_type || 'order_count',
    requirement_value: data.requirement_value || { count: 5 },
    reward_type: data.reward_type || 'free_item',
    reward_value: data.reward_value || { product_name: 'Free Item' },
    is_active: data.is_active ?? true,
  };

  const { data: created, error } = await supabase
    .from('rewards')
    .insert(payload)
    .select()
    .single();

  if (error || !created) {
    console.error('Error creating reward campaign:', error);
    throw error;
  }

  return created as Reward;
}

/**
 * Update an existing reward campaign (Admin only).
 */
export async function updateRewardCampaign(id: string, data: Partial<Reward>): Promise<Reward> {
  const { data: updated, error } = await supabase
    .from('rewards')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error || !updated) {
    console.error(`Error updating reward campaign ${id}:`, error);
    throw error;
  }

  return updated as Reward;
}

/**
 * Get unlocked rewards (joining customer_reward_progress where is_unlocked = true).
 */
export async function getUnlockedRewards(): Promise<CustomerRewardProgress[]> {
  const { data, error } = await supabase
    .from('customer_reward_progress')
    .select('*')
    .eq('is_unlocked', true)
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('Error fetching unlocked rewards:', error);
    throw error;
  }

  return (data || []) as CustomerRewardProgress[];
}

/**
 * Mark unlocked reward progress as claimed.
 * Updates ONLY is_claimed, claimed_at, and contacted_by per column-level grant permissions.
 */
export async function markRewardClaimed(id: string, staffId?: string): Promise<CustomerRewardProgress> {
  const updatePayload: Record<string, any> = {
    is_claimed: true,
    claimed_at: new Date().toISOString(),
  };

  if (staffId) {
    updatePayload.contacted_by = staffId;
  }

  const { data, error } = await supabase
    .from('customer_reward_progress')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error(`Error marking reward progress ${id} as claimed:`, error);
    throw error;
  }

  return data as CustomerRewardProgress;
}
