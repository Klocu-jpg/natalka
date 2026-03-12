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
  recurrence: string;
  sort_order: number;
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
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Chore[];
    },
    enabled: !!user,
  });

  const addChore = useMutation({
    mutationFn: async (chore: { title: string; day_of_week: number; assigned_to?: string; recurrence?: string }) => {
      const { error } = await supabase.from("chores").insert({
        title: chore.title,
        day_of_week: chore.day_of_week,
        assigned_to: chore.assigned_to || "both",
        recurrence: chore.recurrence || "weekly",
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

  const reorderChore = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from("chores")
        .update({ sort_order: newOrder })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chores"] }),
  });

  const reorderChores = async (reorderedChores: Chore[]) => {
    const updates = reorderedChores.map((chore, index) => 
      reorderChore.mutateAsync({ id: chore.id, newOrder: index })
    );
    await Promise.all(updates);
  };

  // For daily chores, show them on every day
  const choresByDay = DAYS.map((_, index) => {
    return chores.filter((c) => {
      if (c.recurrence === "daily") return true;
      return c.day_of_week === index;
    });
  });

  return { chores, choresByDay, isLoading, addChore, toggleChore, deleteChore, reorderChore, reorderChores };
};
