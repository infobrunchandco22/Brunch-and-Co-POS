import { supabase } from '../supabase';
import { Banner } from '../../types/database.types';

/**
 * Fetch all promotional banners ordered by sort_order.
 */
export async function getBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching banners:', error);
    throw error;
  }

  return (data || []) as Banner[];
}

/**
 * Create a new promotional banner.
 */
export async function createBanner(data: Partial<Banner> & { image_url: string }): Promise<Banner> {
  const payload = {
    image_url: data.image_url,
    title: data.title || null,
    subtitle: data.subtitle || null,
    link_product_id: data.link_product_id || null,
    sort_order: data.sort_order ?? 0,
    is_active: data.is_active ?? true,
    starts_at: data.starts_at || null,
    ends_at: data.ends_at || null,
  };

  const { data: created, error } = await supabase
    .from('banners')
    .insert(payload)
    .select()
    .single();

  if (error || !created) {
    console.error('Error creating banner:', error);
    throw error;
  }

  return created as Banner;
}

/**
 * Update an existing promotional banner.
 */
export async function updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
  const { data: updated, error } = await supabase
    .from('banners')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error || !updated) {
    console.error(`Error updating banner ${id}:`, error);
    throw error;
  }

  return updated as Banner;
}

/**
 * Delete a promotional banner by ID.
 */
export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) {
    console.error(`Error deleting banner ${id}:`, error);
    throw error;
  }
}
