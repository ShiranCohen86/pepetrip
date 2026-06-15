import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi.js';

export function useAdminOverview() {
  return useQuery({ queryKey: ['admin', 'overview'], queryFn: adminApi.overview });
}
