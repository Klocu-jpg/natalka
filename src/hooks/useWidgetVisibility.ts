import { useState, useEffect } from "react";

const STORAGE_KEY = "widget-visibility";

export interface WidgetVisibility {
  [key: string]: boolean;
}

const DEFAULT_VISIBILITY: WidgetVisibility = {
  "meals-planner": true,
  "days-counter": true,
  "mini-calendar": true,
  "task-list": true,
  "shopping-list": true,
  "expense-tracker": true,
  "date-ideas": true,
  "shared-notes": true,
  "favorite-recipes": true,
};

export const WIDGET_LABELS: Record<string, string> = {
  "meals-planner": "Planer obiadów",
  "days-counter": "Licznik dni",
  "mini-calendar": "Kalendarz",
  "task-list": "Zadania",
  "shopping-list": "Lista zakupów",
  "expense-tracker": "Wydatki",
  "date-ideas": "Pomysły na randki",
  "shared-notes": "Notatki",
  "favorite-recipes": "Ulubione przepisy",
};

export const useWidgetVisibility = () => {
  const [visibility, setVisibility] = useState<WidgetVisibility>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure new widgets are visible
        return { ...DEFAULT_VISIBILITY, ...parsed };
      }
    } catch (e) {
      console.error("Error loading widget visibility:", e);
    }
    return DEFAULT_VISIBILITY;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility));
  }, [visibility]);

  const toggleWidget = (widgetId: string) => {
    setVisibility((prev) => ({
      ...prev,
      [widgetId]: !prev[widgetId],
    }));
  };

  const setWidgetVisible = (widgetId: string, visible: boolean) => {
    setVisibility((prev) => ({
      ...prev,
      [widgetId]: visible,
    }));
  };

  const isVisible = (widgetId: string) => {
    return visibility[widgetId] ?? true;
  };

  const visibleWidgets = Object.entries(visibility)
    .filter(([_, visible]) => visible)
    .map(([id]) => id);

  return {
    visibility,
    toggleWidget,
    setWidgetVisible,
    isVisible,
    visibleWidgets,
  };
};
