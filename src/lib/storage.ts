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
    throw new Error(
      `Image upload failed (${error.message}). Please ensure the 'product-images' storage bucket exists in Supabase.`
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

  // Try category-images bucket
  const { error } = await supabase.storage
    .from('category-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (!error) {
    const { data: publicUrlData } = supabase.storage
      .from('category-images')
      .getPublicUrl(filePath);
    return publicUrlData?.publicUrl || '';
  }

  // Fallback to product-images if category-images has an issue
  const { error: fbError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (fbError) {
    console.error('Error uploading category image:', error || fbError);
    throw new Error(`Category image upload failed (${error?.message || fbError?.message}).`);
  }

  const { data: fbUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return fbUrlData?.publicUrl || '';
}

/**
 * Uploads a reward image file to Supabase Storage ('reward-images' bucket)
 * and returns the public HTTP URL for storing in rewards.icon_url column.
 */
export async function uploadRewardImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `rewards/${fileName}`;

  // Try reward-images bucket
  const { error } = await supabase.storage
    .from('reward-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (!error) {
    const { data: publicUrlData } = supabase.storage
      .from('reward-images')
      .getPublicUrl(filePath);
    return publicUrlData?.publicUrl || '';
  }

  // Fallback to product-images
  const { error: fbError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (fbError) {
    console.error('Error uploading reward image:', error || fbError);
    throw new Error(`Reward image upload failed (${error?.message || fbError?.message}).`);
  }

  const { data: fbUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return fbUrlData?.publicUrl || '';
}

/**
 * Uploads a banner image file to Supabase Storage ('banner-images' bucket)
 * and returns the public HTTP URL for storing in banners.image_url column.
 */
export async function uploadBannerImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `banners/${fileName}`;

  // Try banner-images bucket
  const { error } = await supabase.storage
    .from('banner-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (!error) {
    const { data: publicUrlData } = supabase.storage
      .from('banner-images')
      .getPublicUrl(filePath);
    return publicUrlData?.publicUrl || '';
  }

  // Fallback to product-images
  const { error: fbError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (fbError) {
    console.error('Error uploading banner image:', error || fbError);
    throw new Error(`Banner image upload failed (${error?.message || fbError?.message}).`);
  }

  const { data: fbUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return fbUrlData?.publicUrl || '';
}
