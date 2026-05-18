import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Loader2, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PENDING_KEY = "pendingInviteCode";

const InvitePage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteCode = (code || "").trim().toLowerCase();

  useEffect(() => {
    if (loading || !inviteCode) return;

    if (!user) {
      // Save for after auth and send them to login
      sessionStorage.setItem(PENDING_KEY, inviteCode);
      navigate("/auth", { replace: true });
      return;
    }

    let cancelled = false;
    (async () => {
      setJoining(true);
      const { error } = await supabase.rpc("join_couple", { p_invite_code: inviteCode });
      if (cancelled) return;
      if (error) {
        const msg = error.message || "Nie udało się dołączyć do pary";
        setError(msg);
        toast.error(msg);
      } else {
        sessionStorage.removeItem(PENDING_KEY);
        toast.success("Dołączono do pary! 💕");
        navigate("/", { replace: true });
      }
      setJoining(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading, inviteCode, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="flex justify-center">
          <div className="relative">
            <Heart className="w-14 h-14 text-primary animate-heart-beat" fill="currentColor" />
            <Users className="w-6 h-6 text-coral absolute -top-2 -right-2" />
          </div>
        </div>
        <h1 className="text-2xl font-heading font-bold">Zaproszenie do pary</h1>
        {!inviteCode ? (
          <p className="text-sm text-muted-foreground">Nieprawidłowy link zaproszenia.</p>
        ) : error ? (
          <>
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={() => navigate("/")}>Wróć do aplikacji</Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {joining || !user
                ? "Łączymy Cię z partnerem…"
                : "Przygotowuję dołączenie…"}
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InvitePage;