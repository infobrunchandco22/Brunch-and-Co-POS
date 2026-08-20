import { supabase } from './supabase';

/**
 * Uploads a product image file to Supabase Storage ('product-images' bucket)
 * and returns the public HTTP URL for storing in products.image_url column.
 */
export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });

  if (error) {
    console.error('Error uploading product image to Supabase Storage:', error);
    throw new Error(
      `Product image upload failed: ${error.message}`
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Could not retrieve public URL for uploaded product image.');
  }

  return publicUrlData.publicUrl;
}

/**
 * Uploads a category image file to Supabase Storage ('category-images' bucket)
 * and returns the public HTTP URL for storing in categories.image_url column.
 */
export async function uploadCategoryImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `categories/${fileName}`;

  const { error } = await supabase.storage
    .from('category-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });

  if (error) {
    console.error('Error uploading category image to category-images bucket:', error);
    throw new Error(`Category image upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('category-images')
    .getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Could not retrieve public URL for uploaded category image.');
  }

  return publicUrlData.publicUrl;
}

/**
 * Uploads a reward image file to Supabase Storage ('reward-images' bucket)
 * and returns the public HTTP URL for storing in rewards.icon_url column.
 */
export async function uploadRewardImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `rewards/${fileName}`;

  const { error } = await supabase.storage
    .from('reward-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });

  if (error) {
    console.error('Error uploading reward image to reward-images bucket:', error);
    throw new Error(`Reward image upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('reward-images')
    .getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Could not retrieve public URL for uploaded reward image.');
  }

  return publicUrlData.publicUrl;
}

/**
 * Uploads a banner image file to Supabase Storage ('banner-images' bucket)
 * and returns the public HTTP URL for storing in banners.image_url column.
 */
export async function uploadBannerImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `banners/${fileName}`;

  const { error } = await supabase.storage
    .from('banner-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });

  if (error) {
    console.error('Error uploading banner image to banner-images bucket:', error);
    throw new Error(`Banner image upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('banner-images')
    .getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Could not retrieve public URL for uploaded banner image.');
  }

  return publicUrlData.publicUrl;
}
