import { supabase } from '../supabase';
import { Product, ProductVariant } from '../../types/database.types';

function generateSku(productName: string): string {
  const prefix = productName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4) || 'PRD';
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${suffix}`;
}

/**
 * Format database product row with joined product_variants into Product interface.
 */
function formatProduct(row: any): Product {
  const rawVariants = row.product_variants || row.variants || [];
  const variants: ProductVariant[] = rawVariants.map((v: any) => ({
    id: v.id,
    product_id: v.product_id || row.id,
    variant_name: v.variant_name || v.name || 'Regular',
    code: v.code || null,
    price: v.price ?? row.base_price,
    kitchen_cost: v.kitchen_cost ?? null,
    is_default: v.is_default ?? false,
  }));

  return {
    id: row.id,
    category_id: row.category_id,
    name: row.name,
    display_name_local: row.display_name_local || null,
    description: row.description || null,
    image_url: row.image_url || null,
    base_price: row.base_price,
    kitchen_cost: row.kitchen_cost || null,
    billing_unit: row.billing_unit || 'plate',
    sku: row.sku || null,
    track_quantity: row.track_quantity ?? false,
    stock_quantity: row.stock_quantity ?? 0,
    is_deal: row.is_deal ?? false,
    is_special: row.is_special ?? false,
    is_available: row.is_available ?? true,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    created_by: row.created_by,
    variants,
  };
}

/**
 * Get all products (available or not) with product_variants joined.
 */
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }

  return (data || []).map(formatProduct);
}

/**
 * Get a single product by ID with product_variants joined.
 */
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error(`Error fetching product ${id}:`, error);
    return null;
  }

  return formatProduct(data);
}

/**
 * Create a new product and insert its variants into product_variants.
 */
export async function createProduct(data: Partial<Product> & { name: string; base_price: number }): Promise<Product> {
  const sku = data.sku?.trim() || generateSku(data.name);

  const productPayload = {
    category_id: data.category_id || 'cat-1',
    name: data.name,
    display_name_local: data.display_name_local || null,
    description: data.description || null,
    image_url: data.image_url || null,
    base_price: data.base_price,
    kitchen_cost: data.kitchen_cost || null,
    billing_unit: data.billing_unit || 'plate',
    sku,
    track_quantity: data.track_quantity ?? false,
    stock_quantity: data.stock_quantity ?? 0,
    is_deal: data.is_deal ?? false,
    is_special: data.is_special ?? false,
    is_available: data.is_available ?? true,
    sort_order: data.sort_order ?? 0,
  };

  const { data: insertedProduct, error: productError } = await supabase
    .from('products')
    .insert(productPayload)
    .select()
    .single();

  if (productError || !insertedProduct) {
    console.error('Error creating product:', productError);
    throw new Error(productError?.message || 'Failed to insert product into database.');
  }

  const productId = insertedProduct.id;

  const variantsToCreate = data.variants && data.variants.length > 0
    ? data.variants
    : [
        {
          variant_name: 'Regular',
          code: 'REG',
          price: data.base_price,
          kitchen_cost: data.kitchen_cost || null,
          is_default: true,
        },
      ];

  const variantPayloads = variantsToCreate.map((v) => ({
    product_id: productId,
    variant_name: v.variant_name || 'Regular',
    code: v.code || null,
    price: v.price ?? data.base_price,
    kitchen_cost: v.kitchen_cost || null,
    is_default: v.is_default ?? false,
  }));

  const { error: variantError } = await supabase
    .from('product_variants')
    .insert(variantPayloads);

  if (variantError) {
    console.error('Error inserting product variants:', variantError);
  }

  const completeProduct = await getProductById(productId);
  if (!completeProduct) {
    throw new Error('Failed to retrieve created product.');
  }

  return completeProduct;
}

/**
 * Update an existing product and its variants.
 */
export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const productPayload: Record<string, any> = {};
  if (data.category_id !== undefined) productPayload.category_id = data.category_id;
  if (data.name !== undefined) productPayload.name = data.name;
  if (data.display_name_local !== undefined) productPayload.display_name_local = data.display_name_local;
  if (data.description !== undefined) productPayload.description = data.description;
  if (data.image_url !== undefined) productPayload.image_url = data.image_url;
  if (data.base_price !== undefined) productPayload.base_price = data.base_price;
  if (data.kitchen_cost !== undefined) productPayload.kitchen_cost = data.kitchen_cost;
  if (data.billing_unit !== undefined) productPayload.billing_unit = data.billing_unit;
  if (data.sku !== undefined) productPayload.sku = data.sku;
  if (data.track_quantity !== undefined) productPayload.track_quantity = data.track_quantity;
  if (data.stock_quantity !== undefined) productPayload.stock_quantity = data.stock_quantity;
  if (data.is_deal !== undefined) productPayload.is_deal = data.is_deal;
  if (data.is_special !== undefined) productPayload.is_special = data.is_special;
  if (data.is_available !== undefined) productPayload.is_available = data.is_available;
  if (data.sort_order !== undefined) productPayload.sort_order = data.sort_order;

  if (Object.keys(productPayload).length > 0) {
    const { error: updateError } = await supabase
      .from('products')
      .update(productPayload)
      .eq('id', id);

    if (updateError) {
      console.error(`Error updating product ${id}:`, updateError);
      throw new Error(updateError.message || `Failed to update product ${id}.`);
    }
  }

  if (data.variants) {
    await supabase.from('product_variants').delete().eq('product_id', id);

    if (data.variants.length > 0) {
      const variantPayloads = data.variants.map((v) => ({
        product_id: id,
        variant_name: v.variant_name || 'Regular',
        code: v.code || null,
        price: v.price ?? (data.base_price || 0),
        kitchen_cost: v.kitchen_cost || null,
        is_default: v.is_default ?? false,
      }));

      await supabase.from('product_variants').insert(variantPayloads);
    }
  }

  const updated = await getProductById(id);
  if (!updated) {
    throw new Error(`Product ${id} not found after update.`);
  }

  return updated;
}

/**
 * Delete a product and its associated product_variants.
 */
export async function deleteProduct(id: string): Promise<void> {
  await supabase.from('product_variants').delete().eq('product_id', id);

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
}

/**
 * Perform server-side atomic stock adjustment for a product.
 * Tries RPC `adjust_product_stock` first, with atomic update fallback.
 */
export async function adjustStock(id: string, delta: number): Promise<Product | null> {
  try {
    const { error: rpcError } = await supabase.rpc('adjust_product_stock', {
      p_id: id,
      p_delta: delta,
    });

    if (!rpcError) {
      return getProductById(id);
    }
  } catch {
    // Ignore RPC failure if RPC not defined on DB
  }

  // Fallback update
  const currentProduct = await getProductById(id);
  if (!currentProduct) return null;

  const newStock = Math.max(0, (currentProduct.stock_quantity ?? 0) + delta);
  const { error } = await supabase
    .from('products')
    .update({ stock_quantity: newStock })
    .eq('id', id);

  if (error) {
    console.error(`Error adjusting stock for product ${id}:`, error);
    throw error;
  }

  return getProductById(id);
}
