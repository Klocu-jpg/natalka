import { Heart, Check, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";

const Paywall = () => {
  const { startCheckout } = useSubscription();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      await startCheckout();
    } catch {
      toast.error("Nie udało się rozpocząć płatności");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <Heart className="w-14 h-14 text-primary animate-heart-beat" fill="currentColor" />
            <Crown className="w-6 h-6 text-coral absolute -top-2 -right-2" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent">
            Twój okres próbny się skończył
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Kontynuuj korzystanie z Love App za jedyne 5 zł/miesiąc
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card border-2 border-primary">
          <div className="flex items-baseline justify-center gap-1 mb-4">
            <span className="text-3xl font-heading font-bold">5 zł</span>
            <span className="text-muted-foreground text-sm">/ miesiąc</span>
          </div>

          <ul className="space-y-2 mb-6 text-left">
            {[
              "Pełny dostęp do wszystkich funkcji",
              "Planer obiadów z AI",
              "Wspólne albumy i cele",
              "Powiadomienia push",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Subskrybuj teraz"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Anuluj w dowolnym momencie</p>
        </div>

        <button
          onClick={() => signOut()}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Wyloguj się
        </button>
      </div>
    </div>
  );
};

export default Paywall;
