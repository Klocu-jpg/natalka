import { useState, useMemo } from "react";
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
import NudgeWidget from "@/components/NudgeWidget";
import GenderSelector from "@/components/GenderSelector";
import MobileHeader from "@/components/MobileHeader";
import BottomTabBar from "@/components/BottomTabBar";
import SwipeableTabs from "@/components/SwipeableTabs";
import { useWidgetVisibility } from "@/contexts/WidgetVisibilityContext";
import { useProfile } from "@/hooks/useProfile";
import { TABS, DEFAULT_TAB_INDEX } from "@/config/tabs";

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
  "nudge-widget": NudgeWidget,
};

const MobileDashboard = () => {
  // Start on center tab (Home)
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB_INDEX);
  const { visibleWidgets } = useWidgetVisibility();
  const { profile, isLoading } = useProfile();

  // Get widgets for each tab, filtered by visibility
  const tabContents = useMemo(() => {
    return TABS.map((tab) => {
      const tabWidgets = tab.widgets
        .filter((widgetId) => visibleWidgets.includes(widgetId))
        .map((widgetId) => {
          const Component = ALL_WIDGETS[widgetId];
          return Component ? { id: widgetId, Component } : null;
        })
        .filter((w): w is { id: string; Component: React.FC } => w !== null);
      
      return { tabId: tab.id, widgets: tabWidgets, icon: tab.icon, label: tab.label };
    });
  }, [visibleWidgets]);

  // Show gender selector if profile doesn't have gender set
  if (!isLoading && profile === null) {
    return <GenderSelector onComplete={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader activeTab={activeTab} />
      
      <SwipeableTabs activeIndex={activeTab} onIndexChange={setActiveTab}>
        {tabContents.map(({ tabId, widgets, icon, label }) => (
          <div key={tabId} className="pb-24 min-h-full">
            {widgets.length > 0 ? (
              widgets.map(({ id, Component }) => (
                <div key={`${tabId}-${id}`} className="mb-3">
                  <Component />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 text-muted-foreground">
                  {icon}
                </div>
                <p className="text-muted-foreground text-sm">
                  Brak widgetów w "{label}"
                </p>
                <p className="text-muted-foreground/60 text-xs mt-1">
                  Włącz je w ustawieniach
                </p>
              </div>
            )}
          </div>
        ))}
      </SwipeableTabs>
      
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default MobileDashboard;