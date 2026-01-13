import { useState } from "react";
import { Heart, Plus, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateIdea } from "@/types";
import { cn } from "@/lib/utils";

const DateIdeas = () => {
  const [ideas, setIdeas] = useState<DateIdea[]>([
    { id: "1", title: "Piknik w parku 🌳", completed: false },
    { id: "2", title: "Wieczór filmowy z popcornem 🍿", completed: true },
    { id: "3", title: "Wspólne gotowanie kolacji 👨‍🍳", completed: false },
    { id: "4", title: "Spacer po starym mieście 🏛️", completed: false },
  ]);
  const [newIdea, setNewIdea] = useState("");

  const addIdea = () => {
    if (newIdea.trim()) {
      setIdeas([...ideas, { id: Date.now().toString(), title: newIdea, completed: false }]);
      setNewIdea("");
    }
  };

  const toggleIdea = (id: string) => {
    setIdeas(ideas.map(idea => 
      idea.id === id ? { ...idea, completed: !idea.completed } : idea
    ));
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-heading font-semibold">Pomysły na Randkę</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Dodaj pomysł..."
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addIdea()}
          className="rounded-xl border-2 focus:border-primary"
        />
        <Button onClick={addIdea} size="icon">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <ul className="space-y-2 max-h-48 overflow-y-auto">
        {ideas.map((idea) => (
          <li
            key={idea.id}
            onClick={() => toggleIdea(idea.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300",
              idea.completed 
                ? "bg-rose-light/50 border-2 border-primary/20" 
                : "bg-secondary hover:bg-secondary/80"
            )}
          >
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-all",
              idea.completed ? "bg-primary" : "border-2 border-muted-foreground"
            )}>
              {idea.completed && <Check className="w-4 h-4 text-primary-foreground" />}
            </div>
            <span className={cn(
              "flex-1",
              idea.completed && "text-muted-foreground"
            )}>
              {idea.title}
            </span>
            <Heart 
              className={cn(
                "w-4 h-4 transition-colors",
                idea.completed ? "text-primary" : "text-muted-foreground"
              )} 
              fill={idea.completed ? "currentColor" : "none"}
            />
          </li>
        ))}
      </ul>

      {ideas.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Dodaj swój pierwszy pomysł! 💕
        </p>
      )}
    </div>
  );
};

export default DateIdeas;
