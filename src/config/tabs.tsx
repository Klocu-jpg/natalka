import { ReactNode } from "react";
import { Home, ListTodo, Heart, Wallet, MoreHorizontal } from "lucide-react";

export interface TabConfig {
  id: string;
  label: string;
  icon: ReactNode;
  widgets: string[];
}

// Home in center, others around it
export const TABS: TabConfig[] = [
  {
    id: "lists",
    label: "Listy",
    icon: <ListTodo className="w-5 h-5" />,
    widgets: ["shopping-list", "task-list", "shared-notes"],
  },
  {
    id: "finance",
    label: "Finanse",
    icon: <Wallet className="w-5 h-5" />,
    widgets: ["expense-tracker", "savings-goals"],
  },
  {
    id: "home",
    label: "Główna",
    icon: <Home className="w-5 h-5" />,
    widgets: ["meals-planner", "favorite-recipes", "days-counter", "period-tracker"],
  },
  {
    id: "together",
    label: "Razem",
    icon: <Heart className="w-5 h-5" />,
    widgets: ["nudge-widget", "date-ideas", "photo-albums", "event-countdowns"],
  },
  {
    id: "more",
    label: "Więcej",
    icon: <MoreHorizontal className="w-5 h-5" />,
    widgets: ["mini-calendar", "event-countdowns"],
  },
];

// Default to center tab (index 2 = "home")
export const DEFAULT_TAB_INDEX = 2;