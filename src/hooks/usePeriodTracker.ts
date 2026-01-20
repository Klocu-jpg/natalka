import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { addDays, differenceInDays } from "date-fns";

export interface PeriodEntry {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  cycle_length: number;
  share_with_partner: boolean;
  created_at: string;
}

export const usePeriodTracker = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["period_entries", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("period_entries")
        .select("*")
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data as PeriodEntry[];
    },
    enabled: !!user,
  });

  const addEntry = useMutation({
    mutationFn: async (entry: { start_date: string; end_date?: string; cycle_length?: number }) => {
      const { error } = await supabase
        .from("period_entries")
        .insert({ 
          user_id: user!.id,
          start_date: entry.start_date,
          end_date: entry.end_date || null,
          cycle_length: entry.cycle_length || 28
        });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["period_entries"] }),
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; end_date?: string; share_with_partner?: boolean; cycle_length?: number }) => {
      const { error } = await supabase
        .from("period_entries")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["period_entries"] }),
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("period_entries")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["period_entries"] }),
  });

  // Calculate predictions
  const latestEntry = entries[0];
  const averageCycleLength = latestEntry?.cycle_length || 28;
  
  const nextPeriodDate = latestEntry 
    ? addDays(new Date(latestEntry.start_date), averageCycleLength)
    : null;
  
  const daysUntilNext = nextPeriodDate 
    ? Math.max(0, differenceInDays(nextPeriodDate, new Date()))
    : null;

  const isSharing = latestEntry?.share_with_partner ?? false;

  return { 
    entries, 
    isLoading, 
    addEntry, 
    updateEntry, 
    deleteEntry,
    nextPeriodDate,
    daysUntilNext,
    averageCycleLength,
    isSharing,
    latestEntry
  };
};
