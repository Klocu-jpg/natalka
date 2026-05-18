import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PENDING_KEY = "pendingInviteCode";

/**
 * Watches for a stashed invite code (set by InvitePage when user wasn't logged in)
 * and consumes it as soon as the user finishes auth.
 */
const PendingInviteHandler = () => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const handledRef = useRef(false);

  useEffect(() => {
    if (loading || !user || handledRef.current) return;
    const code = sessionStorage.getItem(PENDING_KEY);
    if (!code) return;

    handledRef.current = true;
    (async () => {
      const { error } = await supabase.rpc("join_couple", { p_invite_code: code });
      sessionStorage.removeItem(PENDING_KEY);
      if (error) {
        toast.error(error.message || "Nie udało się dołączyć do pary z zaproszenia");
      } else {
        toast.success("Dołączono do pary! 💕");
        queryClient.invalidateQueries({ queryKey: ["couple", user.id] });
      }
    })();
  }, [user, loading, queryClient]);

  return null;
};

export default PendingInviteHandler;