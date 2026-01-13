import { useState } from "react";
import { StickyNote, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNotes } from "@/hooks/useNotes";
import WidgetWrapper from "./WidgetWrapper";

const noteColors = [
  "bg-rose-light",
  "bg-coral-light",
  "bg-secondary",
];

const SharedNotes = () => {
  const { notes, isLoading, addNote, deleteNote } = useNotes();
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      addNote.mutate({ 
        title: newNote.title || "Notatka",
        content: newNote.content,
      });
      setNewNote({ title: "", content: "" });
      setIsAdding(false);
    }
  };

  return (
    <WidgetWrapper
      title="Notatki"
      icon={<StickyNote className="w-5 h-5 text-foreground" />}
      iconBg="bg-secondary"
      actions={
        <Button 
          onClick={() => setIsAdding(!isAdding)} 
          size="icon" 
          variant={isAdding ? "outline" : "soft"}
          className="h-8 w-8"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </Button>
      }
    >
      {isAdding && (
        <div className="mb-4 p-4 bg-secondary rounded-xl space-y-3">
          <Input
            placeholder="Tytuł..."
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="rounded-lg border-0 bg-background"
          />
          <Textarea
            placeholder="Treść notatki..."
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            className="rounded-lg border-0 bg-background resize-none"
            rows={3}
          />
          <Button onClick={handleAddNote} className="w-full" disabled={addNote.isPending}>
            {addNote.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Dodaj notatkę"}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {notes.map((note, index) => (
            <div
              key={note.id}
              className={cn(
                "p-4 rounded-xl relative group transition-all hover:shadow-card-hover",
                noteColors[index % noteColors.length]
              )}
            >
              <button
                onClick={() => deleteNote.mutate(note.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-heading font-semibold text-sm mb-1 pr-4">{note.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
            </div>
          ))}
        </div>
      )}

      {!isLoading && notes.length === 0 && !isAdding && (
        <p className="text-center text-muted-foreground py-8">
          Zostaw sobie wiadomość! 📝
        </p>
      )}
    </WidgetWrapper>
  );
};

export default SharedNotes;
