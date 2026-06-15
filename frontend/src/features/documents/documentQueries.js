import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../../services/documentApi.js';

const key = (tripId) => ['documents', tripId];

export function useDocuments(tripId) {
  return useQuery({
    queryKey: key(tripId),
    queryFn: () => documentApi.list(tripId),
    enabled: Boolean(tripId),
  });
}

function useDocMutation(tripId, mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}

export const useUploadDocument = (tripId) =>
  useDocMutation(tripId, (formData) => documentApi.upload(tripId, formData));
export const useExtractDocument = (tripId) =>
  useDocMutation(tripId, ({ docId, text }) => documentApi.extract(tripId, docId, text));
export const useDeleteDocument = (tripId) =>
  useDocMutation(tripId, (docId) => documentApi.remove(tripId, docId));
