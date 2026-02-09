import { Settings, Eye, EyeOff, User, Loader2, Bell, Shield, FileText, Scale, Cookie, ChevronRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useWidgetVisibility, WIDGET_LABELS } from "@/contexts/WidgetVisibilityContext";
import { useProfile } from "@/hooks/useProfile";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

const GENDER_OPTIONS = [
  { value: "female" as const, label: "👩 Kobieta" },
  { value: "male" as const, label: "👨 Mężczyzna" },
  { value: "other" as const, label: "🌈 Inna" },
];

const NOTIFICATION_CATEGORIES = [
  { key: "nudges" as const, label: "Zaczepki", desc: "Gdy partner wyśle zaczepkę" },
  { key: "shopping" as const, label: "Lista zakupów", desc: "Gdy partner doda produkt" },
  { key: "meals" as const, label: "Obiady", desc: "Gdy partner doda obiad" },
  { key: "expenses" as const, label: "Wydatki", desc: "Gdy partner doda wydatek" },
  { key: "calendar" as const, label: "Kalendarz", desc: "Gdy partner doda wydarzenie" },
];

const LEGAL_LINKS = [
  { slug: "polityka-prywatnosci", label: "Polityka prywatności", icon: Shield },
  { slug: "regulamin", label: "Regulamin", icon: FileText },
  { slug: "rodo", label: "Klauzula RODO", icon: Scale },
  { slug: "cookies", label: "Polityka cookies", icon: Cookie },
];

const WidgetSettings = () => {
  const { visibility, toggleWidget } = useWidgetVisibility();
  const { profile, createOrUpdateProfile } = useProfile();
  const { preferences, togglePreference } = useNotificationPreferences();
  const { subscribed, isTrial, subscriptionEnd, openPortal } = useSubscription();
  const navigate = useNavigate();

  const widgetIds = Object.keys(WIDGET_LABELS);

  const handleGenderChange = async (gender: "female" | "male" | "other") => {
    try {
      await createOrUpdateProfile.mutateAsync({ gender });
      toast.success("Płeć została zmieniona");
    } catch {
      toast.error("Nie udało się zmienić płci");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Ustawienia
          </DialogTitle>
        </DialogHeader>
        
        {/* Subscription Section */}
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Subskrypcja</span>
          </div>
          <div className="p-3 bg-secondary rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {isTrial ? "Okres próbny" : "Premium"}
              </span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {subscribed ? "Aktywna" : "Nieaktywna"}
              </span>
            </div>
            {subscriptionEnd && (
              <p className="text-xs text-muted-foreground">
                {isTrial ? "Trial do" : "Odnawia się"}: {new Date(subscriptionEnd).toLocaleDateString("pl-PL")}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={async () => {
                try { await openPortal(); } catch { toast.error("Nie udało się otworzyć portalu"); }
              }}
            >
              Zarządzaj subskrypcją
            </Button>
          </div>
        </div>

        <Separator />

        {/* Gender Section */}
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Płeć</span>
          </div>
          <div className="flex gap-2">
            {GENDER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={profile?.gender === option.value ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => handleGenderChange(option.value)}
                disabled={createOrUpdateProfile.isPending}
              >
                {createOrUpdateProfile.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  option.label
                )}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Notification Preferences */}
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Powiadomienia push</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Wybierz, z czego chcesz dostawać powiadomienia.
          </p>
          <div className="space-y-3">
            {NOTIFICATION_CATEGORIES.map(({ key, label, desc }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 p-3 bg-secondary rounded-xl"
              >
                <Label
                  htmlFor={`notif-${key}`}
                  className="flex flex-col cursor-pointer min-w-0 flex-1"
                >
                  <span className="font-medium text-sm">{label}</span>
                  <span className="text-xs text-muted-foreground">{desc}</span>
                </Label>
                <Switch
                  id={`notif-${key}`}
                  checked={preferences[key]}
                  onCheckedChange={() => togglePreference(key)}
                  className="shrink-0"
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Widgets Section */}
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Widoczność widgetów</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Wybierz, które widgety chcesz widzieć na swoim dashboardzie.
          </p>
          <div className="space-y-3">
            {widgetIds.map((widgetId) => (
              <div
                key={widgetId}
                className="flex items-center justify-between gap-3 p-3 bg-secondary rounded-xl"
              >
                <Label
                  htmlFor={widgetId}
                  className="flex items-center gap-2 cursor-pointer min-w-0 flex-1"
                >
                  {visibility[widgetId] ? (
                    <Eye className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="font-medium text-sm truncate">
                    {WIDGET_LABELS[widgetId]}
                  </span>
                </Label>
                <Switch
                  id={widgetId}
                  checked={visibility[widgetId] ?? true}
                  onCheckedChange={() => toggleWidget(widgetId)}
                  className="shrink-0"
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Legal Section */}
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Dokumenty prawne</span>
          </div>
          <div className="space-y-1">
            {LEGAL_LINKS.map(({ slug, label, icon: Icon }) => (
              <button
                key={slug}
                onClick={() => navigate(`/prawne/${slug}`)}
                className="w-full flex items-center justify-between gap-3 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-sm truncate">{label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetSettings;
