import { useState } from "react";
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
import FavoriteRecipes from "@/components/FavoriteRecipes";
import WidgetSettings from "@/components/WidgetSettings";
import { useWidgetVisibility } from "@/hooks/useWidgetVisibility";

const ResponsiveGridLayout = WidthProvider(Responsive);

const STORAGE_KEY = "dashboard-layouts-v3";

const defaultLayouts: Layouts = {
  lg: [
    { i: "meals-planner", x: 0, y: 0, w: 3, h: 5, minH: 4 },
    { i: "days-counter", x: 0, y: 5, w: 1, h: 6, minH: 5 },
    { i: "shopping-list", x: 0, y: 11, w: 1, h: 4, minH: 3 },
    { i: "date-ideas", x: 0, y: 15, w: 1, h: 3, minH: 2 },
    { i: "task-list", x: 1, y: 5, w: 1, h: 4, minH: 3 },
    { i: "shared-notes", x: 1, y: 9, w: 1, h: 3, minH: 2 },
    { i: "expense-tracker", x: 1, y: 12, w: 1, h: 5, minH: 4 },
    { i: "mini-calendar", x: 2, y: 5, w: 1, h: 5, minH: 4 },
    { i: "favorite-recipes", x: 2, y: 10, w: 1, h: 4, minH: 3 },
  ],
  md: [
    { i: "meals-planner", x: 0, y: 0, w: 2, h: 5, minH: 4 },
    { i: "days-counter", x: 0, y: 5, w: 1, h: 5, minH: 4 },
    { i: "task-list", x: 1, y: 5, w: 1, h: 4, minH: 3 },
    { i: "shopping-list", x: 0, y: 10, w: 1, h: 4, minH: 3 },
    { i: "shared-notes", x: 1, y: 9, w: 1, h: 3, minH: 2 },
    { i: "date-ideas", x: 0, y: 14, w: 1, h: 3, minH: 2 },
    { i: "expense-tracker", x: 1, y: 12, w: 1, h: 5, minH: 4 },
    { i: "mini-calendar", x: 0, y: 17, w: 2, h: 5, minH: 4 },
    { i: "favorite-recipes", x: 0, y: 22, w: 2, h: 4, minH: 3 },
  ],
  sm: [
    { i: "meals-planner", x: 0, y: 0, w: 1, h: 6, minH: 5 },
    { i: "days-counter", x: 0, y: 6, w: 1, h: 5, minH: 4 },
    { i: "task-list", x: 0, y: 11, w: 1, h: 4, minH: 3 },
    { i: "shopping-list", x: 0, y: 15, w: 1, h: 4, minH: 3 },
    { i: "date-ideas", x: 0, y: 19, w: 1, h: 3, minH: 2 },
    { i: "shared-notes", x: 0, y: 22, w: 1, h: 3, minH: 2 },
    { i: "expense-tracker", x: 0, y: 25, w: 1, h: 5, minH: 4 },
    { i: "mini-calendar", x: 0, y: 30, w: 1, h: 5, minH: 4 },
    { i: "favorite-recipes", x: 0, y: 35, w: 1, h: 4, minH: 3 },
  ],
};

const ALL_WIDGETS: Record<string, React.FC> = {
  "days-counter": DaysCounter,
  "shopping-list": ShoppingList,
  "date-ideas": DateIdeas,
  "task-list": TaskList,
  "shared-notes": SharedNotes,
  "expense-tracker": ExpenseTracker,
  "mini-calendar": MiniCalendar,
  "meals-planner": MealsPlanner,
  "favorite-recipes": FavoriteRecipes,
};

const Index = () => {
  const { isVisible } = useWidgetVisibility();
  
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

  // Filter layouts to only include visible widgets
  const getFilteredLayouts = (): Layouts => {
    const filtered: Layouts = {};
    for (const [breakpoint, layout] of Object.entries(layouts)) {
      const layoutArray = layout as Layout[];
      filtered[breakpoint] = layoutArray.filter((item) => isVisible(item.i));
    }
    return filtered;
  };

  // Get visible widgets
  const visibleWidgets = Object.entries(ALL_WIDGETS).filter(([id]) => isVisible(id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <WidgetSettings />
        </div>
        
        <ResponsiveGridLayout
          className="layout"
          layouts={getFilteredLayouts()}
          breakpoints={{ lg: 1024, md: 768, sm: 0 }}
          cols={{ lg: 3, md: 2, sm: 1 }}
          rowHeight={60}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          isResizable={false}
        >
          {visibleWidgets.map(([id, Component]) => (
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
