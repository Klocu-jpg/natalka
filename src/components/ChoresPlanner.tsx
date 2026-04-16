import { useState, useRef, useCallback } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Home, Repeat, CalendarDays, User, GripVertical } from "lucide-react";
import { useChores, DAY_LABELS, Chore } from "@/hooks/useChores";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import WidgetWrapper from "./WidgetWrapper";

const RECURRENCE_OPTIONS = [
  { value: "daily", label: "Codziennie", icon: "🔄" },
  { value: "weekly", label: "Co tydzień", icon: "📅" },
  { value: "monthly", label: "Raz w miesiącu", icon: "🗓️" },
];

const ASSIGNED_OPTIONS = [
  { value: "me", label: "Ja", icon: "👤" },
  { value: "partner", label: "Partner", icon: "💑" },
  { value: "both", label: "Oboje", icon: "👫" },
];

const DAY_SHORT = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];

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

const ChoresPlanner = () => {
  const { user } = useAuth();
  const { choresByDay, isLoading, addChore, toggleChore, deleteChore, reorderChores } = useChores();
  const todayIndex = (() => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  })();

  const [expandedDay, setExpandedDay] = useState<number | null>(todayIndex);
  const [newChoreText, setNewChoreText] = useState("");
  const [newRecurrence, setNewRecurrence] = useState("weekly");
  const [newAssignedTo, setNewAssignedTo] = useState("both");
  const [addingForDay, setAddingForDay] = useState<number | null>(null);

  // Drag state for reordering chore items
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragSrcIdx = useRef<number | null>(null);

  // Resolve "me"/"partner" relative to who created the chore vs who is viewing
  const getAssignedLabel = (chore: Chore) => {
    if (chore.assigned_to === "both") return "👫 Oboje";
    const isCreator = chore.user_id === user?.id;
    if (chore.assigned_to === "me") {
      return isCreator ? "👤 Ja" : "💑 Partner";
    }
    // assigned_to === "partner"
    return isCreator ? "💑 Partner" : "👤 Ja";
  };

  const isChoreActiveToday = (chore: { recurrence: string; day_of_week: number }) => {
    if (chore.recurrence === "daily") return true;
    if (chore.recurrence === "weekly") return true;
    if (chore.recurrence === "monthly") {
      return new Date().getDate() <= 7;
    }
    return true;
  };

  const handleAddChore = async (dayIndex: number) => {
    if (!newChoreText.trim()) return;
    try {
      await addChore.mutateAsync({
        title: newChoreText.trim(),
        day_of_week: dayIndex,
        recurrence: newRecurrence,
        assigned_to: newAssignedTo,
      });
      setNewChoreText("");
      setNewRecurrence("weekly");
      setNewAssignedTo("both");
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

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    dragSrcIdx.current = idx;
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(idx);
  };

  const handleDrop = async (e: React.DragEvent, dayChores: Chore[]) => {
    e.preventDefault();
    const from = dragSrcIdx.current;
    const to = dragOverIdx;
    setDraggedIdx(null);
    setDragOverIdx(null);
    dragSrcIdx.current = null;

    if (from === null || to === null || from === to) return;

    const reordered = [...dayChores];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);

    try {
      await reorderChores(reordered);
    } catch {
      toast.error("Nie udało się zmienić kolejności");
    }
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
    dragSrcIdx.current = null;
  };

  const totalChores = choresByDay.reduce((sum, day) => sum + day.length, 0);
  const totalCompleted = choresByDay.reduce((sum, day) => sum + day.filter((c) => c.completed).length, 0);

  const headerExtra = totalChores > 0 ? (
    <span className="text-[10px] text-muted-foreground ml-2">
      {totalCompleted}/{totalChores}
    </span>
  ) : null;

  return (
    <WidgetWrapper
      title="Obowiązki domowe"
      icon={<Home className="w-5 h-5 text-primary-foreground" />}
      iconBg="gradient-primary"
      actions={headerExtra}
    >
      {/* Week overview pills */}
      <div className="flex gap-1 mb-3">
        {DAY_SHORT.map((day, i) => {
          const dayChores = choresByDay[i];
          const completed = dayChores.filter((c) => c.completed).length;
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
                <span
                  className={`text-[9px] block mt-0.5 ${
                    isToday ? "text-primary-foreground/80" : allDone ? "text-green-500" : "text-muted-foreground/60"
                  }`}
                >
                  {allDone ? "✓" : `${completed}/${total}`}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded day content */}
      {DAY_LABELS.map((dayName, dayIndex) => {
        const dayChores = choresByDay[dayIndex];
        const isExpanded = expandedDay === dayIndex;
        const isToday = dayIndex === todayIndex;

        if (!isExpanded) return null;

        return (
          <div key={dayIndex} className={`rounded-xl bg-gradient-to-b ${DAY_COLORS[dayIndex]} p-3`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold text-sm ${DAY_ACCENTS[dayIndex]}`}>
                {dayName}
                {isToday && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-bold">
                    dziś
                  </span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {dayChores.filter((c) => c.completed).length}/{dayChores.length}
              </span>
            </div>

            <div className="space-y-1">
              {dayChores.length === 0 && addingForDay !== dayIndex && (
                <p className="text-xs text-muted-foreground/50 py-4 text-center italic">Brak obowiązków</p>
              )}

              {dayChores.map((chore, idx) => {
                const active = isChoreActiveToday(chore);
                const isDragging = draggedIdx === idx;
                const isOver = dragOverIdx === idx && draggedIdx !== idx;

                return (
                  <div
                    key={chore.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, dayChores)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 px-2 py-2.5 rounded-xl transition-all group select-none ${
                      isDragging
                        ? "opacity-40 scale-95"
                        : isOver
                        ? "ring-2 ring-primary/50 bg-primary/5"
                        : !active
                        ? "bg-background/30 opacity-50"
                        : chore.completed
                        ? "bg-background/40"
                        : "bg-background/70 shadow-sm"
                    }`}
                  >
                    {/* Grip handle for reordering */}
                    <div className="shrink-0 cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <button
                      onClick={() => handleToggle(chore.id, chore.completed)}
                      className="shrink-0 transition-transform active:scale-90"
                      disabled={!active}
                    >
                      {chore.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle
                          className={`w-5 h-5 transition-colors ${
                            active ? "text-muted-foreground/40 hover:text-primary" : "text-muted-foreground/20"
                          }`}
                        />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm block transition-all ${
                          chore.completed
                            ? "line-through text-muted-foreground/40"
                            : active
                            ? "text-foreground"
                            : "text-muted-foreground/50"
                        }`}
                      >
                        {chore.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                        <Repeat className="w-2.5 h-2.5" />
                        {chore.recurrence === "daily"
                          ? "Codziennie"
                          : chore.recurrence === "monthly"
                          ? "Raz w miesiącu"
                          : "Co tydzień"}
                        {" · "}
                        {chore.assigned_to === "me" ? "👤 Ja" : chore.assigned_to === "partner" ? "💑 Partner" : "👫 Oboje"}
                        {!active && " · nieaktywne"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(chore.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground/30 hover:text-destructive transition-all p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {/* Add chore form */}
              {addingForDay === dayIndex ? (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-2">
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
                  <Select value={newRecurrence} onValueChange={setNewRecurrence}>
                    <SelectTrigger className="h-8 text-xs rounded-xl bg-background/70 w-full">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3 h-3" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRENCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.icon} {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={newAssignedTo} onValueChange={setNewAssignedTo}>
                    <SelectTrigger className="h-8 text-xs rounded-xl bg-background/70 w-full">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNED_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.icon} {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAddingForDay(dayIndex);
                    setNewChoreText("");
                    setNewRecurrence("weekly");
                    setNewAssignedTo("both");
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
    </WidgetWrapper>
  );
};

export default ChoresPlanner;
