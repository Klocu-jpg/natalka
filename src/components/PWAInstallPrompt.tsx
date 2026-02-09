import { useState, useEffect } from "react";
import { Heart, Share, Plus, MoreVertical, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const isStandalone = (): boolean => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
};

const getDeviceType = (): "ios" | "android" | "other" => {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
};

const DISMISSED_KEY = "pwa_install_dismissed";

const PWAInstallPrompt = () => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const isMobile = useIsMobile();
  const device = getDeviceType();

  useEffect(() => {
    // Only show on mobile, not on desktop, and not if already standalone
    if (!isMobile || isStandalone()) {
      setShow(false);
      return;
    }

    // Don't show for non-iOS/Android
    if (device === "other") {
      setShow(false);
      return;
    }

    // Check if dismissed recently (24h)
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 24 * 60 * 60 * 1000) {
        setShow(false);
        return;
      }
    }

    setShow(true);
  }, [isMobile, device]);

  if (!show) return null;

  const iosSteps = [
    {
      icon: <Share className="w-8 h-8 text-primary" />,
      title: "Krok 1: Udostępnij",
      desc: 'Kliknij ikonę "Udostępnij" na dole ekranu (kwadrat ze strzałką w górę).',
    },
    {
      icon: <Plus className="w-8 h-8 text-primary" />,
      title: 'Krok 2: Dodaj do ekranu',
      desc: 'Przewiń w dół i wybierz "Dodaj do ekranu początkowego".',
    },
    {
      icon: <Heart className="w-8 h-8 text-primary" fill="currentColor" />,
      title: "Krok 3: Gotowe!",
      desc: 'Kliknij "Dodaj" i Love App pojawi się na Twoim ekranie jak prawdziwa aplikacja!',
    },
  ];

  const androidSteps = [
    {
      icon: <MoreVertical className="w-8 h-8 text-primary" />,
      title: "Krok 1: Menu",
      desc: 'Kliknij trzy kropki (⋮) w prawym górnym rogu przeglądarki.',
    },
    {
      icon: <Plus className="w-8 h-8 text-primary" />,
      title: 'Krok 2: Zainstaluj',
      desc: 'Wybierz "Zainstaluj aplikację" lub "Dodaj do ekranu głównego".',
    },
    {
      icon: <Heart className="w-8 h-8 text-primary" fill="currentColor" />,
      title: "Krok 3: Gotowe!",
      desc: "Love App pojawi się na Twoim ekranie jak prawdziwa aplikacja!",
    },
  ];

  const steps = device === "ios" ? iosSteps : androidSteps;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 pt-safe">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" fill="currentColor" />
          <span className="font-heading font-bold text-lg">Love App</span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors inline-touch"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-safe">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="w-10 h-10 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            Zainstaluj Love App
          </h1>
          <p className="text-muted-foreground text-sm">
            Dodaj do ekranu głównego, żeby korzystać jak z prawdziwej aplikacji!
          </p>
        </div>

        {/* Steps */}
        <div className="w-full max-w-sm space-y-4 mb-8">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 ${
                i === step
                  ? "bg-primary/10 border-2 border-primary/30 scale-[1.02]"
                  : "bg-secondary/50 border-2 border-transparent opacity-60"
              }`}
              onClick={() => setStep(i)}
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-card flex items-center justify-center shadow-sm">
                {s.icon}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="w-full max-w-sm flex gap-3">
          {step < steps.length - 1 ? (
            <Button className="flex-1 h-12" onClick={() => setStep(step + 1)}>
              Dalej
              <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
            </Button>
          ) : (
            <Button className="flex-1 h-12" onClick={handleDismiss}>
              Rozumiem, zrobię to!
            </Button>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors inline-touch"
        >
          Przypomnij później
        </button>
      </div>

      {/* iOS arrow indicator */}
      {device === "ios" && step === 0 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-primary" />
        </div>
      )}
    </div>
  );
};

export default PWAInstallPrompt;
