import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '../../services/expenseApi.js';

export const expenseKeys = {
  list: (tripId) => ['expenses', tripId],
};

export function useExpenses(tripId) {
  return useQuery({
    queryKey: expenseKeys.list(tripId),
    queryFn: () => expenseApi.list(tripId),
    enabled: Boolean(tripId),
  });
}

function useExpenseMutation(tripId, mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.list(tripId) }),
  });
}

export const useCreateExpense = (tripId) =>
  useExpenseMutation(tripId, (body) => expenseApi.create(tripId, body));
export const useUpdateExpense = (tripId) =>
  useExpenseMutation(tripId, ({ expenseId, body }) => expenseApi.update(tripId, expenseId, body));
export const useDeleteExpense = (tripId) =>
  useExpenseMutation(tripId, (expenseId) => expenseApi.remove(tripId, expenseId));
