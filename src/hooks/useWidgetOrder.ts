import { useState, useEffect } from "react";

export interface Widget {
  id: string;
  component: string;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: "days-counter", component: "DaysCounter" },
  { id: "shopping-list", component: "ShoppingList" },
  { id: "date-ideas", component: "DateIdeas" },
  { id: "task-list", component: "TaskList" },
  { id: "shared-notes", component: "SharedNotes" },
  { id: "expense-tracker", component: "ExpenseTracker" },
  { id: "mini-calendar", component: "MiniCalendar" },
];

const STORAGE_KEY = "widget-order";

export const useWidgetOrder = () => {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all default widgets exist (in case new ones were added)
        const savedIds = parsed.map((w: Widget) => w.id);
        const missingWidgets = DEFAULT_WIDGETS.filter(w => !savedIds.includes(w.id));
        return [...parsed, ...missingWidgets];
      } catch {
        return DEFAULT_WIDGETS;
      }
    }
    return DEFAULT_WIDGETS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  }, [widgets]);

  const reorderWidgets = (sourceIndex: number, destinationIndex: number) => {
    const result = Array.from(widgets);
    const [removed] = result.splice(sourceIndex, 1);
    result.splice(destinationIndex, 0, removed);
    setWidgets(result);
  };

  const resetOrder = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  return { widgets, reorderWidgets, resetOrder };
};
