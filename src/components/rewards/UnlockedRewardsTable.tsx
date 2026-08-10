import React from 'react';
import { CustomerRewardProgress, Reward, Customer } from '../../types/database.types';
import { formatDate } from '../../lib/utils';
import { CheckCircle2, Gift, Clock } from 'lucide-react';

interface UnlockedRewardsTableProps {
  unlockedList: CustomerRewardProgress[];
  rewards: Reward[];
  customers: Customer[];
  onMarkClaimed: (progressId: string) => void;
}

export const UnlockedRewardsTable: React.FC<UnlockedRewardsTableProps> = ({
  unlockedList,
  rewards,
  customers,
  onMarkClaimed,
}) => {
  const getCustomerName = (custId: string) => {
    const found = customers.find((c) => c.id === custId);
    return found ? `${found.full_name} (${found.phone})` : custId;
  };

  const getRewardName = (rewId: string) => {
    const found = rewards.find((r) => r.id === rewId);
    return found ? found.name : rewId;
  };

  return (
    <div className="bg-[#1c1b1b] border border-[#353534] rounded-2xl overflow-hidden shadow-lg mt-6">
      <div className="p-5 border-b border-[#353534]">
        <h3 className="font-headline-lg font-bold text-base text-[#e5e2e1]">
          Customer Unlocked Perks Directory
        </h3>
        <p className="text-xs text-[#9f8d85]">
          Staff verification log for redeemed and available customer rewards
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-table-data text-[#d6c3b9]">
          <thead className="bg-[#131313] text-[#9f8d85] font-label-caps uppercase text-[10px] tracking-wider border-b border-[#353534]">
            <tr>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Earned Perk</th>
              <th className="py-3 px-4">Unlocked Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Redemption Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {unlockedList.map((item) => (
              <tr key={item.id} className="hover:bg-[#201f1f] transition-colors">
                <td className="py-3.5 px-4 font-bold text-[#e5e2e1]">
                  {getCustomerName(item.customer_id)}
                </td>
                <td className="py-3.5 px-4 text-[#fab895] font-semibold">
                  {getRewardName(item.reward_id)}
                </td>
                <td className="py-3.5 px-4 text-[#9f8d85]">
                  {item.unlocked_at ? formatDate(item.unlocked_at) : 'Recently'}
                </td>
                <td className="py-3.5 px-4">
                  {item.is_claimed ? (
                    <span className="inline-flex items-center space-x-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-2.5 py-1 rounded-full text-[11px] font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Redeemed & Claimed</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 bg-amber-950/60 text-amber-400 border border-amber-800/50 px-2.5 py-1 rounded-full text-[11px] font-medium">
                      <Clock className="w-3 h-3" />
                      <span>Ready to Claim</span>
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  {!item.is_claimed && (
                    <button
                      onClick={() => onMarkClaimed(item.id)}
                      className="bg-[#6e4025] hover:bg-[#804b2b] text-[#eeae8b] px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Mark as Claimed
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {unlockedList.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#9f8d85] text-xs">
                  No unlocked customer rewards yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
