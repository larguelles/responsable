import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCategories, getExpenses, getItems, postExpense } from '../lib/expensesApi';

export const useCategories = () => {
  return useQuery({ queryKey: ['categories'], queryFn: getCategories });
};

export const useItems = () => {
  return useQuery({ queryKey: ['items'], queryFn: getItems });
};

export const useExpenses = (params?: { from?: string; to?: string }) => {
  return useQuery({
    queryKey: ['expenses', params ?? {}],
    queryFn: () => getExpenses(params),
  });
};

export const useCreateExpense = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: postExpense,
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['expenses'] }),
        qc.invalidateQueries({ queryKey: ['categories'] }),
        qc.invalidateQueries({ queryKey: ['items'] }),
      ]);
    },
  });
};
