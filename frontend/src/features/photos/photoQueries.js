import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { photoApi } from '../../services/photoApi.js';

const key = (tripId) => ['photos', tripId];

export function usePhotos(tripId) {
  return useQuery({
    queryKey: key(tripId),
    queryFn: () => photoApi.list(tripId),
    enabled: Boolean(tripId),
  });
}

function usePhotoMutation(tripId, mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  });
}

export const useUploadPhoto = (tripId) =>
  usePhotoMutation(tripId, (formData) => photoApi.upload(tripId, formData));
export const useDeletePhoto = (tripId) =>
  usePhotoMutation(tripId, (photoId) => photoApi.remove(tripId, photoId));
