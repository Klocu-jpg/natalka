import { cn } from "@/lib/utils";
import { TABS } from "@/config/tabs";

interface BottomTabBarProps {
  activeTab: number;
  onTabChange: (index: number) => void;
}

const BottomTabBar = ({ activeTab, onTabChange }: BottomTabBarProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/98 backdrop-blur-xl border-t border-border/30 pb-safe shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around h-[68px] relative max-w-lg mx-auto">
        {/* Animated pill indicator */}
        <div 
          className="absolute top-1.5 h-1 bg-gradient-to-r from-primary to-coral rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${Math.min(100 / TABS.length - 4, 12)}%`,
            left: `${(activeTab / TABS.length) * 100 + (100 / TABS.length - 12) / 2}%`,
          }}
        />
        
        {TABS.map((tab, index) => {
          const isActive = activeTab === index;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(index)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
                "transition-all duration-200 active:scale-95",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "relative p-2 rounded-xl transition-all duration-200",
                  isActive && "bg-primary/10 scale-110"
                )}
              >
                {tab.icon}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200",
                isActive ? "font-semibold text-primary" : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;