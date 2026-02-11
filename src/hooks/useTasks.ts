import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePartnerPush } from "@/hooks/usePartnerPush";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  due_date?: string;
  priority: "low" | "medium" | "high";
}

export const useTasks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { notifyPartner } = usePartnerPush();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const addTask = useMutation({
    mutationFn: async (title: string) => {
      const { error } = await supabase
        .from("tasks")
        .insert({ title, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: (_, title) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      notifyPartner("tasks", "Love App", `Nowe zadanie: ${title}`, "📝");
    },
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ completed })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return { tasks, isLoading, addTask, toggleTask, deleteTask };
};
