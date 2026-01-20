import { Settings, Eye, EyeOff, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

const GENDER_OPTIONS = [
  { value: "female" as const, label: "👩 Kobieta" },
  { value: "male" as const, label: "👨 Mężczyzna" },
  { value: "other" as const, label: "🌈 Inna" },
];

const WidgetSettings = () => {
  const { visibility, toggleWidget } = useWidgetVisibility();
  const { profile, createOrUpdateProfile } = useProfile();

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
      </DialogContent>
    </Dialog>
  );
};

export default WidgetSettings;
