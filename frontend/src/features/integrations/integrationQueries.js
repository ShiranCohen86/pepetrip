import { useQuery } from '@tanstack/react-query';
import { integrationsApi } from '../../services/integrationsApi.js';

export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: integrationsApi.list,
    staleTime: 10 * 60 * 1000,
  });
}
