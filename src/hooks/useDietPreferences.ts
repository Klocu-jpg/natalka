import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface DietPreferences {
  id: string;
  user_id: string;
  likes: string | null;
  dislikes: string | null;
  allergies: string | null;
  diet_type: string | null;
  health_conditions: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type DietPreferencesInput = Pick<
  DietPreferences,
  "likes" | "dislikes" | "allergies" | "diet_type" | "health_conditions" | "notes"
>;

export const useDietPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences = null, isLoading } = useQuery({
    queryKey: ["diet_preferences", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("diet_preferences" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as DietPreferences) ?? null;
    },
    enabled: !!user,
  });

  const upsertPreferences = useMutation({
    mutationFn: async (input: DietPreferencesInput) => {
      if (!user) throw new Error("Nie jesteś zalogowany");
      const payload = {
        user_id: user.id,
        likes: input.likes?.trim() || null,
        dislikes: input.dislikes?.trim() || null,
        allergies: input.allergies?.trim() || null,
        diet_type: input.diet_type?.trim() || null,
        health_conditions: input.health_conditions?.trim() || null,
        notes: input.notes?.trim() || null,
      };
      const { data, error } = await supabase
        .from("diet_preferences" as any)
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet_preferences", user?.id] });
      toast.success("Preferencje dietetyczne zapisane 🥗");
    },
    onError: (e: Error) => {
      toast.error(e.message || "Nie udało się zapisać preferencji");
    },
  });

  return { preferences, isLoading, upsertPreferences };
};