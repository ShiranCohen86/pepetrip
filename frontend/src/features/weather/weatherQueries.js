import { useQuery } from '@tanstack/react-query';
import { weatherApi } from '../../services/weatherApi.js';

export function useWeather(tripId, enabled = true) {
  return useQuery({
    queryKey: ['weather', tripId],
    queryFn: () => weatherApi.forTrip(tripId),
    enabled: Boolean(tripId) && enabled,
    staleTime: 30 * 60 * 1000, // 30 min — forecasts don't change often
    retry: 0,
  });
}
