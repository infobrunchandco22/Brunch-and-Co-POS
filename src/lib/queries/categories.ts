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
  const { data: inserted, error } = await supabase
    .from('categories')
    .insert({
      name: data.name,
      sort_order: data.sort_order ?? 99,
      is_active: data.is_active ?? true,
      image_url: data.image_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return inserted as Category;
}

/**
 * Update an existing category in Supabase by ID.
 */
export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  const updatePayload: Record<string, any> = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.sort_order !== undefined) updatePayload.sort_order = data.sort_order;
  if (data.is_active !== undefined) updatePayload.is_active = data.is_active;
  if (data.image_url !== undefined) updatePayload.image_url = data.image_url;

  const { data: updated, error } = await supabase
    .from('categories')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating category ${id}:`, error);
    throw error;
  }

  return updated as Category;
}
