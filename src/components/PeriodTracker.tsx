import { useState } from "react";
import { Calendar, Share2, Droplets, Loader2, Settings, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePeriodTracker } from "@/hooks/usePeriodTracker";
import { useProfile } from "@/hooks/useProfile";
import { format, differenceInDays, isToday, isBefore, startOfDay } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";
import WidgetWrapper from "./WidgetWrapper";

const PeriodTracker = () => {
  const { profile } = useProfile();
  const { 
    entries, 
    isLoading, 
    addEntry, 
    updateEntry,
    nextPeriodDate, 
    daysUntilNext, 
    averageCycleLength,
    isSharing,
    latestEntry,
    isPeriodActive,
    currentDayOfPeriod
  } = usePeriodTracker();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cycleLength, setCycleLength] = useState(averageCycleLength.toString());

  // Only show for female users
  if (profile?.gender !== "female") {
    return null;
  }

  const handleTogglePeriod = async () => {
    const today = new Date().toISOString().split("T")[0];
    
    if (isPeriodActive && latestEntry) {
      // End period - set end_date to today
      try {
        await updateEntry.mutateAsync({ 
          id: latestEntry.id, 
          end_date: today 
        });
        toast.success("Koniec okresu zapisany! 💕");
      } catch {
        toast.error("Nie udało się zapisać");
      }
    } else {
      // Start new period
      try {
        await addEntry.mutateAsync({ 
          start_date: today,
          cycle_length: parseInt(cycleLength) || 28
        });
        toast.success("Początek okresu zapisany! 💕");
      } catch {
        toast.error("Nie udało się zapisać");
      }
    }
  };

  const toggleSharing = async () => {
    if (!latestEntry) return;
    try {
      await updateEntry.mutateAsync({ 
        id: latestEntry.id, 
        share_with_partner: !isSharing 
      });
      toast.success(isSharing ? "Wyłączono udostępnianie" : "Włączono udostępnianie partnerowi");
    } catch {
      toast.error("Błąd");
    }
  };

  const saveCycleLength = async () => {
    if (!latestEntry) return;
    try {
      await updateEntry.mutateAsync({ 
        id: latestEntry.id, 
        cycle_length: parseInt(cycleLength) || 28 
      });
      toast.success("Zapisano długość cyklu");
      setIsSettingsOpen(false);
    } catch {
      toast.error("Błąd");
    }
  };

  const isPending = addEntry.isPending || updateEntry.isPending;

  return (
    <WidgetWrapper
      title="Cykl"
      icon={<Droplets className="w-5 h-5 text-primary-foreground" />}
      iconBg="gradient-primary"
      actions={
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ustawienia cyklu</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Długość cyklu (dni)</label>
                <Input
                  type="number"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  min="21"
                  max="40"
                />
                <p className="text-xs text-muted-foreground">
                  Typowa długość to 21-35 dni
                </p>
              </div>
              <Button onClick={saveCycleLength} className="w-full" disabled={updateEntry.isPending}>
                {updateEntry.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Zapisz"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main action button - Flo style */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleTogglePeriod}
              disabled={isPending}
              className={`
                relative w-16 h-16 rounded-full transition-all duration-300 flex-shrink-0
                flex items-center justify-center
                ${isPeriodActive 
                  ? "bg-gradient-to-br from-rose-400 to-rose-600 shadow-lg shadow-rose-500/30" 
                  : "bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 hover:from-pink-200 hover:to-pink-300 dark:hover:from-pink-800/40 dark:hover:to-pink-700/40"
                }
                ${isPending ? "opacity-70" : "hover:scale-105 active:scale-95"}
              `}
            >
              {isPending ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : isPeriodActive ? (
                <div className="text-center text-white">
                  <div className="text-lg font-bold">{currentDayOfPeriod}</div>
                  <div className="text-[10px]">dzień</div>
                </div>
              ) : (
                <Circle className="w-7 h-7 text-rose-400 dark:text-rose-300" />
              )}
              
              {/* Pulsing ring for active period */}
              {isPeriodActive && (
                <span className="absolute inset-0 rounded-full animate-ping bg-rose-400/30" style={{ animationDuration: "2s" }} />
              )}
            </button>
            
            {/* Next period prediction - inline */}
            {!isPeriodActive && nextPeriodDate && daysUntilNext !== null && entries.length > 0 ? (
              <div className="flex-1 text-center py-2 px-3 bg-secondary/50 rounded-xl">
                <div className="text-2xl font-heading font-bold text-primary">
                  {daysUntilNext}
                </div>
                <p className="text-xs text-muted-foreground">
                  dni do następnego
                </p>
                <p className="text-[10px] text-muted-foreground">
                  ~{format(nextPeriodDate, "d MMMM", { locale: pl })}
                </p>
              </div>
            ) : (
              <p className="flex-1 text-xs font-medium text-center">
                {isPeriodActive ? (
                  <span className="text-rose-500 dark:text-rose-400">Kliknij aby zakończyć</span>
                ) : (
                  <span className="text-muted-foreground">Kliknij gdy okres się zacznie</span>
                )}
              </p>
            )}
          </div>

          {/* Cycle info */}
          {entries.length > 0 && (
            <div className="bg-secondary/50 rounded-xl p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Długość cyklu</span>
                <span className="font-medium">{averageCycleLength} dni</span>
              </div>
            </div>
          )}

          {/* Sharing toggle */}
          {entries.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Udostępnij partnerowi</span>
              </div>
              <Switch 
                checked={isSharing} 
                onCheckedChange={toggleSharing}
                disabled={updateEntry.isPending}
              />
            </div>
          )}

          {/* Last period info */}
          {latestEntry && !isPeriodActive && (
            <p className="text-xs text-center text-muted-foreground">
              Ostatni okres: {format(new Date(latestEntry.start_date), "d MMMM yyyy", { locale: pl })}
            </p>
          )}
        </div>
      )}
    </WidgetWrapper>
  );
};

export default PeriodTracker;