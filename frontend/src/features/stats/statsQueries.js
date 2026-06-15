import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../../services/statsApi.js';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.get,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: statsApi.achievements,
    staleTime: 5 * 60 * 1000,
  });
}
