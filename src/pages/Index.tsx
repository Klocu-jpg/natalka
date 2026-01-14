import { useState, useEffect } from "react";
import { Responsive, WidthProvider, Layout, Layouts } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Header from "@/components/Header";
import ShoppingList from "@/components/ShoppingList";
import TaskList from "@/components/TaskList";
import MiniCalendar from "@/components/MiniCalendar";
import DateIdeas from "@/components/DateIdeas";
import SharedNotes from "@/components/SharedNotes";
import ExpenseTracker from "@/components/ExpenseTracker";
import DaysCounter from "@/components/DaysCounter";
import MealsPlanner from "@/components/MealsPlanner";

const ResponsiveGridLayout = WidthProvider(Responsive);

const STORAGE_KEY = "dashboard-layouts-v2";

const defaultLayouts: Layouts = {
  lg: [
    { i: "days-counter", x: 0, y: 0, w: 1, h: 8, minH: 7 },
    { i: "shopping-list", x: 0, y: 8, w: 1, h: 4, minH: 3 },
    { i: "date-ideas", x: 0, y: 12, w: 1, h: 3, minH: 2 },
    { i: "task-list", x: 1, y: 0, w: 1, h: 4, minH: 3 },
    { i: "shared-notes", x: 1, y: 4, w: 1, h: 3, minH: 2 },
    { i: "expense-tracker", x: 1, y: 7, w: 1, h: 5, minH: 4 },
    { i: "mini-calendar", x: 2, y: 0, w: 1, h: 8, minH: 7 },
    { i: "meals-planner", x: 2, y: 8, w: 1, h: 5, minH: 4 },
  ],
  md: [
    { i: "days-counter", x: 0, y: 0, w: 1, h: 8, minH: 7 },
    { i: "shopping-list", x: 0, y: 8, w: 1, h: 4, minH: 3 },
    { i: "date-ideas", x: 0, y: 12, w: 1, h: 3, minH: 2 },
    { i: "task-list", x: 1, y: 0, w: 1, h: 4, minH: 3 },
    { i: "shared-notes", x: 1, y: 4, w: 1, h: 3, minH: 2 },
    { i: "expense-tracker", x: 1, y: 7, w: 1, h: 5, minH: 4 },
    { i: "mini-calendar", x: 0, y: 15, w: 2, h: 7, minH: 7 },
    { i: "meals-planner", x: 0, y: 22, w: 2, h: 5, minH: 4 },
  ],
  sm: [
    { i: "days-counter", x: 0, y: 0, w: 1, h: 8, minH: 7 },
    { i: "task-list", x: 0, y: 8, w: 1, h: 4, minH: 3 },
    { i: "shopping-list", x: 0, y: 12, w: 1, h: 4, minH: 3 },
    { i: "date-ideas", x: 0, y: 16, w: 1, h: 3, minH: 2 },
    { i: "shared-notes", x: 0, y: 19, w: 1, h: 3, minH: 2 },
    { i: "expense-tracker", x: 0, y: 22, w: 1, h: 5, minH: 4 },
    { i: "mini-calendar", x: 0, y: 27, w: 1, h: 7, minH: 7 },
    { i: "meals-planner", x: 0, y: 34, w: 1, h: 5, minH: 4 },
  ],
};

const WIDGETS: Record<string, React.FC> = {
  "days-counter": DaysCounter,
  "shopping-list": ShoppingList,
  "date-ideas": DateIdeas,
  "task-list": TaskList,
  "shared-notes": SharedNotes,
  "expense-tracker": ExpenseTracker,
  "mini-calendar": MiniCalendar,
  "meals-planner": MealsPlanner,
};

const Index = () => {
  const [layouts, setLayouts] = useState<Layouts>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultLayouts;
      }
    }
    return defaultLayouts;
  });

  const handleLayoutChange = (_: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLayouts));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1024, md: 768, sm: 0 }}
          cols={{ lg: 3, md: 2, sm: 1 }}
          rowHeight={60}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          isResizable={false}
        >
          {Object.entries(WIDGETS).map(([id, Component]) => (
            <div key={id} className="widget-container">
              <Component />
            </div>
          ))}
        </ResponsiveGridLayout>
      </main>

      {/* Decorative footer */}
      <footer className="py-8 text-center">
        <p className="text-muted-foreground text-sm">
          Zbudowane z 💕 dla Was
        </p>
      </footer>
    </div>
  );
};

export default Index;
