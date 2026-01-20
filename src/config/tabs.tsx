import { ReactNode } from "react";
import { Home, ListTodo, Heart, Wallet, MoreHorizontal } from "lucide-react";

export interface TabConfig {
  id: string;
  label: string;
  icon: ReactNode;
  widgets: string[];
}

export const TABS: TabConfig[] = [
  {
    id: "home",
    label: "Główna",
    icon: <Home className="w-5 h-5" />,
    widgets: ["meals-planner", "days-counter", "period-tracker"],
  },
  {
    id: "lists",
    label: "Listy",
    icon: <ListTodo className="w-5 h-5" />,
    widgets: ["shopping-list", "task-list", "shared-notes"],
  },
  {
    id: "together",
    label: "Razem",
    icon: <Heart className="w-5 h-5" />,
    widgets: ["date-ideas", "photo-albums", "event-countdowns"],
  },
  {
    id: "finance",
    label: "Finanse",
    icon: <Wallet className="w-5 h-5" />,
    widgets: ["expense-tracker", "savings-goals"],
  },
  {
    id: "more",
    label: "Więcej",
    icon: <MoreHorizontal className="w-5 h-5" />,
    widgets: ["mini-calendar", "favorite-recipes"],
  },
];