import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePartnerPush } from "@/hooks/usePartnerPush";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  event_type: "task" | "date" | "anniversary" | "other";
}

export const useCalendarEvents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { notifyPartner } = usePartnerPush();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["calendar_events", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: !!user,
  });

  const addEvent = useMutation({
    mutationFn: async (event: { title: string; date: string; event_type: CalendarEvent["event_type"] }) => {
      const { error } = await supabase
        .from("calendar_events")
        .insert({ ...event, user_id: user!.id });
      if (error) throw error;
      return event;
    },
    onSuccess: (_, event) => {
      queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
      notifyPartner("calendar", "Love App", `📅 Nowe wydarzenie: ${event.title} — ${event.date}`, "📅");
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar_events"] }),
  });

  return { events, isLoading, addEvent, deleteEvent };
};
