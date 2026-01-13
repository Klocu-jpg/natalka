import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/types";

const MiniCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events] = useState<CalendarEvent[]>([
    { id: "1", title: "Rocznica", date: new Date(2026, 0, 14), type: "anniversary" },
    { id: "2", title: "Randka", date: new Date(2026, 0, 17), type: "date" },
    { id: "3", title: "Urodziny Kasi", date: new Date(2026, 0, 20), type: "other" },
  ]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay();
  const emptyDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const weekDays = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-rose-light flex items-center justify-center">
          <CalendarIcon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-heading font-semibold">Kalendarz</h2>
      </div>

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

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: emptyDays }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const hasEvent = dayEvents.length > 0;
          const hasAnniversary = dayEvents.some(e => e.type === "anniversary");
          
          return (
            <button
              key={day.toISOString()}
              className={cn(
                "aspect-square rounded-lg text-sm flex flex-col items-center justify-center transition-all relative",
                isToday(day) && "gradient-primary text-primary-foreground font-bold",
                !isToday(day) && isSameMonth(day, currentMonth) && "hover:bg-secondary",
                !isSameMonth(day, currentMonth) && "text-muted-foreground/50"
              )}
            >
              {format(day, "d")}
              {hasEvent && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {hasAnniversary ? (
                    <Heart className="w-2 h-2 text-primary" fill="currentColor" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-coral" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-2">Nadchodzące wydarzenia</h4>
          <ul className="space-y-2">
            {events.slice(0, 3).map(event => (
              <li key={event.id} className="flex items-center gap-2 text-sm">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  event.type === "anniversary" ? "bg-primary" : 
                  event.type === "date" ? "bg-coral" : "bg-muted-foreground"
                )} />
                <span className="flex-1">{event.title}</span>
                <span className="text-muted-foreground text-xs">
                  {format(event.date, "d MMM", { locale: pl })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MiniCalendar;
