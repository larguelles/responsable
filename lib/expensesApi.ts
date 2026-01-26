import { api } from './api';
import { postJSON } from './https';

export type Category = { id: string; name: string; createdAt: string };
export type Item = { id: string; name: string; createdAt: string };

export type Expense = {
  id: string;
  amountCents: number;
  occurredAt: string;
  createdAt: string;
  categoryId: string;
  itemId: string;
  category: Category;
  item: Item;
};

export type CreateExpenseInput = {
  amountCents: number;
  categoryName: string;
  itemName: string;
  occurredAt?: string; // ISO
};

export const getCategories = async () => {
  const { data } = await api.get<{ categories: Category[] }>('/categories');
  return data.categories;
};

export const getItems = async () => {
  const { data } = await api.get<{ items: Item[] }>('/items');
  return data.items;
};

export const getExpenses = async (params?: { from?: string; to?: string }) => {
  const { data } = await api.get<{ expenses: Expense[] }>('/expenses', { params });
  return data.expenses;
};

export const postExpense = async (input: CreateExpenseInput) => {
  const base = process.env.EXPO_PUBLIC_API_URL!;
  const { expense } = await postJSON<{ expense: Expense }>(`${base}/expenses`, input);

  return expense;
};
