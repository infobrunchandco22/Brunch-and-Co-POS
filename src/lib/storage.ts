import { supabase } from './supabase';

/**
 * Uploads a product image file to Supabase Storage ('product-images' bucket)
 * and returns the public HTTP URL for storing in products.image_url column.
 */
export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading product image to Supabase Storage:', error);
    // If bucket doesn't exist or upload fails, fall back to helpful error
    throw new Error(
      `Image upload failed (${error.message}). Please ensure the 'product-images' storage bucket exists in Supabase.`
    );
  }

  // Get public URL for uploaded object
  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Could not retrieve public URL for uploaded product image.');
  }

  return publicUrlData.publicUrl;
}
