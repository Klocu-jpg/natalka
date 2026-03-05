import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Chore {
  id: string;
  user_id: string;
  couple_id: string | null;
  title: string;
  day_of_week: number;
  assigned_to: string;
  completed: boolean;
  recurring: boolean;
  created_at: string;
}

const DAYS = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

export const DAY_LABELS = DAYS;

export const useChores = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: chores = [], isLoading } = useQuery({
    queryKey: ["chores", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chores")
        .select("*")
        .order("day_of_week", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Chore[];
    },
    enabled: !!user,
  });

  const addChore = useMutation({
    mutationFn: async (chore: { title: string; day_of_week: number; assigned_to?: string }) => {
      const { error } = await supabase.from("chores").insert({
        title: chore.title,
        day_of_week: chore.day_of_week,
        assigned_to: chore.assigned_to || "both",
        user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chores"] }),
  });

  const toggleChore = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("chores")
        .update({ completed })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chores"] }),
  });

  const deleteChore = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chores"] }),
  });

  const choresByDay = DAYS.map((_, index) =>
    chores.filter((c) => c.day_of_week === index)
  );

  return { chores, choresByDay, isLoading, addChore, toggleChore, deleteChore };
};
