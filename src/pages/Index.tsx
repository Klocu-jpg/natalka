import { useMemo } from "react";
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
import EventCountdowns from "@/components/EventCountdowns";
import PeriodTracker from "@/components/PeriodTracker";
import SavingsGoals from "@/components/SavingsGoals";
import PhotoAlbums from "@/components/PhotoAlbums";
import GenderSelector from "@/components/GenderSelector";
import { useWidgetVisibility } from "@/contexts/WidgetVisibilityContext";
import { useProfile } from "@/hooks/useProfile";

const ResponsiveGridLayout = WidthProvider(Responsive);

const STORAGE_KEY = "dashboard-layouts-v5";

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
    { i: "event-countdowns", x: 0, y: 18, w: 1, h: 4, minH: 3 },
    { i: "period-tracker", x: 1, y: 17, w: 1, h: 4, minH: 3 },
    { i: "savings-goals", x: 2, y: 14, w: 1, h: 5, minH: 4 },
    { i: "photo-albums", x: 0, y: 22, w: 2, h: 5, minH: 4 },
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
    { i: "event-countdowns", x: 0, y: 26, w: 1, h: 4, minH: 3 },
    { i: "period-tracker", x: 1, y: 26, w: 1, h: 4, minH: 3 },
    { i: "savings-goals", x: 0, y: 30, w: 2, h: 5, minH: 4 },
    { i: "photo-albums", x: 0, y: 35, w: 2, h: 5, minH: 4 },
  ],
  sm: [
    { i: "meals-planner", x: 0, y: 0, w: 1, h: 5, minH: 4 },
    { i: "days-counter", x: 0, y: 5, w: 1, h: 5, minH: 4 },
    { i: "period-tracker", x: 0, y: 10, w: 1, h: 5, minH: 4 },
    { i: "task-list", x: 0, y: 15, w: 1, h: 4, minH: 3 },
    { i: "shopping-list", x: 0, y: 19, w: 1, h: 4, minH: 3 },
    { i: "date-ideas", x: 0, y: 23, w: 1, h: 3, minH: 2 },
    { i: "shared-notes", x: 0, y: 26, w: 1, h: 3, minH: 2 },
    { i: "expense-tracker", x: 0, y: 29, w: 1, h: 5, minH: 4 },
    { i: "mini-calendar", x: 0, y: 34, w: 1, h: 5, minH: 4 },
    { i: "favorite-recipes", x: 0, y: 39, w: 1, h: 4, minH: 3 },
    { i: "event-countdowns", x: 0, y: 43, w: 1, h: 4, minH: 3 },
    { i: "savings-goals", x: 0, y: 47, w: 1, h: 5, minH: 4 },
    { i: "photo-albums", x: 0, y: 52, w: 1, h: 5, minH: 4 },
  ],
};

const ALL_WIDGETS: Record<string, React.FC> = {
  "meals-planner": MealsPlanner,
  "days-counter": DaysCounter,
  "shopping-list": ShoppingList,
  "date-ideas": DateIdeas,
  "task-list": TaskList,
  "shared-notes": SharedNotes,
  "expense-tracker": ExpenseTracker,
  "mini-calendar": MiniCalendar,
  "favorite-recipes": FavoriteRecipes,
  "event-countdowns": EventCountdowns,
  "period-tracker": PeriodTracker,
  "savings-goals": SavingsGoals,
  "photo-albums": PhotoAlbums,
};

const Index = () => {
  const { visibleWidgets } = useWidgetVisibility();
  const { profile, isLoading } = useProfile();
  
  // Get filtered layouts based on visible widgets - always use defaults with minH preserved
  const getLayoutsForVisibleWidgets = useMemo(() => {
    const result: Layouts = {};
    
    for (const [breakpoint, layout] of Object.entries(defaultLayouts)) {
      const layoutArray = layout as Layout[];
      // Filter to only visible widgets and preserve all properties including minH
      result[breakpoint] = layoutArray
        .filter((item) => visibleWidgets.includes(item.i))
        .map((item) => ({ ...item }));
    }
    
    return result;
  }, [visibleWidgets]);

  // Get visible widget components in correct order
  const widgetComponents = useMemo(() => {
    // Use the order from defaultLayouts.lg to maintain consistent ordering
    const orderedIds = defaultLayouts.lg.map(l => l.i);
    return orderedIds
      .filter((id) => visibleWidgets.includes(id))
      .map((id) => ({ id, Component: ALL_WIDGETS[id] }));
  }, [visibleWidgets]);

  // Show gender selector if profile doesn't have gender set - AFTER all hooks!
  if (!isLoading && profile === null) {
    return <GenderSelector onComplete={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-safe">
        
        <ResponsiveGridLayout
          className="layout"
          layouts={getLayoutsForVisibleWidgets}
          breakpoints={{ lg: 1024, md: 768, sm: 0 }}
          cols={{ lg: 3, md: 2, sm: 1 }}
          rowHeight={60}
          margin={[12, 12]}
          containerPadding={[0, 0]}
          draggableHandle=".drag-handle"
          isResizable={false}
        >
          {widgetComponents.map(({ id, Component }) => (
            <div key={id} className="widget-container">
              <Component />
            </div>
          ))}
        </ResponsiveGridLayout>
      </main>

      {/* Decorative footer - hidden on mobile for cleaner look */}
      <footer className="py-6 sm:py-8 text-center hidden sm:block">
        <p className="text-muted-foreground text-sm">
          Zbudowane z 💕 dla Was
        </p>
      </footer>
    </div>
  );
};

export default Index;