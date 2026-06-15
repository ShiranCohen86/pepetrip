import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripApi } from '../../services/tripApi.js';

export const tripKeys = {
  all: ['trips'],
  list: (filters) => ['trips', filters ?? {}],
  detail: (id) => ['trip', id],
};

export function useTrips(filters) {
  return useQuery({ queryKey: tripKeys.list(filters), queryFn: () => tripApi.list(filters) });
}

export function useTrip(id) {
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: () => tripApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tripApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => tripApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

/** Mutations on a single trip cache the returned trip directly into the detail query. */
function useTripDetailMutation(id, mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      qc.setQueryData(tripKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}

export const useGenerate = (id) => useTripDetailMutation(id, () => tripApi.generate(id));
export const useReorder = (id) => useTripDetailMutation(id, (body) => tripApi.reorder(id, body));
export const useUpdateTrip = (id) => useTripDetailMutation(id, (body) => tripApi.update(id, body));

export const useAddActivity = (id) =>
  useTripDetailMutation(id, ({ dayId, body }) => tripApi.addActivity(id, dayId, body));
export const useUpdateActivity = (id) =>
  useTripDetailMutation(id, ({ dayId, activityId, body }) =>
    tripApi.updateActivity(id, dayId, activityId, body),
  );
export const useDeleteActivity = (id) =>
  useTripDetailMutation(id, ({ dayId, activityId }) =>
    tripApi.deleteActivity(id, dayId, activityId),
  );

/** Member mutations return { members }, so just refetch the trip detail. */
function useMemberMutation(id, mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.detail(id) }),
  });
}
export const useAddMember = (id) => useMemberMutation(id, (body) => tripApi.addMember(id, body));
export const useRemoveMember = (id) =>
  useMemberMutation(id, (memberId) => tripApi.removeMember(id, memberId));
