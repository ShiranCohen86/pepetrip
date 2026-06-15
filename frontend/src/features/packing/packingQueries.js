import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { packingApi } from '../../services/packingApi.js';

export const packingKeys = {
  detail: (tripId) => ['packing', tripId],
};

export function usePacking(tripId) {
  return useQuery({
    queryKey: packingKeys.detail(tripId),
    queryFn: () => packingApi.get(tripId),
    enabled: Boolean(tripId),
  });
}

function usePackingMutation(tripId, mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => qc.setQueryData(packingKeys.detail(tripId), data),
  });
}

export const useGeneratePacking = (tripId) =>
  usePackingMutation(tripId, () => packingApi.generate(tripId));
export const useAddPackingItem = (tripId) =>
  usePackingMutation(tripId, (body) => packingApi.addItem(tripId, body));
export const useUpdatePackingItem = (tripId) =>
  usePackingMutation(tripId, ({ itemId, body }) => packingApi.updateItem(tripId, itemId, body));
export const useDeletePackingItem = (tripId) =>
  usePackingMutation(tripId, (itemId) => packingApi.deleteItem(tripId, itemId));
