import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Reward } from '../types/database.types';
import {
  getRewardCampaigns,
  createRewardCampaign,
  updateRewardCampaign,
  getUnlockedRewards,
  markRewardClaimed,
} from '../lib/queries/rewards';
import { useAuth } from './useAuth';

export const useRewards = () => {
  const queryClient = useQueryClient();
  const { user: currentStaff } = useAuth();

  const query = useQuery({
    queryKey: ['rewards'],
    queryFn: getRewardCampaigns,
  });

  const unlockedTableQuery = useQuery({
    queryKey: ['rewards-unlocked'],
    queryFn: getUnlockedRewards,
  });

  const toggleReward = useMutation({
    mutationFn: async ({ rewardId, isActive }: { rewardId: string; isActive: boolean }) => {
      return updateRewardCampaign(rewardId, { is_active: isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });

  const saveReward = useMutation({
    mutationFn: async (rewardData: Partial<Reward> & { name: string }) => {
      if (rewardData.id) {
        return updateRewardCampaign(rewardData.id, rewardData);
      } else {
        return createRewardCampaign(rewardData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });

  const markClaimed = useMutation({
    mutationFn: async (progressId: string) => {
      return markRewardClaimed(progressId, currentStaff?.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards-unlocked'] });
    },
  });

  return {
    ...query,
    rewards: query.data || [],
    unlockedRewards: unlockedTableQuery.data || [],
    toggleReward,
    saveReward,
    markClaimed,
  };
};
