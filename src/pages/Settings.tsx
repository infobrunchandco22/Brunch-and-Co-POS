import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Store, Printer, DollarSign, Check, Save, Loader2 } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

export const Settings: React.FC = () => {
  const { settings, isLoading, saveSettings } = useSettings();

  // Store Settings State
  const [storeName, setStoreName] = useState('Brunch & Co');
  const [phone, setPhone] = useState('+92 (51) 234-5678');
  const [address, setAddress] = useState('F-7 Markaz, Islamabad');
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState(150);
  const [defaultServiceCharge, setDefaultServiceCharge] = useState(50);

  // Printer Settings State
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [autoPrintBill, setAutoPrintBill] = useState(true);
  const [autoPrintKot, setAutoPrintKot] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name ?? 'Brunch & Co');
      setPhone(settings.phone ?? '+92 (51) 234-5678');
      setAddress(settings.address ?? 'F-7 Markaz, Islamabad');
      setDefaultDeliveryFee(settings.default_delivery_fee ?? 150);
      setDefaultServiceCharge(settings.default_service_charge ?? 50);
      setPaperWidth(settings.paper_width ?? '80mm');
      setAutoPrintBill(settings.auto_print_bill ?? true);
      setAutoPrintKot(settings.auto_print_kot ?? true);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings.mutateAsync({
      store_name: storeName,
      phone,
      address,
      default_delivery_fee: defaultDeliveryFee,
      default_service_charge: defaultServiceCharge,
      paper_width: paperWidth,
      auto_print_bill: autoPrintBill,
      auto_print_kot: autoPrintKot,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-lg font-bold text-2xl text-[#e5e2e1] tracking-tight">
              Business & Hardware Settings
            </h2>
            <p className="text-xs text-[#9f8d85] mt-1">
              Configure store details, default charges, and thermal receipt hardware
            </p>
          </div>

          {savedSuccess && (
            <div className="flex items-center space-x-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold animate-fade-in">
              <Check className="w-4 h-4" />
              <span>Settings Saved!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Business Profile Section */}
          <div className="bg-[#1c1b1b] border border-[#353534] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#353534] pb-3">
              <Store className="w-5 h-5 text-[#fab895]" />
              <h3 className="font-bold text-sm text-[#e5e2e1]">Business Profile & Contact</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[#9f8d85] block mb-1">Kitchen / Business Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
                />
              </div>

              <div>
                <label className="text-[#9f8d85] block mb-1">Store Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[#9f8d85] block mb-1">Kitchen Address / Location</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Fees Defaults */}
          <div className="bg-[#1c1b1b] border border-[#353534] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#353534] pb-3">
              <DollarSign className="w-5 h-5 text-[#fab895]" />
              <h3 className="font-bold text-sm text-[#e5e2e1]">Default Order Charges & Pricing</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[#9f8d85] block mb-1">Default Delivery Fee (Rs)</label>
                <input
                  type="number"
                  min="0"
                  value={defaultDeliveryFee === 0 ? '' : defaultDeliveryFee}
                  onChange={(e) => setDefaultDeliveryFee(e.target.value === '' ? 0 : Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
                />
              </div>

              <div>
                <label className="text-[#9f8d85] block mb-1">Default Service Charge (Rs)</label>
                <input
                  type="number"
                  min="0"
                  value={defaultServiceCharge === 0 ? '' : defaultServiceCharge}
                  onChange={(e) => setDefaultServiceCharge(e.target.value === '' ? 0 : Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
                />
              </div>
            </div>
          </div>

          {/* Thermal Receipt Printer Hardware Setup */}
          <div className="bg-[#1c1b1b] border border-[#353534] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#353534] pb-3">
              <Printer className="w-5 h-5 text-[#fab895]" />
              <h3 className="font-bold text-sm text-[#e5e2e1]">Thermal Receipt Printer Setup</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[#9f8d85] block mb-2">Paper Roll Format</label>
                <div className="flex space-x-3">
                  <label
                    className={`flex-1 p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paperWidth === '80mm'
                        ? 'bg-[#6e4025] text-[#eeae8b] border-[#fab895]/50'
                        : 'bg-[#131313] text-[#9f8d85] border-[#353534]'
                    }`}
                  >
                    <div>
                      <p className="font-bold">80mm Wide Roll</p>
                      <p className="text-[10px] opacity-80">Standard POS receipt (340px width)</p>
                    </div>
                    <input
                      type="radio"
                      name="paperWidth"
                      checked={paperWidth === '80mm'}
                      onChange={() => setPaperWidth('80mm')}
                      className="hidden"
                    />
                  </label>

                  <label
                    className={`flex-1 p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paperWidth === '58mm'
                        ? 'bg-[#6e4025] text-[#eeae8b] border-[#fab895]/50'
                        : 'bg-[#131313] text-[#9f8d85] border-[#353534]'
                    }`}
                  >
                    <div>
                      <p className="font-bold">58mm Compact Roll</p>
                      <p className="text-[10px] opacity-80">Small thermal handheld device</p>
                    </div>
                    <input
                      type="radio"
                      name="paperWidth"
                      checked={paperWidth === '58mm'}
                      onChange={() => setPaperWidth('58mm')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#2a2a2a]">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPrintBill}
                    onChange={(e) => setAutoPrintBill(e.target.checked)}
                    className="rounded text-[#6e4025]"
                  />
                  <span className="text-[#e5e2e1]">
                    Automatically open Print Dialog when completing order in POS
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPrintKot}
                    onChange={(e) => setAutoPrintKot(e.target.checked)}
                    className="rounded text-[#6e4025]"
                  />
                  <span className="text-[#e5e2e1]">
                    Print Kitchen Order Ticket (KOT) copy for chefs
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saveSettings.isPending}
              className="bg-gradient-to-r from-[#6e4025] to-[#4d260d] hover:from-[#804b2b] hover:to-[#5c2d10] text-[#eeae8b] border border-[#fab895]/40 font-bold py-3 px-8 rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {saveSettings.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
