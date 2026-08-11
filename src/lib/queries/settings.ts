import { supabase } from '../supabase';
import { StoreSettings } from '../../types/database.types';

export const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'Brunch & Co',
  phone: '+92 (51) 234-5678',
  address: 'F-7 Markaz, Islamabad',
  default_delivery_fee: 150,
  default_service_charge: 50,
  paper_width: '80mm',
  auto_print_bill: true,
  auto_print_kot: true,
};

const LOCAL_STORAGE_KEY = 'brunch_co_store_settings';

/**
 * Fetch settings from Supabase table `store_settings` with localStorage fallback.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (data && !error) {
      const merged: StoreSettings = {
        store_name: data.store_name ?? DEFAULT_SETTINGS.store_name,
        phone: data.phone ?? DEFAULT_SETTINGS.phone,
        address: data.address ?? DEFAULT_SETTINGS.address,
        default_delivery_fee: data.default_delivery_fee ?? DEFAULT_SETTINGS.default_delivery_fee,
        default_service_charge: data.default_service_charge ?? DEFAULT_SETTINGS.default_service_charge,
        paper_width: (data.paper_width as '80mm' | '58mm') ?? DEFAULT_SETTINGS.paper_width,
        auto_print_bill: data.auto_print_bill ?? DEFAULT_SETTINGS.auto_print_bill,
        auto_print_kot: data.auto_print_kot ?? DEFAULT_SETTINGS.auto_print_kot,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch {
    // Ignore errors if table does not exist yet on remote DB
  }

  // Fallback to local storage or defaults
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore parse error
    }
  }

  return DEFAULT_SETTINGS;
}

/**
 * Upsert store settings to Supabase table `store_settings` with local persistence.
 */
export async function updateStoreSettings(newSettings: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const updated: StoreSettings = {
    ...current,
    ...newSettings,
  };

  // Always save locally immediately
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  try {
    const payload = {
      id: 'default',
      store_name: updated.store_name,
      phone: updated.phone,
      address: updated.address,
      default_delivery_fee: updated.default_delivery_fee,
      default_service_charge: updated.default_service_charge,
      paper_width: updated.paper_width,
      auto_print_bill: updated.auto_print_bill,
      auto_print_kot: updated.auto_print_kot,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('store_settings')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.warn('[StoreSettings] Supabase upsert notice:', error.message);
    } else if (data) {
      const merged: StoreSettings = {
        store_name: data.store_name,
        phone: data.phone,
        address: data.address,
        default_delivery_fee: data.default_delivery_fee,
        default_service_charge: data.default_service_charge,
        paper_width: data.paper_width,
        auto_print_bill: data.auto_print_bill,
        auto_print_kot: data.auto_print_kot,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('[StoreSettings] Exception persist settings:', err);
  }

  return updated;
}
