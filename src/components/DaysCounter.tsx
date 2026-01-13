import { useState } from "react";
import { Heart, Calendar, Sparkles, Edit2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAnniversary } from "@/hooks/useAnniversary";
import { useCouple } from "@/hooks/useCouple";
import { differenceInDays, differenceInMonths, differenceInYears, format, addYears, isBefore } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";
import WidgetWrapper from "./WidgetWrapper";

const DaysCounter = () => {
  const { couple, hasPartner } = useCouple();
  const { anniversary, isLoading, setAnniversary } = useAnniversary();
  const [isEditing, setIsEditing] = useState(false);
  const [dateInput, setDateInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  const handleSave = async () => {
    if (!dateInput) {
      toast.error("Wybierz datę");
      return;
    }
    try {
      await setAnniversary.mutateAsync({ startDate: dateInput, name: nameInput || "Razem od" });
      toast.success("Data zapisana! 💕");
      setIsEditing(false);
    } catch (error) {
      toast.error("Nie udało się zapisać daty");
    }
  };

  const startEdit = () => {
    setDateInput(anniversary?.start_date || "");
    setNameInput(anniversary?.name || "Razem od");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDateInput("");
    setNameInput("");
  };

  // Calculate days together
  const calculateStats = () => {
    if (!anniversary?.start_date) return null;
    
    const startDate = new Date(anniversary.start_date);
    const today = new Date();
    
    const totalDays = differenceInDays(today, startDate);
    const years = differenceInYears(today, startDate);
    const months = differenceInMonths(today, startDate) % 12;
    const days = differenceInDays(today, addYears(startDate, years)) - (months * 30);
    
    // Next anniversary
    let nextAnniversary = new Date(startDate);
    nextAnniversary.setFullYear(today.getFullYear());
    if (isBefore(nextAnniversary, today)) {
      nextAnniversary.setFullYear(today.getFullYear() + 1);
    }
    const daysToAnniversary = differenceInDays(nextAnniversary, today);
    const nextAnniversaryYears = differenceInYears(nextAnniversary, startDate);

    return {
      totalDays,
      years,
      months,
      days: Math.max(0, days),
      daysToAnniversary,
      nextAnniversaryYears,
      startDate,
    };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <WidgetWrapper
        title="Dni Razem"
        icon={<Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />}
        iconBg="gradient-primary"
      >
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </WidgetWrapper>
    );
  }

  // If no couple yet
  if (!couple) {
    return (
      <WidgetWrapper
        title="Dni Razem"
        icon={<Heart className="w-5 h-5 text-primary" />}
        iconBg="bg-rose-light"
      >
        <p className="text-sm text-muted-foreground text-center py-4">
          Najpierw połącz się z partnerem 💕
        </p>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper
      title="Dni Razem"
      icon={<Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />}
      iconBg="gradient-primary"
      actions={
        anniversary && !isEditing ? (
          <Button variant="ghost" size="icon" onClick={startEdit} className="h-8 w-8">
            <Edit2 className="w-4 h-4" />
          </Button>
        ) : undefined
      }
    >
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-primary/20 to-coral/20 rounded-full blur-2xl" />
        <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-gradient-to-br from-coral/20 to-primary/20 rounded-full blur-2xl" />
        
        <div className="relative">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nazwa (np. "Razem od", "Pierwsza randka")</label>
                <Input
                  placeholder="Razem od"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data rozpoczęcia</label>
                <Input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="rounded-xl"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1" disabled={setAnniversary.isPending}>
                  {setAnniversary.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Zapisz</>}
                </Button>
                <Button variant="outline" onClick={cancelEdit}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : anniversary && stats ? (
            <div className="space-y-4">
              {/* Main counter */}
              <div className="text-center py-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-coral" />
                  <span className="text-sm text-muted-foreground">{anniversary.name}</span>
                  <Sparkles className="w-5 h-5 text-coral" />
                </div>
                <div className="text-5xl font-heading font-bold bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent">
                  {stats.totalDays}
                </div>
                <p className="text-muted-foreground mt-1">dni razem 💕</p>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.years}</div>
                  <div className="text-xs text-muted-foreground">lat</div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-coral">{stats.months}</div>
                  <div className="text-xs text-muted-foreground">miesięcy</div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.days}</div>
                  <div className="text-xs text-muted-foreground">dni</div>
                </div>
              </div>

              {/* Next anniversary */}
              <div className="bg-gradient-to-r from-primary/10 to-coral/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Następna rocznica</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Za <span className="font-bold text-foreground">{stats.daysToAnniversary}</span> dni obchodzicie{" "}
                  <span className="font-bold text-foreground">{stats.nextAnniversaryYears}</span>. rocznicę! 🎉
                </p>
              </div>

              {/* Start date */}
              <p className="text-center text-sm text-muted-foreground">
                Od {format(stats.startDate, "d MMMM yyyy", { locale: pl })}
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                Ustaw datę początku Waszej relacji
              </p>
              <Button onClick={startEdit}>
                <Calendar className="w-4 h-4 mr-2" />
                Ustaw datę
              </Button>
            </div>
          )}
        </div>
      </div>
    </WidgetWrapper>
  );
};

export default DaysCounter;
