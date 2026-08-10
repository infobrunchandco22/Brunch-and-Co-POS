import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../lib/queries/dashboard';

export const useDashboardStats = (dateRange: string = '7d') => {
  return useQuery({
    queryKey: ['dashboard-stats', dateRange],
    queryFn: async () => {
      return getDashboardStats(dateRange);
    },
  });
};
