import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Couple {
  id: string;
  user1_id: string;
  user2_id: string | null;
  invite_code: string;
  created_at: string;
}

export const useCouple = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: couple, isLoading } = useQuery({
    queryKey: ["couple", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("couples")
        .select("*")
        .or(`user1_id.eq.${user!.id},user2_id.eq.${user!.id}`)
        .maybeSingle();
      if (error) throw error;
      return data as Couple | null;
    },
    enabled: !!user,
  });

  const createCouple = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("couples")
        .insert({ user1_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["couple"] }),
  });

  const joinCouple = useMutation({
    mutationFn: async (inviteCode: string) => {
      const code = inviteCode.trim().toLowerCase();
      if (!code) throw new Error("Wpisz kod zaproszenia");

      // Use a backend function so we don't need public SELECT access on `couples`
      const { data, error } = await supabase.rpc("join_couple", { invite_code: code });

      if (error) {
        // Normalize common messages to Polish UI copy
        const msg = error.message || "Nie udało się dołączyć";
        if (msg.toLowerCase().includes("nie możesz dołączyć")) {
          throw new Error("Nie możesz dołączyć do własnej pary");
        }
        if (msg.toLowerCase().includes("nieprawidłowy kod")) {
          throw new Error("Nieprawidłowy kod lub para już ma partnera");
        }
        throw new Error(msg);
      }

      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["couple"] }),
  });

  const hasPartner = !!couple && couple.user2_id !== null;
  const isCreator = couple?.user1_id === user?.id;

  return { couple, isLoading, createCouple, joinCouple, hasPartner, isCreator };
};
