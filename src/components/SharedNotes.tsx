import { useState } from "react";
import { StickyNote, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Note } from "@/types";
import { cn } from "@/lib/utils";

const noteColors = [
  "bg-rose-light",
  "bg-coral-light",
  "bg-secondary",
];

const SharedNotes = () => {
  const [notes, setNotes] = useState<Note[]>([
    { id: "1", title: "Kocham Cię! 💕", content: "Jesteś najlepsza!", createdAt: new Date() },
    { id: "2", title: "Pamiętaj!", content: "Kupić kwiaty w piątek 🌹", createdAt: new Date() },
  ]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [isAdding, setIsAdding] = useState(false);

  const addNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      setNotes([...notes, { 
        id: Date.now().toString(), 
        title: newNote.title || "Notatka",
        content: newNote.content,
        createdAt: new Date() 
      }]);
      setNewNote({ title: "", content: "" });
      setIsAdding(false);
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <StickyNote className="w-5 h-5 text-foreground" />
          </div>
          <h2 className="text-xl font-heading font-semibold">Notatki</h2>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)} 
          size="icon" 
          variant={isAdding ? "outline" : "soft"}
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </Button>
      </div>

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
          <Button onClick={addNote} className="w-full">
            Dodaj notatkę
          </Button>
        </div>
      )}

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
              onClick={() => deleteNote(note.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-heading font-semibold text-sm mb-1 pr-4">{note.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
          </div>
        ))}
      </div>

      {notes.length === 0 && !isAdding && (
        <p className="text-center text-muted-foreground py-8">
          Zostaw sobie wiadomość! 📝
        </p>
      )}
    </div>
  );
};

export default SharedNotes;
