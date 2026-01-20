import { useState } from "react";
import { Calendar, Plus, Trash2, Plane, PartyPopper, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEventCountdowns } from "@/hooks/useEventCountdowns";
import { useCouple } from "@/hooks/useCouple";
import { format, differenceInDays } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";
import WidgetWrapper from "./WidgetWrapper";

const EMOJI_OPTIONS = ["🎉", "✈️", "🎂", "💍", "🏖️", "🎄", "🎁", "❤️", "🎓", "🏠"];

const EventCountdowns = () => {
  const { couple } = useCouple();
  const { upcomingEvents, isLoading, addEvent, deleteEvent } = useEventCountdowns();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🎉");

  const handleAdd = async () => {
    if (!title.trim() || !date) {
      toast.error("Wypełnij wszystkie pola");
      return;
    }
    try {
      await addEvent.mutateAsync({ title: title.trim(), date, emoji: selectedEmoji });
      toast.success("Dodano wydarzenie! 🎉");
      setTitle("");
      setDate("");
      setSelectedEmoji("🎉");
      setIsOpen(false);
    } catch {
      toast.error("Nie udało się dodać");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent.mutateAsync(id);
      toast.success("Usunięto");
    } catch {
      toast.error("Błąd");
    }
  };

  if (!couple) {
    return (
      <WidgetWrapper
        title="Odliczanie"
        icon={<Calendar className="w-5 h-5 text-primary" />}
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
      title="Odliczanie"
      icon={<Plane className="w-5 h-5 text-primary-foreground" />}
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
              <DialogTitle>Nowe wydarzenie</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex gap-2 flex-wrap">
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-2xl p-2 rounded-lg transition-colors ${
                      selectedEmoji === emoji ? "bg-primary/20" : "hover:bg-secondary"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Nazwa wydarzenia (np. Wakacje)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <Button onClick={handleAdd} className="w-full" disabled={addEvent.isPending}>
                {addEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Dodaj"}
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
      ) : upcomingEvents.length === 0 ? (
        <div className="text-center py-6">
          <PartyPopper className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            Brak nadchodzących wydarzeń
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Dodaj wakacje, urodziny lub rocznicę!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 group"
            >
              <span className="text-2xl">{event.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(event.date), "d MMMM yyyy", { locale: pl })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">{event.daysRemaining}</div>
                <div className="text-xs text-muted-foreground">dni</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(event.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </WidgetWrapper>
  );
};

export default EventCountdowns;
