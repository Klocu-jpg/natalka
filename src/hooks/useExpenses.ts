import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCouple } from "./useCouple";
import { usePartnerPush } from "@/hooks/usePartnerPush";

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: string;
  user_id: string;
  couple_id: string | null;
  amount: number;
  description: string;
  category_id: string;
  date: string;
  created_at: string;
}

export const useExpenses = () => {
  const { user } = useAuth();
  const { couple } = useCouple();
  const queryClient = useQueryClient();
  const { notifyPartner } = usePartnerPush();

  const { data: categories = [] } = useQuery({
    queryKey: ["expense_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_categories")
        .select("*");
      if (error) throw error;
      return data as ExpenseCategory[];
    },
  });

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses", user?.id, couple?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!user,
  });

  const addExpense = useMutation({
    mutationFn: async (expense: { amount: number; description: string; category_id: string; date: string }) => {
      const { error } = await supabase
        .from("expenses")
        .insert({ 
          ...expense, 
          user_id: user!.id,
          couple_id: couple?.id || null
        });
      if (error) throw error;
      return expense;
    },
    onSuccess: (_, expense) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      notifyPartner("expenses", "Love App", `💰 Nowy wydatek: ${expense.description} — ${expense.amount} zł`, "💰");
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  // Calculate stats
  const totalThisMonth = expenses
    .filter(e => {
      const expenseDate = new Date(e.date);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const byCategory = categories.map(cat => {
    const total = expenses
      .filter(e => e.category_id === cat.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { ...cat, total };
  }).filter(c => c.total > 0);

  return { expenses, categories, isLoading, addExpense, deleteExpense, totalThisMonth, byCategory };
};
