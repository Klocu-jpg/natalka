import { useState } from "react";
import { Share2, Droplets, Loader2, Settings, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePeriodTracker } from "@/hooks/usePeriodTracker";
import { useProfile } from "@/hooks/useProfile";
import { format, differenceInDays, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";
import WidgetWrapper from "./WidgetWrapper";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

const CycleCalendar = ({ cycleEvents }: { cycleEvents: { date: Date; type: "period" | "fertile" | "ovulation" | "predicted-period" }[] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventType = (date: Date) => {
    for (const ev of cycleEvents) {
      if (isSameDay(ev.date, date)) return ev.type;
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-heading font-semibold capitalize">
          {format(currentMonth, "LLLL yyyy", { locale: pl })}
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-[10px] font-medium text-muted-foreground py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d, i) => {
          const inMonth = isSameMonth(d, currentMonth);
          const today = isToday(d);
          const eventType = getEventType(d);

          return (
            <div
              key={i}
              className={cn(
                "relative flex items-center justify-center h-9 rounded-lg text-xs transition-all",
                !inMonth && "opacity-30",
                today && "ring-1 ring-foreground/30",
                eventType === "period" && "bg-rose-500 text-white font-bold",
                eventType === "predicted-period" && "bg-rose-300/40 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-dashed border-rose-400/50",
                eventType === "ovulation" && "bg-violet-500 text-white font-bold",
                eventType === "fertile" && "bg-emerald-400/30 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
                !eventType && inMonth && "text-foreground",
              )}
            >
              {format(d, "d")}
              {eventType === "ovulation" && (
                <span className="absolute -top-0.5 -right-0.5 text-[8px]">🥚</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
          <span className="text-[10px] text-muted-foreground">Okres</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-300/60 border border-dashed border-rose-400" />
          <span className="text-[10px] text-muted-foreground">Prognoza</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/50" />
          <span className="text-[10px] text-muted-foreground">Płodne</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-violet-500" />
          <span className="text-[10px] text-muted-foreground">Owulacja</span>
        </div>
      </div>
    </div>
  );
};

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
    currentDayOfPeriod,
    cycleEvents,
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
      try {
        await updateEntry.mutateAsync({ 
          id: latestEntry.id, 
          end_date: today 
        });
        toast.success("Koniec okresu zapisany!");
      } catch {
        toast.error("Nie udało się zapisać");
      }
    } else {
      try {
        await addEntry.mutateAsync({ 
          start_date: today,
          cycle_length: parseInt(cycleLength) || 28
        });
        toast.success("Początek okresu zapisany!");
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
          <div className="flex flex-col items-center py-1">
            <button
              onClick={handleTogglePeriod}
              disabled={isPending}
              className={`
                relative w-16 h-16 rounded-full transition-all duration-300 
                flex items-center justify-center
                ${isPeriodActive 
                  ? "bg-gradient-to-br from-rose-400 to-rose-600 shadow-lg shadow-rose-500/30" 
                  : "bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 hover:from-pink-200 hover:to-pink-300 dark:hover:from-pink-800/40 dark:hover:to-pink-700/40"
                }
                ${isPending ? "opacity-70" : "hover:scale-105 active:scale-95"}
              `}
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : isPeriodActive ? (
                <div className="text-center text-white">
                  <div className="text-lg font-bold">{currentDayOfPeriod}</div>
                  <div className="text-[10px]">dzień</div>
                </div>
              ) : (
                <Circle className="w-6 h-6 text-rose-400 dark:text-rose-300" />
              )}
              
              {isPeriodActive && (
                <span className="absolute inset-0 rounded-full animate-ping bg-rose-400/30" style={{ animationDuration: "2s" }} />
              )}
            </button>
            
            <p className="mt-2 text-xs font-medium text-center">
              {isPeriodActive ? (
                <span className="text-rose-500 dark:text-rose-400">Kliknij aby zakończyć okres</span>
              ) : (
                <span className="text-muted-foreground">Kliknij gdy okres się zacznie</span>
              )}
            </p>
          </div>

          {/* Next period prediction */}
          {!isPeriodActive && nextPeriodDate && daysUntilNext !== null && entries.length > 0 && (
            <div className="text-center py-2 bg-secondary/50 rounded-xl">
              <div className="text-2xl font-heading font-bold text-primary">
                {daysUntilNext}
              </div>
              <p className="text-xs text-muted-foreground">
                dni do następnego okresu
              </p>
              <p className="text-[10px] text-muted-foreground">
                ~{format(nextPeriodDate, "d MMMM", { locale: pl })}
              </p>
            </div>
          )}

          {/* Calendar button - always visible */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="w-full text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors py-2 rounded-xl bg-secondary/50 hover:bg-secondary/70"
              >
                📅 Kalendarz cyklu
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-rose-500" />
                  Kalendarz cyklu
                </DialogTitle>
              </DialogHeader>
              <div className="pt-2">
                <CycleCalendar cycleEvents={cycleEvents} />
                {entries.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Zaznacz swój pierwszy okres, aby zobaczyć prognozy cyklu
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>

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