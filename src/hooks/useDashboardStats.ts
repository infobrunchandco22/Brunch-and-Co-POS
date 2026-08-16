import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../lib/queries/dashboard';

export const useDashboardStats = (
  dateRange: string = '7d',
  customStartDate?: string,
  customEndDate?: string
) => {
  return useQuery({
    queryKey: ['dashboard-stats', dateRange, customStartDate, customEndDate],
    queryFn: async () => {
      return getDashboardStats(dateRange, customStartDate, customEndDate);
    },
  });
};
