import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DateIdea {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export const useDateIdeas = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ["date_ideas", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("date_ideas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DateIdea[];
    },
    enabled: !!user,
  });

  const addIdea = useMutation({
    mutationFn: async (title: string) => {
      const { error } = await supabase
        .from("date_ideas")
        .insert({ title, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["date_ideas"] }),
  });

  const toggleIdea = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("date_ideas")
        .update({ completed })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["date_ideas"] }),
  });

  return { ideas, isLoading, addIdea, toggleIdea };
};
