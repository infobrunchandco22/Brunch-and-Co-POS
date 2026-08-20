import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { RewardCampaignList } from '../components/rewards/RewardCampaignList';
import { RewardForm } from '../components/rewards/RewardForm';
import { UnlockedRewardsTable } from '../components/rewards/UnlockedRewardsTable';
import { useRewards } from '../hooks/useRewards';
import { useCustomers } from '../hooks/useCustomers';
import { Reward } from '../types/database.types';
import { Plus, Gift } from 'lucide-react';

export const Rewards: React.FC = () => {
  const { rewards, unlockedRewards, toggleReward, saveReward, markClaimed } = useRewards();
  const { customers } = useCustomers();

  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [showRewardForm, setShowRewardForm] = useState(false);

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setShowRewardForm(true);
  };

  const handleSaveReward = (data: Partial<Reward> & { name: string }) => {
    saveReward.mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-lg font-bold text-2xl text-[#000000] tracking-tight">
              Customer Rewards & Perks
            </h2>
            <p className="text-xs text-[#7a4900] mt-1">
              Automated loyalty rules and staff perk redemption verification
            </p>
          </div>

          <button
            onClick={() => {
              setEditingReward(null);
              setShowRewardForm(true);
            }}
            className="flex items-center space-x-1.5 text-xs font-bold bg-[#000000] hover:bg-[#3d2500] text-[#FFFDF7] px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>

        {/* Active Campaigns Grid */}
        <RewardCampaignList
          rewards={rewards}
          onToggleActive={(id, isActive) => toggleReward.mutate({ rewardId: id, isActive })}
          onEditReward={handleEdit}
        />

        {/* Unlocked Rewards Redemption Directory */}
        <UnlockedRewardsTable
          unlockedList={unlockedRewards}
          rewards={rewards}
          customers={customers}
          onMarkClaimed={(id) => markClaimed.mutate(id)}
        />
      </div>

      {/* Reward Form Modal */}
      {showRewardForm && (
        <RewardForm
          reward={editingReward}
          onSave={handleSaveReward}
          onClose={() => setShowRewardForm(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default Rewards;
