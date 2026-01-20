import { cn } from "@/lib/utils";
import { TABS } from "@/config/tabs";

interface BottomTabBarProps {
  activeTab: number;
  onTabChange: (index: number) => void;
}

const BottomTabBar = ({ activeTab, onTabChange }: BottomTabBarProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(index)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
              "active:scale-95 transition-transform",
              activeTab === index
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "transition-transform",
                activeTab === index && "scale-110"
              )}
            >
              {tab.icon}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
            
            {/* Active indicator */}
            {activeTab === index && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomTabBar;