import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCouple } from "./useCouple";

export interface SavingsGoal {
  id: string;
  couple_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  emoji: string;
  created_at: string;
}

export interface SavingsContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  note: string | null;
  created_at: string;
}

export const useSavingsGoals = () => {
  const { user } = useAuth();
  const { couple } = useCouple();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["savings_goals", couple?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("savings_goals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SavingsGoal[];
    },
    enabled: !!couple,
  });

  const { data: contributions = [] } = useQuery({
    queryKey: ["savings_contributions", couple?.id],
    queryFn: async () => {
      const goalIds = goals.map(g => g.id);
      if (goalIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("savings_contributions")
        .select("*")
        .in("goal_id", goalIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SavingsContribution[];
    },
    enabled: goals.length > 0,
  });

  const addGoal = useMutation({
    mutationFn: async (goal: { title: string; target_amount: number; deadline?: string; emoji?: string }) => {
      const { error } = await supabase
        .from("savings_goals")
        .insert({ 
          couple_id: couple!.id,
          title: goal.title,
          target_amount: goal.target_amount,
          deadline: goal.deadline || null,
          emoji: goal.emoji || "💰"
        });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savings_goals"] }),
  });

  const addContribution = useMutation({
    mutationFn: async (contribution: { goal_id: string; amount: number; note?: string }) => {
      const { error } = await supabase
        .from("savings_contributions")
        .insert({ 
          goal_id: contribution.goal_id,
          user_id: user!.id,
          amount: contribution.amount,
          note: contribution.note || null
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings_goals"] });
      queryClient.invalidateQueries({ queryKey: ["savings_contributions"] });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("savings_goals")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savings_goals"] }),
  });

  const deleteContribution = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("savings_contributions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings_goals"] });
      queryClient.invalidateQueries({ queryKey: ["savings_contributions"] });
    },
  });

  // Calculate total saved across all goals
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);

  return { 
    goals, 
    contributions, 
    isLoading, 
    addGoal, 
    addContribution, 
    deleteGoal, 
    deleteContribution,
    totalSaved,
    totalTarget
  };
};
