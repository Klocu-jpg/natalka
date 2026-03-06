import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Home } from "lucide-react";
import { useChores, DAY_LABELS } from "@/hooks/useChores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const DAY_COLORS = [
  "from-amber-500/20 to-amber-500/5",
  "from-emerald-500/20 to-emerald-500/5",
  "from-blue-500/20 to-blue-500/5",
  "from-violet-500/20 to-violet-500/5",
  "from-orange-500/20 to-orange-500/5",
  "from-rose-500/20 to-rose-500/5",
  "from-slate-400/20 to-slate-400/5",
];

const DAY_ACCENTS = [
  "text-amber-600 dark:text-amber-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-blue-600 dark:text-blue-400",
  "text-violet-600 dark:text-violet-400",
  "text-orange-600 dark:text-orange-400",
  "text-rose-600 dark:text-rose-400",
  "text-slate-500 dark:text-slate-400",
];

const DAY_SHORT = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];

const ChoresPlanner = () => {
  const { choresByDay, isLoading, addChore, toggleChore, deleteChore } = useChores();
  const [expandedDay, setExpandedDay] = useState<number | null>(() => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  });
  const [newChoreText, setNewChoreText] = useState("");
  const [addingForDay, setAddingForDay] = useState<number | null>(null);

  const handleAddChore = async (dayIndex: number) => {
    if (!newChoreText.trim()) return;
    try {
      await addChore.mutateAsync({ title: newChoreText.trim(), day_of_week: dayIndex });
      setNewChoreText("");
      setAddingForDay(null);
      toast.success("Dodano obowiązek!");
    } catch {
      toast.error("Nie udało się dodać");
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await toggleChore.mutateAsync({ id, completed: !completed });
    } catch {
      toast.error("Błąd");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteChore.mutateAsync(id);
      toast.success("Usunięto");
    } catch {
      toast.error("Błąd");
    }
  };

  const todayIndex = (() => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  })();

  // Calculate total stats
  const totalChores = choresByDay.reduce((sum, day) => sum + day.length, 0);
  const totalCompleted = choresByDay.reduce((sum, day) => sum + day.filter(c => c.completed).length, 0);

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Home className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-foreground text-sm">Obowiązki domowe</h2>
              {totalChores > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  {totalCompleted}/{totalChores} wykonane w tym tygodniu
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Week overview pills */}
        <div className="flex gap-1 mt-3">
          {DAY_SHORT.map((day, i) => {
            const dayChores = choresByDay[i];
            const completed = dayChores.filter(c => c.completed).length;
            const total = dayChores.length;
            const isToday = i === todayIndex;
            const allDone = total > 0 && completed === total;

            return (
              <button
                key={i}
                onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                className={`flex-1 rounded-lg py-1.5 text-center transition-all ${
                  isToday
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : expandedDay === i
                    ? "bg-muted ring-1 ring-border"
                    : "bg-muted/40 hover:bg-muted/70"
                }`}
              >
                <span className={`text-[10px] font-medium block ${isToday ? "" : "text-muted-foreground"}`}>
                  {day}
                </span>
                {total > 0 && (
                  <span className={`text-[9px] block mt-0.5 ${
                    isToday ? "text-primary-foreground/80" : allDone ? "text-green-500" : "text-muted-foreground/60"
                  }`}>
                    {allDone ? "✓" : `${completed}/${total}`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded day content */}
      <div className="divide-y divide-border/10">
        {DAY_LABELS.map((dayName, dayIndex) => {
          const dayChores = choresByDay[dayIndex];
          const isExpanded = expandedDay === dayIndex;
          const isToday = dayIndex === todayIndex;

          if (!isExpanded) return null;

          return (
            <div key={dayIndex} className={`bg-gradient-to-b ${DAY_COLORS[dayIndex]}`}>
              {/* Day title */}
              <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                <span className={`font-semibold text-sm ${DAY_ACCENTS[dayIndex]}`}>
                  {dayName}
                  {isToday && (
                    <span className="ml-2 text-[10px] uppercase tracking-wider bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-bold">
                      dziś
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {dayChores.filter(c => c.completed).length}/{dayChores.length}
                </span>
              </div>

              <div className="px-3 pb-3 space-y-1">
                {dayChores.length === 0 && addingForDay !== dayIndex && (
                  <p className="text-xs text-muted-foreground/50 py-4 text-center italic">
                    Brak obowiązków
                  </p>
                )}

                {dayChores.map((chore) => (
                  <div
                    key={chore.id}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group ${
                      chore.completed
                        ? "bg-background/40"
                        : "bg-background/70 shadow-sm"
                    }`}
                  >
                    <button
                      onClick={() => handleToggle(chore.id, chore.completed)}
                      className="shrink-0 transition-transform active:scale-90"
                    >
                      {chore.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/40 hover:text-primary transition-colors" />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm transition-all ${
                        chore.completed
                          ? "line-through text-muted-foreground/40"
                          : "text-foreground"
                      }`}
                    >
                      {chore.title}
                    </span>
                    <button
                      onClick={() => handleDelete(chore.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground/30 hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add chore form */}
                {addingForDay === dayIndex ? (
                  <div className="flex gap-2 pt-1">
                    <Input
                      value={newChoreText}
                      onChange={(e) => setNewChoreText(e.target.value)}
                      placeholder="np. Odkurzanie salonu..."
                      className="h-9 text-sm rounded-xl bg-background/70"
                      onKeyDown={(e) => e.key === "Enter" && handleAddChore(dayIndex)}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddChore(dayIndex)}
                      disabled={!newChoreText.trim() || addChore.isPending}
                      className="h-9 rounded-xl px-3"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAddingForDay(dayIndex);
                      setNewChoreText("");
                    }}
                    className={`flex items-center gap-1.5 text-xs ${DAY_ACCENTS[dayIndex]} opacity-70 hover:opacity-100 transition-opacity pt-1 pl-1`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Dodaj obowiązek
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChoresPlanner;
