import React from 'react';
import { Reward, RewardRequirementType, RewardType } from '../../types/database.types';
import { Edit2, Gift, CheckCircle2, XCircle, Star, Coffee, DollarSign } from 'lucide-react';

interface RewardCampaignListProps {
  rewards: Reward[];
  onToggleActive: (rewardId: string, isActive: boolean) => void;
  onEditReward: (reward: Reward) => void;
}

export function formatRequirement(type: RewardRequirementType, value: Record<string, any>): string {
  if (!value) return 'No requirement specified';
  switch (type) {
    case 'order_count': {
      const count = value.count ?? value.target_orders ?? 0;
      return `Requires ${count} completed order${count === 1 ? '' : 's'}`;
    }
    case 'total_spent': {
      const amount = value.amount ?? value.target_amount ?? 0;
      return `Requires Rs ${Number(amount).toLocaleString()} total spend`;
    }
    case 'specific_product': {
      const count = value.count ?? value.target_count ?? 1;
      const itemName = value.product_name || 'specific item';
      return `Requires ${count} order${count === 1 ? '' : 's'} of ${itemName}`;
    }
    case 'single_order_value': {
      const amount = value.amount ?? value.min_order_value ?? 0;
      return `Requires single order over Rs ${Number(amount).toLocaleString()}`;
    }
    default:
      return 'Custom requirement';
  }
}

export function formatReward(type: RewardType, value: Record<string, any>): string {
  if (!value) return 'No reward specified';
  switch (type) {
    case 'discount_percent': {
      const percent = value.percent ?? value.percentage ?? 0;
      return `${percent}% off`;
    }
    case 'discount_flat': {
      const amount = value.amount ?? value.flat_amount ?? 0;
      return `Rs ${Number(amount).toLocaleString()} off`;
    }
    case 'free_item': {
      const name = value.product_name ?? value.item_name ?? 'Item';
      return `Free ${name}`;
    }
    case 'custom': {
      return value.details || value.value || 'Custom Perk';
    }
    default:
      return 'Perk Reward';
  }
}

export const RewardCampaignList: React.FC<RewardCampaignListProps> = ({
  rewards,
  onToggleActive,
  onEditReward,
}) => {
  const getIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'local_cafe':
        return <Coffee className="w-5 h-5 text-[#fab895]" />;
      case 'payments':
        return <DollarSign className="w-5 h-5 text-[#fab895]" />;
      case 'stars':
        return <Star className="w-5 h-5 text-[#fab895]" />;
      default:
        return <Gift className="w-5 h-5 text-[#fab895]" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rewards.map((reward) => (
        <div
          key={reward.id}
          className="bg-[#1c1b1b] border border-[#353534] rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-[#52443d] transition-all relative"
        >
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#2a2a2a] border border-[#353534] flex items-center justify-center shrink-0">
                  {getIcon(reward.icon_url)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#e5e2e1]">{reward.name}</h4>
                  <p className="text-[10px] text-[#9f8d85] font-label-caps uppercase tracking-wider">
                    Req Type: {reward.requirement_type.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onToggleActive(reward.id, !reward.is_active)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                  reward.is_active
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                    : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                }`}
              >
                {reward.is_active ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    <span>Inactive</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-[#d6c3b9] mb-3 leading-relaxed">
              {reward.description || 'Custom customer reward campaign.'}
            </p>

            {/* Campaign Rule Badges */}
            <div className="bg-[#131313] p-3 rounded-xl border border-[#2a2a2a] space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-[#9f8d85]">
                <span className="font-medium">Condition:</span>
                <span className="font-semibold text-[#e5e2e1]">
                  {formatRequirement(reward.requirement_type, reward.requirement_value)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#9f8d85]">
                <span className="font-medium">Reward:</span>
                <span className="font-semibold text-[#fab895]">
                  {formatReward(reward.reward_type, reward.reward_value)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#353534] flex justify-end">
            <button
              onClick={() => onEditReward(reward)}
              className="p-1.5 text-[#9f8d85] hover:text-[#e5e2e1] hover:bg-[#201f1f] rounded-lg transition-colors cursor-pointer text-xs font-semibold flex items-center space-x-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Campaign</span>
            </button>
          </div>
        </div>
      ))}
      {rewards.length === 0 && (
        <div className="col-span-full py-12 text-center text-[#9f8d85] text-xs bg-[#1c1b1b] border border-[#353534] rounded-2xl">
          No rewards yet — create your first campaign.
        </div>
      )}
    </div>
  );
};
