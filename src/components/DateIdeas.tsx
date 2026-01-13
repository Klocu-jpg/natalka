import { useState } from "react";
import { Heart, Plus, Sparkles, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDateIdeas } from "@/hooks/useDateIdeas";
import WidgetWrapper from "./WidgetWrapper";

const DateIdeas = () => {
  const { ideas, isLoading, addIdea, toggleIdea } = useDateIdeas();
  const [newIdea, setNewIdea] = useState("");

  const handleAddIdea = () => {
    if (newIdea.trim()) {
      addIdea.mutate(newIdea);
      setNewIdea("");
    }
  };

  return (
    <WidgetWrapper
      title="Pomysły na Randkę"
      icon={<Sparkles className="w-5 h-5 text-primary-foreground" />}
      iconBg="gradient-primary"
    >
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Dodaj pomysł..."
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddIdea()}
          className="rounded-xl border-2 focus:border-primary"
        />
        <Button onClick={handleAddIdea} size="icon" disabled={addIdea.isPending}>
          {addIdea.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <ul className="space-y-2 overflow-y-auto">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              onClick={() => toggleIdea.mutate({ id: idea.id, completed: !idea.completed })}
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
      )}

      {!isLoading && ideas.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Dodaj swój pierwszy pomysł! 💕
        </p>
      )}
    </WidgetWrapper>
  );
};

export default DateIdeas;
