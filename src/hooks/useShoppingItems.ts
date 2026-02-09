import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePartnerPush } from "@/hooks/usePartnerPush";

export interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
  category?: string;
}

export const useShoppingItems = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { notifyPartner } = usePartnerPush();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["shopping_items", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shopping_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ShoppingItem[];
    },
    enabled: !!user,
  });

  const addItem = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from("shopping_items")
        .insert({ name, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: (_, name) => {
      queryClient.invalidateQueries({ queryKey: ["shopping_items"] });
      notifyPartner("shopping", "Love App 🛒", `Dodano do listy zakupów: ${name}`);
    },
  });

  const toggleItem = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("shopping_items")
        .update({ completed })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shopping_items"] }),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("shopping_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shopping_items"] }),
  });

  return { items, isLoading, addItem, toggleItem, deleteItem };
};
