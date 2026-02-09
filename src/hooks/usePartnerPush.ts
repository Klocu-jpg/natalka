import { useCouple } from "@/hooks/useCouple";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const usePartnerPush = () => {
  const { user } = useAuth();
  const { couple, hasPartner } = useCouple();

  const getPartnerId = (): string | null => {
    if (!couple || !user) return null;
    return couple.user1_id === user.id ? couple.user2_id : couple.user1_id;
  };

  const notifyPartner = async (
    _category: string,
    title: string,
    body: string,
    emoji?: string
  ) => {
    const partnerId = getPartnerId();
    if (!partnerId || !hasPartner) return;

    try {
      await supabase.functions.invoke("send-push", {
        body: { recipientId: partnerId, title, body, emoji },
      });
    } catch (err) {
      console.error("Partner push failed:", err);
    }
  };

  return { notifyPartner, hasPartner, partnerId: getPartnerId() };
};
