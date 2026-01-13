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
      // Find the couple with this invite code
      const { data: coupleData, error: findError } = await supabase
        .from("couples")
        .select("*")
        .eq("invite_code", inviteCode.toLowerCase())
        .is("user2_id", null)
        .single();
      
      if (findError || !coupleData) {
        throw new Error("Nieprawidłowy kod lub para już ma partnera");
      }

      // Check if user is trying to join their own couple
      if (coupleData.user1_id === user!.id) {
        throw new Error("Nie możesz dołączyć do własnej pary");
      }

      // Delete user's existing couple if they created one (and it has no partner)
      const { data: existingCouple } = await supabase
        .from("couples")
        .select("*")
        .eq("user1_id", user!.id)
        .is("user2_id", null)
        .maybeSingle();

      if (existingCouple) {
        await supabase
          .from("couples")
          .delete()
          .eq("id", existingCouple.id);
      }

      // Join the couple
      const { error: updateError } = await supabase
        .from("couples")
        .update({ user2_id: user!.id })
        .eq("id", coupleData.id);
      
      if (updateError) throw updateError;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["couple"] }),
  });

  const hasPartner = !!couple && couple.user2_id !== null;
  const isCreator = couple?.user1_id === user?.id;

  return { couple, isLoading, createCouple, joinCouple, hasPartner, isCreator };
};
