import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCouple } from "./useCouple";

export interface Anniversary {
  id: string;
  couple_id: string;
  start_date: string;
  name: string;
  created_at: string;
}

export const useAnniversary = () => {
  const { couple } = useCouple();
  const queryClient = useQueryClient();

  const { data: anniversary, isLoading } = useQuery({
    queryKey: ["anniversary", couple?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("couple_anniversaries")
        .select("*")
        .eq("couple_id", couple!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Anniversary | null;
    },
    enabled: !!couple?.id,
  });

  const setAnniversary = useMutation({
    mutationFn: async ({ startDate, name }: { startDate: string; name?: string }) => {
      if (anniversary) {
        // Update existing
        const { error } = await supabase
          .from("couple_anniversaries")
          .update({ start_date: startDate, name: name || "Razem od" })
          .eq("id", anniversary.id);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("couple_anniversaries")
          .insert({
            couple_id: couple!.id,
            start_date: startDate,
            name: name || "Razem od",
          });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["anniversary"] }),
  });

  return { anniversary, isLoading, setAnniversary };
};
