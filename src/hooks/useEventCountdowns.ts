import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCouple } from "./useCouple";
import { differenceInDays } from "date-fns";

export interface EventCountdown {
  id: string;
  user_id: string;
  couple_id: string | null;
  title: string;
  date: string;
  emoji: string;
  created_at: string;
}

export const useEventCountdowns = () => {
  const { user } = useAuth();
  const { couple } = useCouple();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["event_countdowns", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_countdowns")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data as EventCountdown[];
    },
    enabled: !!user,
  });

  const addEvent = useMutation({
    mutationFn: async (event: { title: string; date: string; emoji?: string }) => {
      const { error } = await supabase
        .from("event_countdowns")
        .insert({ 
          user_id: user!.id,
          couple_id: couple?.id || null,
          title: event.title,
          date: event.date,
          emoji: event.emoji || "🎉"
        });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event_countdowns"] }),
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("event_countdowns")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event_countdowns"] }),
  });

  // Add days remaining to each event
  const eventsWithDays = events.map(event => ({
    ...event,
    daysRemaining: differenceInDays(new Date(event.date), new Date())
  })).filter(e => e.daysRemaining >= 0);

  const upcomingEvents = eventsWithDays.slice(0, 5);

  return { events: eventsWithDays, upcomingEvents, isLoading, addEvent, deleteEvent };
};
