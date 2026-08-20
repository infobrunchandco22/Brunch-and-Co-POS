import { supabase } from '../supabase';
import { Category } from '../../types/database.types';

/**
 * Fetch all categories from Supabase ordered by sort_order.
 */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return (data || []) as Category[];
}

/**
 * Create a new category in Supabase.
 */
export async function createCategory(data: Partial<Category> & { name: string }): Promise<Category> {
  const insertPayload: Record<string, any> = {
    name: data.name,
    sort_order: data.sort_order ?? 99,
    is_active: data.is_active ?? true,
  };

  const hasImage = typeof data.image_url === 'string' && data.image_url.trim().length > 0;
  if (hasImage) {
    insertPayload.image_url = data.image_url!.trim();
  }

  try {
    const { data: inserted, error } = await supabase
      .from('categories')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      // If error is PGRST204 (image_url column not found in schema cache), retry without image_url
      if ((error.code === 'PGRST204' || error.message?.includes('image_url') || error.message?.includes('column')) && hasImage) {
        delete insertPayload.image_url;
        const retryRes = await supabase
          .from('categories')
          .insert(insertPayload)
          .select()
          .single();
        if (retryRes.error) throw retryRes.error;
        return retryRes.data as Category;
      }
      throw error;
    }

    return inserted as Category;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

/**
 * Update an existing category in Supabase by ID.
 */
export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  const updatePayload: Record<string, any> = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.sort_order !== undefined) updatePayload.sort_order = data.sort_order;
  if (data.is_active !== undefined) updatePayload.is_active = data.is_active;

  const hasImage = typeof data.image_url === 'string' && data.image_url.trim().length > 0;
  if (hasImage) {
    updatePayload.image_url = data.image_url!.trim();
  }

  try {
    const { data: updated, error } = await supabase
      .from('categories')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // If error is PGRST204 (image_url column not found in schema cache), retry without image_url
      if ((error.code === 'PGRST204' || error.message?.includes('image_url') || error.message?.includes('column')) && hasImage) {
        delete updatePayload.image_url;
        const retryRes = await supabase
          .from('categories')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();
        if (retryRes.error) throw retryRes.error;
        return retryRes.data as Category;
      }
      throw error;
    }

    return updated as Category;
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    throw error;
  }
}
