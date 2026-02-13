import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCouple } from "@/hooks/useCouple";
import { useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export interface Nudge {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  emoji?: string;
  is_read: boolean;
  created_at: string;
}

export const useNudges = () => {
  const { user } = useAuth();
  const { couple, hasPartner } = useCouple();
  const queryClient = useQueryClient();
  const { sendPushToPartner } = usePushNotifications();

  // Get partner ID
  const getPartnerId = () => {
    if (!couple || !user) return null;
    return couple.user1_id === user.id ? couple.user2_id : couple.user1_id;
  };

  const partnerId = getPartnerId();

  // Fetch received nudges (unread)
  const { data: unreadNudges = [], isLoading } = useQuery({
    queryKey: ["nudges", "unread", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nudges")
        .select("*")
        .eq("recipient_id", user!.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Nudge[];
    },
    enabled: !!user,
  });

  // Send nudge
  const sendNudge = useMutation({
    mutationFn: async ({ message, emoji }: { message: string; emoji?: string }) => {
      if (!partnerId) throw new Error("Brak połączonego partnera");
      
      const { error } = await supabase.from("nudges").insert({
        sender_id: user!.id,
        recipient_id: partnerId,
        message,
        emoji,
      });
      if (error) throw error;

      // Send push notification to partner
      sendPushToPartner(partnerId, "Love App", `${emoji || "💌"} ${message}`, emoji);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nudges"] }),
  });

  // Mark as read
  const markAsRead = useMutation({
    mutationFn: async (nudgeId: string) => {
      const { error } = await supabase
        .from("nudges")
        .update({ is_read: true })
        .eq("id", nudgeId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nudges"] }),
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("nudges")
        .update({ is_read: true })
        .eq("recipient_id", user!.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nudges"] }),
  });

  // Realtime subscription for new nudges
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("nudges-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "nudges",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["nudges"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return {
    unreadNudges,
    isLoading,
    sendNudge,
    markAsRead,
    markAllAsRead,
    hasPartner,
    partnerId,
  };
};
