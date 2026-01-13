import { useState } from "react";
import { ShoppingCart, Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingItem } from "@/types";
import { cn } from "@/lib/utils";

const ShoppingList = () => {
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: "1", name: "Mleko", completed: false },
    { id: "2", name: "Chleb", completed: true },
    { id: "3", name: "Jabłka", completed: false },
  ]);
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, { id: Date.now().toString(), name: newItem, completed: false }]);
      setNewItem("");
    }
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-heading font-semibold">Lista Zakupów</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Dodaj produkt..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addItem()}
          className="rounded-xl border-2 focus:border-primary"
        />
        <Button onClick={addItem} size="icon" variant="soft">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <ul className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
              item.completed ? "bg-muted/50" : "bg-secondary hover:bg-secondary/80"
            )}
          >
            <button
              onClick={() => toggleItem(item.id)}
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                item.completed
                  ? "bg-primary border-primary"
                  : "border-muted-foreground hover:border-primary"
              )}
            >
              {item.completed && <Check className="w-4 h-4 text-primary-foreground" />}
            </button>
            <span className={cn(
              "flex-1 transition-all",
              item.completed && "line-through text-muted-foreground"
            )}>
              {item.name}
            </span>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Lista jest pusta! Dodaj coś 🛒
        </p>
      )}
    </div>
  );
};

export default ShoppingList;
