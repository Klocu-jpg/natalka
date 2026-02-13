import { Heart, Check, Loader2, Crown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS, COUPLE_PLANS } from "@/config/plans";
import { toast } from "sonner";
import { useState } from "react";

type PlanType = "solo" | "couple";

const Paywall = () => {
  const { startCheckout, testMode } = useSubscription();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [planType, setPlanType] = useState<PlanType>("solo");

  const activePlans = planType === "solo" ? PLANS : COUPLE_PLANS;

  const getPriceId = (plan: typeof PLANS[number] | typeof COUPLE_PLANS[number]) =>
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

  const features = [
    "Wspólne listy zadań",
    "Planer posiłków z AI",
    "Śledzenie wydatków",
    "Cele oszczędnościowe",
    "Lista zakupów",
    "Albumy zdjęć",
    "Pomysły na randki",
    "Odliczanie wydarzeń",
    "Wspólne notatki",
    "Kalendarz",
    "Synchronizacja z partnerem",
  ];

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
            Wybierz swój plan
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Każdy plan zawiera wszystkie funkcje aplikacji
          </p>
        </div>

        {/* Solo / Couple toggle */}
        <div className="flex justify-center">
          <div className="inline-flex bg-muted rounded-full p-1 gap-1">
            <button
              onClick={() => setPlanType("solo")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                planType === "solo"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Solo
            </button>
            <button
              onClick={() => setPlanType("couple")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                planType === "couple"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Para
            </button>
          </div>
        </div>

        {planType === "couple" && (
          <p className="text-xs text-muted-foreground -mt-3">
            💑 Jeden plan — dostęp dla Ciebie i Twojej drugiej połówki
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {activePlans.map((plan) => (
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
                {features.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
                {planType === "couple" && (
                  <li className="flex items-center gap-2 text-xs font-medium text-primary">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span>Dostęp dla partnera</span>
                  </li>
                )}
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

        <p className="text-xs text-muted-foreground">🎁 14-dniowy darmowy okres próbny • Anuluj w dowolnym momencie</p>

        <div className="flex flex-col items-center gap-1.5">
          <p className="text-xs text-muted-foreground font-medium">Akceptowane metody płatności</p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="text-xs bg-muted px-2.5 py-1 rounded-md">💳 Karta</span>
            <span className="text-xs bg-muted px-2.5 py-1 rounded-md">Google Pay</span>
            <span className="text-xs bg-muted px-2.5 py-1 rounded-md line-through opacity-50" title="Chwilowo niedostępne">Apple Pay</span>
          </div>
          <p className="text-[10px] text-muted-foreground/60">Apple Pay chwilowo niedostępne</p>
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
