import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Heart, Plus, X, Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCalendarEvents, CalendarEvent } from "@/hooks/useCalendarEvents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import WidgetWrapper from "./WidgetWrapper";

const MiniCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { events, isLoading, addEvent, deleteEvent } = useCalendarEvents();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: new Date(), event_type: "other" as CalendarEvent["event_type"] });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay();
  const emptyDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(parseISO(event.date), day));
  };

  const weekDays = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      toast.error("Wpisz tytuł wydarzenia");
      return;
    }
    addEvent.mutate({
      title: newEvent.title,
      date: format(newEvent.date, "yyyy-MM-dd"),
      event_type: newEvent.event_type,
    });
    setNewEvent({ title: "", date: new Date(), event_type: "other" });
    setDialogOpen(false);
    toast.success("Wydarzenie dodane!");
  };

  return (
    <WidgetWrapper
      title="Kalendarz"
      icon={<CalendarIcon className="w-5 h-5 text-primary" />}
      iconBg="bg-rose-light"
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="soft" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">Dodaj wydarzenie</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tytuł</label>
                <Input
                  placeholder="Np. Randka w kinie..."
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newEvent.date, "d MMMM yyyy", { locale: pl })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newEvent.date}
                      onSelect={(date) => date && setNewEvent({ ...newEvent, date })}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Typ</label>
                <Select
                  value={newEvent.event_type}
                  onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value as CalendarEvent["event_type"] })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Randka</SelectItem>
                    <SelectItem value="anniversary">Rocznica</SelectItem>
                    <SelectItem value="task">Zadanie</SelectItem>
                    <SelectItem value="other">Inne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleAddEvent} className="w-full" disabled={addEvent.isPending}>
                {addEvent.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Dodaj wydarzenie"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-heading font-semibold capitalize">
          {format(currentMonth, "LLLL yyyy", { locale: pl })}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground py-1.5 sm:py-2">
            {day}
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {Array.from({ length: emptyDays }).map((_, i) => (
            <div key={`empty-${i}`} className="w-full pb-[100%]" />
          ))}
          {days.map(day => {
            const dayEvents = getEventsForDay(day);
            const hasEvent = dayEvents.length > 0;
            const hasAnniversary = dayEvents.some(e => e.event_type === "anniversary");
            const hasDate = dayEvents.some(e => e.event_type === "date");
            
            return (
              <button
                key={day.toISOString()}
                className={cn(
                  "inline-touch w-full pb-[100%] relative rounded-md sm:rounded-lg text-xs sm:text-sm transition-all",
                  isToday(day) && "gradient-primary text-primary-foreground font-bold",
                  !isToday(day) && isSameMonth(day, currentMonth) && "hover:bg-secondary",
                  !isSameMonth(day, currentMonth) && "text-muted-foreground/50"
                )}
              >
                <span className="absolute inset-0 flex flex-col items-center justify-center">
                  {format(day, "d")}
                  {hasEvent && (
                    <div className="absolute bottom-0.5 sm:bottom-1 flex gap-0.5">
                      {hasAnniversary || hasDate ? (
                        <Heart className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-primary" fill="currentColor" />
                      ) : (
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-coral" />
                      )}
                    </div>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-2">Nadchodzące wydarzenia</h4>
          <ul className="space-y-2">
            {events.slice(0, 5).map(event => (
              <li key={event.id} className="flex items-center gap-2 text-sm group">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  event.event_type === "anniversary" ? "bg-primary" : 
                  event.event_type === "date" ? "bg-coral" : "bg-muted-foreground"
                )} />
                <span className="flex-1">{event.title}</span>
                <span className="text-muted-foreground text-xs">
                  {format(parseISO(event.date), "d MMM", { locale: pl })}
                </span>
                <button
                  onClick={() => deleteEvent.mutate(event.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </WidgetWrapper>
  );
};

export default MiniCalendar;
