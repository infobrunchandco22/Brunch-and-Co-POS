import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Customer } from '../types/database.types';
import {
  getCustomers,
  getCustomerDetail,
  createCustomer,
  updateCustomer,
} from '../lib/queries/customers';

export const useCustomers = (searchQuery?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: async () => {
      return getCustomers(searchQuery);
    },
  });

  const saveCustomer = useMutation({
    mutationFn: async (customerData: Partial<Customer> & { full_name: string; phone: string }) => {
      if (customerData.id) {
        return updateCustomer(customerData.id, customerData);
      } else {
        return createCustomer(customerData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return {
    ...query,
    customers: query.data || [],
    saveCustomer,
    getCustomerDetail,
  };
};
