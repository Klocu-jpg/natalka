import { useState } from "react";
import { CheckCircle2, Plus, Trash2, Circle, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/useTasks";

const TaskList = () => {
  const { tasks, isLoading, addTask, toggleTask, deleteTask } = useTasks();
  const [newTask, setNewTask] = useState("");

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask.mutate(newTask);
      setNewTask("");
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high": return "text-destructive";
      case "medium": return "text-coral";
      case "low": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-coral flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
        </div>
        <h2 className="text-xl font-heading font-semibold">Zadania</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Dodaj zadanie..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
          className="rounded-xl border-2 focus:border-coral"
        />
        <Button onClick={handleAddTask} size="icon" variant="coral" disabled={addTask.isPending}>
          {addTask.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-coral" />
        </div>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                task.completed ? "bg-muted/50" : "bg-coral-light hover:bg-coral-light/80"
              )}
            >
              <button
                onClick={() => toggleTask.mutate({ id: task.id, completed: !task.completed })}
                className="transition-transform hover:scale-110"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" />
                )}
              </button>
              <span className={cn(
                "flex-1 transition-all",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </span>
              <Star className={cn("w-4 h-4", getPriorityColor(task.priority))} fill="currentColor" />
              <button
                onClick={() => deleteTask.mutate(task.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && tasks.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Wszystko zrobione! 🎉
        </p>
      )}
    </div>
  );
};

export default TaskList;
