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
  
  // Check if period is currently active (has start but no end, and started recently)
  const isPeriodActive = latestEntry 
    ? !latestEntry.end_date && differenceInDays(new Date(), new Date(latestEntry.start_date)) <= 10
    : false;

  // Current day of active period
  const currentDayOfPeriod = isPeriodActive && latestEntry
    ? differenceInDays(new Date(), new Date(latestEntry.start_date)) + 1
    : null;
  
  const nextPeriodDate = latestEntry 
    ? addDays(new Date(latestEntry.start_date), averageCycleLength)
    : null;
  
  const daysUntilNext = nextPeriodDate 
    ? Math.max(0, differenceInDays(nextPeriodDate, new Date()))
    : null;

  const isSharing = latestEntry?.share_with_partner ?? false;

  // Ovulation & fertility calculations
  // Ovulation typically occurs 14 days before the next period
  const getOvulationDate = (periodStart: Date, cycleLen: number) => {
    return addDays(periodStart, cycleLen - 14);
  };

  // Fertile window: 5 days before ovulation + ovulation day + 1 day after
  const getFertileWindow = (periodStart: Date, cycleLen: number) => {
    const ovulation = getOvulationDate(periodStart, cycleLen);
    return {
      start: addDays(ovulation, -5),
      end: addDays(ovulation, 1),
      ovulationDay: ovulation,
    };
  };

  // Generate cycle events for calendar display
  const getCycleEvents = () => {
    const events: { date: Date; type: "period" | "fertile" | "ovulation" | "predicted-period" }[] = [];
    
    // Historical period days
    for (const entry of entries) {
      const start = new Date(entry.start_date);
      const end = entry.end_date ? new Date(entry.end_date) : (
        isPeriodActive && entry.id === latestEntry?.id ? new Date() : addDays(start, 4)
      );
      const days = differenceInDays(end, start) + 1;
      for (let d = 0; d < days; d++) {
        events.push({ date: addDays(start, d), type: "period" });
      }

      // Fertility & ovulation for this cycle
      const cycleLen = entry.cycle_length || 28;
      const fertile = getFertileWindow(start, cycleLen);
      const fertileDays = differenceInDays(fertile.end, fertile.start) + 1;
      for (let d = 0; d < fertileDays; d++) {
        const day = addDays(fertile.start, d);
        if (differenceInDays(day, fertile.ovulationDay) === 0) {
          events.push({ date: day, type: "ovulation" });
        } else {
          events.push({ date: day, type: "fertile" });
        }
      }
    }

    // Predicted next period (5 days)
    if (nextPeriodDate && !isPeriodActive) {
      for (let d = 0; d < 5; d++) {
        events.push({ date: addDays(nextPeriodDate, d), type: "predicted-period" });
      }
      // Predicted next ovulation & fertile window
      const nextCycleLen = averageCycleLength;
      const nextFertile = getFertileWindow(nextPeriodDate, nextCycleLen);
      const nextFertileDays = differenceInDays(nextFertile.end, nextFertile.start) + 1;
      for (let d = 0; d < nextFertileDays; d++) {
        const day = addDays(nextFertile.start, d);
        if (differenceInDays(day, nextFertile.ovulationDay) === 0) {
          events.push({ date: day, type: "ovulation" });
        } else {
          events.push({ date: day, type: "fertile" });
        }
      }
    }

    return events;
  };

  const cycleEvents = entries.length > 0 ? getCycleEvents() : [];

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
    latestEntry,
    isPeriodActive,
    currentDayOfPeriod,
    cycleEvents,
  };
};
