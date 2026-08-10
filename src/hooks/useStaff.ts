import { useQuery } from '@tanstack/react-query';
import { getStaffList } from '../lib/queries/staff';

export const useStaff = () => {
  const query = useQuery({
    queryKey: ['staff'],
    queryFn: getStaffList,
  });

  return {
    ...query,
    staffList: query.data || [],
  };
};
