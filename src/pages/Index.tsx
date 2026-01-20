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
import MobileDashboard from "@/components/MobileDashboard";
import { useWidgetVisibility } from "@/contexts/WidgetVisibilityContext";
import { useProfile } from "@/hooks/useProfile";
import { useIsMobile } from "@/hooks/use-mobile";

const ResponsiveGridLayout = WidthProvider(Responsive);

const defaultLayouts: Layouts = {
  lg: [
    // Row 1: Full width header
    { i: "meals-planner", x: 0, y: 0, w: 3, h: 5, minH: 4 },
    
    // Row 2: Three equal columns (h=5)
    { i: "days-counter", x: 0, y: 5, w: 1, h: 5, minH: 4 },
    { i: "mini-calendar", x: 1, y: 5, w: 1, h: 5, minH: 4 },
    { i: "expense-tracker", x: 2, y: 5, w: 1, h: 5, minH: 4 },
    
    // Row 3: Three equal columns (h=4)
    { i: "shopping-list", x: 0, y: 10, w: 1, h: 4, minH: 3 },
    { i: "task-list", x: 1, y: 10, w: 1, h: 4, minH: 3 },
    { i: "savings-goals", x: 2, y: 10, w: 1, h: 4, minH: 3 },
    
    // Row 4: Three equal columns (h=3)
    { i: "date-ideas", x: 0, y: 14, w: 1, h: 3, minH: 2 },
    { i: "shared-notes", x: 1, y: 14, w: 1, h: 3, minH: 2 },
    { i: "favorite-recipes", x: 2, y: 14, w: 1, h: 3, minH: 2 },
    
    // Row 5: Two columns + empty space (h=4)
    { i: "period-tracker", x: 0, y: 17, w: 1, h: 4, minH: 3 },
    { i: "event-countdowns", x: 1, y: 17, w: 1, h: 4, minH: 3 },
    
    // Row 6: Full width footer
    { i: "photo-albums", x: 0, y: 21, w: 3, h: 5, minH: 4 },
  ],
  md: [
    // Row 1: Full width header
    { i: "meals-planner", x: 0, y: 0, w: 2, h: 5, minH: 4 },
    
    // Row 2: Two equal columns (h=5)
    { i: "days-counter", x: 0, y: 5, w: 1, h: 5, minH: 4 },
    { i: "mini-calendar", x: 1, y: 5, w: 1, h: 5, minH: 4 },
    
    // Row 3: Two equal columns (h=5)
    { i: "expense-tracker", x: 0, y: 10, w: 1, h: 5, minH: 4 },
    { i: "savings-goals", x: 1, y: 10, w: 1, h: 5, minH: 4 },
    
    // Row 4: Two equal columns (h=4)
    { i: "shopping-list", x: 0, y: 15, w: 1, h: 4, minH: 3 },
    { i: "task-list", x: 1, y: 15, w: 1, h: 4, minH: 3 },
    
    // Row 5: Two equal columns (h=3)
    { i: "date-ideas", x: 0, y: 19, w: 1, h: 3, minH: 2 },
    { i: "shared-notes", x: 1, y: 19, w: 1, h: 3, minH: 2 },
    
    // Row 6: Two equal columns (h=4)
    { i: "event-countdowns", x: 0, y: 22, w: 1, h: 4, minH: 3 },
    { i: "period-tracker", x: 1, y: 22, w: 1, h: 4, minH: 3 },
    
    // Row 7: Full width
    { i: "favorite-recipes", x: 0, y: 26, w: 2, h: 4, minH: 3 },
    
    // Row 8: Full width footer
    { i: "photo-albums", x: 0, y: 30, w: 2, h: 5, minH: 4 },
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
  const isMobile = useIsMobile();
  
  // Get filtered layouts based on visible widgets
  const getLayoutsForVisibleWidgets = useMemo(() => {
    const result: Layouts = {};
    
    for (const [breakpoint, layout] of Object.entries(defaultLayouts)) {
      const layoutArray = layout as Layout[];
      result[breakpoint] = layoutArray
        .filter((item) => visibleWidgets.includes(item.i))
        .map((item) => ({ ...item }));
    }
    
    return result;
  }, [visibleWidgets]);

  // Get visible widget components in correct order
  const widgetComponents = useMemo(() => {
    const orderedIds = defaultLayouts.lg.map(l => l.i);
    return orderedIds
      .filter((id) => visibleWidgets.includes(id))
      .map((id) => ({ id, Component: ALL_WIDGETS[id] }));
  }, [visibleWidgets]);

  // Show gender selector if profile doesn't have gender set
  if (!isLoading && profile === null) {
    return <GenderSelector onComplete={() => window.location.reload()} />;
  }

  // Mobile layout with tabs and swipe
  if (isMobile) {
    return <MobileDashboard />;
  }

  // Desktop layout with grid
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <ResponsiveGridLayout
          className="layout"
          layouts={getLayoutsForVisibleWidgets}
          breakpoints={{ lg: 1024, md: 768 }}
          cols={{ lg: 3, md: 2 }}
          rowHeight={60}
          margin={[16, 16]}
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

      <footer className="py-8 text-center">
        <p className="text-muted-foreground text-sm">
          Zbudowane z 💕 dla Was
        </p>
      </footer>
    </div>
  );
};

export default Index;