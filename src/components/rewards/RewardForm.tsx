import React, { useState, useEffect } from 'react';
import { Reward, RewardRequirementType, RewardType } from '../../types/database.types';
import { X } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';

interface RewardFormProps {
  reward?: Reward | null;
  onSave: (data: Partial<Reward> & { name: string }) => void;
  onClose: () => void;
}

export const RewardForm: React.FC<RewardFormProps> = ({
  reward,
  onSave,
  onClose,
}) => {
  const { data: products = [] } = useProducts();
  const [name, setName] = useState(reward?.name || '');
  const [description, setDescription] = useState(reward?.description || '');
  const [iconUrl, setIconUrl] = useState(reward?.icon_url || 'local_cafe');
  const [reqType, setReqType] = useState<RewardRequirementType>(
    reward?.requirement_type || 'order_count'
  );
  const [reqValueVal, setReqValueVal] = useState<number>(5);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    (reward?.requirement_value?.product_id as string) || ''
  );
  const [rewardType, setRewardType] = useState<RewardType>(
    reward?.reward_type || 'free_item'
  );
  const [rewardValVal, setRewardValVal] = useState<string>('Free Iced Coffee');
  const [isActive, setIsActive] = useState(reward?.is_active ?? true);

  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products]);

  useEffect(() => {
    if (reward) {
      setName(reward.name);
      setDescription(reward.description || '');
      setIconUrl(reward.icon_url || 'local_cafe');
      setReqType(reward.requirement_type);
      setRewardType(reward.reward_type);
      setIsActive(reward.is_active);

      const rv = reward.requirement_value || {};
      const reqVal = rv.count ?? rv.amount ?? rv.target_orders ?? rv.target_amount ?? rv.min_order_value ?? 5;
      setReqValueVal(Number(reqVal) || 5);
      if (rv.product_id) {
        setSelectedProductId(String(rv.product_id));
      }

      const rewVal = reward.reward_value || {};
      const rewardValStr =
        rewVal.product_name ??
        rewVal.percent ??
        rewVal.amount ??
        rewVal.item_name ??
        rewVal.details ??
        'Free Iced Coffee';
      setRewardValVal(String(rewardValStr));
    }
  }, [reward]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    let reqObj: Record<string, any> = {};
    if (reqType === 'order_count') {
      reqObj = { count: Number(reqValueVal) || 1 };
    } else if (reqType === 'total_spent') {
      reqObj = { amount: Number(reqValueVal) || 0 };
    } else if (reqType === 'specific_product') {
      const prodId = selectedProductId || (products[0]?.id || 'prod-1');
      const selProd = products.find((p) => p.id === prodId);
      reqObj = {
        product_id: prodId,
        product_name: selProd ? selProd.name : 'Specific Item',
        count: Number(reqValueVal) || 1,
      };
    } else if (reqType === 'single_order_value') {
      reqObj = { amount: Number(reqValueVal) || 0 };
    }

    let rewObj: Record<string, any> = {};
    if (rewardType === 'discount_percent') {
      rewObj = { percent: Number(rewardValVal) || 15 };
    } else if (rewardType === 'discount_flat') {
      rewObj = { amount: Number(rewardValVal) || 500 };
    } else if (rewardType === 'free_item') {
      rewObj = { product_id: 'prod-3', product_name: rewardValVal || 'Free Coffee' };
    } else {
      rewObj = { details: rewardValVal };
    }

    onSave({
      id: reward?.id,
      name,
      description: description || null,
      icon_url: iconUrl,
      requirement_type: reqType,
      requirement_value: reqObj,
      reward_type: rewardType,
      reward_value: rewObj,
      is_active: isActive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1b1b] border border-[#52443d] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#353534] pb-3">
          <h3 className="font-bold text-base text-[#e5e2e1]">
            {reward ? 'Edit Reward Campaign' : 'Create New Reward Campaign'}
          </h3>
          <button
            onClick={onClose}
            className="text-[#9f8d85] hover:text-[#e5e2e1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[#9f8d85] block mb-1">Campaign Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Brunch Club Starter"
              className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
            />
          </div>

          <div>
            <label className="text-[#9f8d85] block mb-1">Description / Customer Instructions</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Complete 5 orders to unlock a free coffee."
              className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895] resize-none"
            />
          </div>

          <div className="space-y-3 bg-[#131313] p-3 rounded-xl border border-[#2a2a2a]">
            <div>
              <label className="text-[#9f8d85] block mb-1">Requirement Type</label>
              <select
                value={reqType}
                onChange={(e) => setReqType(e.target.value as RewardRequirementType)}
                className="w-full bg-[#1c1b1b] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
              >
                <option value="order_count">Order Count Target</option>
                <option value="total_spent">Total Lifetime Spent</option>
                <option value="specific_product">Specific Product Purchases</option>
                <option value="single_order_value">Single Order Value Threshold</option>
              </select>
            </div>

            {reqType === 'order_count' && (
              <div>
                <label className="text-[#9f8d85] block mb-1">Number of Orders</label>
                <input
                  type="number"
                  min="1"
                  value={reqValueVal || ''}
                  onChange={(e) => setReqValueVal(Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  placeholder="e.g. 5"
                  className="w-full bg-[#1c1b1b] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
                />
              </div>
            )}

            {reqType === 'total_spent' && (
              <div>
                <label className="text-[#9f8d85] block mb-1">Minimum Total Spent (Rs)</label>
                <input
                  type="number"
                  min="0"
                  value={reqValueVal || ''}
                  onChange={(e) => setReqValueVal(Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  placeholder="e.g. 5000"
                  className="w-full bg-[#1c1b1b] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
                />
              </div>
            )}

            {reqType === 'specific_product' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9f8d85] block mb-1">Select Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-[#1c1b1b] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#9f8d85] block mb-1">Times Ordered</label>
                  <input
                    type="number"
                    min="1"
                    value={reqValueVal || ''}
                    onChange={(e) => setReqValueVal(Number(e.target.value))}
                    onFocus={(e) => e.target.select()}
                    placeholder="e.g. 3"
                    className="w-full bg-[#1c1b1b] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
                  />
                </div>
              </div>
            )}

            {reqType === 'single_order_value' && (
              <div>
                <label className="text-[#9f8d85] block mb-1">Minimum Order Value (Rs)</label>
                <input
                  type="number"
                  min="0"
                  value={reqValueVal || ''}
                  onChange={(e) => setReqValueVal(Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  placeholder="e.g. 1500"
                  className="w-full bg-[#1c1b1b] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#9f8d85] block mb-1">Reward Type</label>
              <select
                value={rewardType}
                onChange={(e) => setRewardType(e.target.value as RewardType)}
                className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
              >
                <option value="free_item">Free Menu Item</option>
                <option value="discount_percent">Percentage Discount (%)</option>
                <option value="discount_flat">Flat Voucher Amount (Rs)</option>
                <option value="custom">Custom Perk</option>
              </select>
            </div>

            <div>
              <label className="text-[#9f8d85] block mb-1">Reward Outcome Detail</label>
              <input
                type="text"
                value={rewardValVal}
                onChange={(e) => setRewardValVal(e.target.value)}
                placeholder="e.g. Free Iced Coffee or 15%"
                className="w-full bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActiveRew"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-[#6e4025]"
            />
            <label htmlFor="isActiveRew" className="text-[#e5e2e1] cursor-pointer">
              Reward Active & Tracked in System
            </label>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#353534]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#131313] text-[#9f8d85] rounded-xl font-semibold hover:text-[#e5e2e1] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#6e4025] hover:bg-[#804b2b] text-[#eeae8b] border border-[#fab895]/30 rounded-xl font-bold transition-all cursor-pointer"
            >
              Save Reward
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
