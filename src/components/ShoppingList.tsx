import { useState } from "react";
import { ShoppingCart, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useShoppingItems } from "@/hooks/useShoppingItems";
import { Checkbox } from "@/components/ui/checkbox";
import WidgetWrapper from "./WidgetWrapper";

const ShoppingList = () => {
  const { items, isLoading, addItem, toggleItem, deleteItem } = useShoppingItems();
  const [newItem, setNewItem] = useState("");

  const handleAddItem = () => {
    if (newItem.trim()) {
      addItem.mutate(newItem);
      setNewItem("");
    }
  };

  return (
    <WidgetWrapper
      title="Lista Zakupów"
      icon={<ShoppingCart className="w-5 h-5 text-primary-foreground" />}
      iconBg="gradient-primary"
    >
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Dodaj produkt..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
          className="rounded-xl border-2 focus:border-primary"
        />
        <Button onClick={handleAddItem} size="icon" variant="soft" disabled={addItem.isPending}>
          {addItem.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                item.completed ? "bg-muted/50" : "bg-secondary hover:bg-secondary/80"
              )}
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleItem.mutate({ id: item.id, completed: !item.completed })}
                className={cn(
                  "h-5 w-5 rounded-md",
                  item.completed ? "border-primary" : "border-muted-foreground"
                )}
              />
              <span className={cn(
                "flex-1 transition-all",
                item.completed && "line-through text-muted-foreground"
              )}>
                {item.name}
              </span>
              <button
                onClick={() => deleteItem.mutate(item.id)}
                className="inline-touch text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && items.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Lista jest pusta! Dodaj coś 🛒
        </p>
      )}
    </WidgetWrapper>
  );
};

export default ShoppingList;
