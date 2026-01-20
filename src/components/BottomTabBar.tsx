import { cn } from "@/lib/utils";
import { TABS } from "@/config/tabs";

interface BottomTabBarProps {
  activeTab: number;
  onTabChange: (index: number) => void;
}

const BottomTabBar = ({ activeTab, onTabChange }: BottomTabBarProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 relative">
        {/* Animated indicator */}
        <div 
          className="absolute top-0 h-0.5 bg-primary rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${100 / TABS.length}%`,
            left: `${(activeTab / TABS.length) * 100}%`,
          }}
        />
        
        {TABS.map((tab, index) => {
          const isCenter = index === 2; // Home is in center
          const isActive = activeTab === index;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(index)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 flex-1 h-full",
                "transition-all duration-200 active:scale-95",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "transition-all duration-200",
                  isActive && "scale-110",
                  isCenter && !isActive && "opacity-70"
                )}
              >
                {tab.icon}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200",
                isActive && "font-semibold"
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