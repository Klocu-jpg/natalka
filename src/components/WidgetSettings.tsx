import { Settings, Eye, EyeOff } from "lucide-react";
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
import { useWidgetVisibility, WIDGET_LABELS } from "@/contexts/WidgetVisibilityContext";

const WidgetSettings = () => {
  const { visibility, toggleWidget } = useWidgetVisibility();

  const widgetIds = Object.keys(WIDGET_LABELS);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Widoczność widgetów
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Wybierz, które widgety chcesz widzieć na swoim dashboardzie.
          </p>
          <div className="space-y-3">
            {widgetIds.map((widgetId) => (
              <div
                key={widgetId}
                className="flex items-center justify-between p-3 bg-secondary rounded-xl"
              >
                <Label
                  htmlFor={widgetId}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {visibility[widgetId] ? (
                    <Eye className="w-4 h-4 text-primary" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="font-medium text-sm">
                    {WIDGET_LABELS[widgetId]}
                  </span>
                </Label>
                <Switch
                  id={widgetId}
                  checked={visibility[widgetId] ?? true}
                  onCheckedChange={() => toggleWidget(widgetId)}
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
