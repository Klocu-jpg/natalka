import { useState } from "react";
import { Heart, Calendar, Share2, Droplets, Loader2, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePeriodTracker } from "@/hooks/usePeriodTracker";
import { useProfile } from "@/hooks/useProfile";
import { format, addDays } from "date-fns";
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
    latestEntry
  } = usePeriodTracker();
  
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");

  // Only show for female users
  if (profile?.gender !== "female") {
    return null;
  }

  const handleAdd = async () => {
    if (!startDate) {
      toast.error("Wybierz datę początku");
      return;
    }
    try {
      await addEntry.mutateAsync({ 
        start_date: startDate, 
        end_date: endDate || undefined,
        cycle_length: parseInt(cycleLength) || 28
      });
      toast.success("Zapisano! 💕");
      setStartDate("");
      setEndDate("");
      setIsOpen(false);
    } catch {
      toast.error("Nie udało się zapisać");
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

  return (
    <WidgetWrapper
      title="Cykl"
      icon={<Droplets className="w-5 h-5 text-primary-foreground" />}
      iconBg="gradient-primary"
      actions={
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nowy wpis</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Początek okresu</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Koniec okresu (opcjonalne)</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Długość cyklu (dni)</label>
                <Input
                  type="number"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  min="21"
                  max="40"
                />
              </div>
              <Button onClick={handleAdd} className="w-full" disabled={addEntry.isPending}>
                {addEntry.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Zapisz"}
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
      ) : entries.length === 0 ? (
        <div className="text-center py-6">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            Dodaj pierwszy wpis, aby śledzić cykl
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main countdown */}
          {nextPeriodDate && daysUntilNext !== null && (
            <div className="text-center py-2">
              <div className="text-4xl font-heading font-bold text-primary">
                {daysUntilNext}
              </div>
              <p className="text-sm text-muted-foreground">
                dni do następnego okresu
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ~{format(nextPeriodDate, "d MMMM", { locale: pl })}
              </p>
            </div>
          )}

          {/* Cycle info */}
          <div className="bg-secondary/50 rounded-xl p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Długość cyklu</span>
              <span className="font-medium">{averageCycleLength} dni</span>
            </div>
          </div>

          {/* Sharing toggle */}
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

          {/* Last period info */}
          {latestEntry && (
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
