import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useChores, DAY_LABELS } from "@/hooks/useChores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const DAY_EMOJIS = ["🟡", "🟢", "🔵", "🟣", "🟠", "🔴", "⚪"];

const ChoresPlanner = () => {
  const { choresByDay, isLoading, addChore, toggleChore, deleteChore } = useChores();
  const [expandedDay, setExpandedDay] = useState<number | null>(() => {
    // Default: expand today (JS: 0=Sunday, we want 0=Monday)
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

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-heading font-bold text-foreground">Obowiązki domowe</h2>
      </div>

      <div className="divide-y divide-border/20">
        {DAY_LABELS.map((dayName, dayIndex) => {
          const dayChores = choresByDay[dayIndex];
          const isExpanded = expandedDay === dayIndex;
          const isToday = dayIndex === todayIndex;
          const completedCount = dayChores.filter((c) => c.completed).length;
          const totalCount = dayChores.length;

          return (
            <div key={dayIndex}>
              {/* Day header */}
              <button
                onClick={() => setExpandedDay(isExpanded ? null : dayIndex)}
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                  isToday
                    ? "bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{DAY_EMOJIS[dayIndex]}</span>
                  <span className={`font-medium text-sm ${isToday ? "text-primary font-bold" : "text-foreground"}`}>
                    {dayName}
                    {isToday && (
                      <span className="ml-1.5 text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        dziś
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {totalCount > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      completedCount === totalCount
                        ? "bg-green-500/10 text-green-600"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {completedCount}/{totalCount}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-3 space-y-1.5">
                  {dayChores.length === 0 && addingForDay !== dayIndex && (
                    <p className="text-xs text-muted-foreground/60 py-2 text-center">
                      Brak obowiązków na ten dzień
                    </p>
                  )}

                  {dayChores.map((chore) => (
                    <div
                      key={chore.id}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                        chore.completed
                          ? "bg-muted/30"
                          : "bg-muted/50"
                      }`}
                    >
                      <button onClick={() => handleToggle(chore.id, chore.completed)} className="shrink-0">
                        {chore.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground/50" />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm ${
                          chore.completed
                            ? "line-through text-muted-foreground/50"
                            : "text-foreground"
                        }`}
                      >
                        {chore.title}
                      </span>
                      <button
                        onClick={() => handleDelete(chore.id)}
                        className="shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors"
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
                        className="h-9 text-sm rounded-xl"
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
                      className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Dodaj obowiązek
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChoresPlanner;
