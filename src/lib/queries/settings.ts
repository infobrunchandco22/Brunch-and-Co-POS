import { supabase } from '../supabase';
import { StoreSettings } from '../../types/database.types';

export const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'Brunch & Co',
  phone: '+92 300 0000000',
  address: 'F-7 Markaz, Islamabad',
  operating_hours: '9:00 AM – 6:00 PM, 7 Days a Week',
  default_delivery_fee: 150,
  default_service_charge: 50,
  paper_width: '80mm',
  auto_print_bill: true,
  auto_print_kot: true,
};

/**
 * Fetch settings directly from Supabase table `store_settings` (row id = 'default').
 * Real server-side data only; zero localStorage fallback.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  if (error || !data) {
    console.error('[StoreSettings] Failed to fetch settings from database:', error);
    throw new Error(error?.message || 'Failed to load store settings from database.');
  }

  return {
    id: data.id,
    store_name: data.store_name ?? DEFAULT_SETTINGS.store_name,
    phone: data.phone ?? DEFAULT_SETTINGS.phone,
    address: data.address ?? DEFAULT_SETTINGS.address,
    operating_hours: data.operating_hours ?? DEFAULT_SETTINGS.operating_hours,
    default_delivery_fee: Number(data.default_delivery_fee ?? DEFAULT_SETTINGS.default_delivery_fee),
    default_service_charge: Number(data.default_service_charge ?? DEFAULT_SETTINGS.default_service_charge),
    paper_width: (data.paper_width as '80mm' | '58mm') ?? DEFAULT_SETTINGS.paper_width,
    auto_print_bill: Boolean(data.auto_print_bill ?? DEFAULT_SETTINGS.auto_print_bill),
    auto_print_kot: Boolean(data.auto_print_kot ?? DEFAULT_SETTINGS.auto_print_kot),
    updated_at: data.updated_at,
  };
}

/**
 * Update store settings directly in Supabase table `store_settings` (row id = 'default').
 * Throws real error if update fails; zero localStorage write-through.
 */
export async function updateStoreSettings(newSettings: Partial<StoreSettings>): Promise<StoreSettings> {
  const payload: Record<string, any> = {
    ...newSettings,
    updated_at: new Date().toISOString(),
  };

  // Ensure primary key is not mutated
  delete payload.id;
  delete payload.created_at;

  const { data, error } = await supabase
    .from('store_settings')
    .update(payload)
    .eq('id', 'default')
    .select('*')
    .single();

  if (error || !data) {
    console.error('[StoreSettings] Failed to update settings in database:', error);
    throw new Error(error?.message || 'Failed to save store settings to database.');
  }

  return {
    id: data.id,
    store_name: data.store_name,
    phone: data.phone,
    address: data.address,
    operating_hours: data.operating_hours,
    default_delivery_fee: Number(data.default_delivery_fee),
    default_service_charge: Number(data.default_service_charge),
    paper_width: data.paper_width as '80mm' | '58mm',
    auto_print_bill: Boolean(data.auto_print_bill),
    auto_print_kot: Boolean(data.auto_print_kot),
    updated_at: data.updated_at,
  };
}
