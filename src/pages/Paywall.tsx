import { Heart, Check, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS } from "@/config/plans";
import { toast } from "sonner";
import { useState } from "react";

const Paywall = () => {
  const { startCheckout, testMode } = useSubscription();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const getPriceId = (plan: typeof PLANS[number]) =>
    testMode ? plan.testPriceId : plan.priceId;

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId);
    try {
      await startCheckout(priceId);
    } catch {
      toast.error("Nie udało się rozpocząć płatności");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl text-center space-y-6">
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
            Wybierz plan, aby kontynuować korzystanie z Love App
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-card rounded-2xl p-5 shadow-card relative ${
                plan.badge ? "border-2 border-primary" : "border border-border"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </span>
              )}
              <div className="text-center space-y-1 mb-4 pt-1">
                <h3 className="font-heading font-semibold text-sm">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-heading font-bold">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-xs text-muted-foreground">{plan.perMonth}</p>
              </div>

              <ul className="space-y-1.5 mb-4">
                {["Wszystkie funkcje", "Planer AI", "Albumy", "Sync"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                size="sm"
                variant={plan.badge ? "default" : "outline"}
                onClick={() => handleCheckout(getPriceId(plan))}
                disabled={loading !== null}
              >
                {loading === getPriceId(plan) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Subskrybuj"
                )}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">Anuluj w dowolnym momencie</p>

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
