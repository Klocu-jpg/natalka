import { ReactNode, useRef, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { cn } from "@/lib/utils";

interface SwipeableTabsProps {
  activeIndex: number;
  onIndexChange: (index: number) => void;
  children: ReactNode[];
}

const SwipeableTabs = ({ activeIndex, onIndexChange, children }: SwipeableTabsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const totalTabs = children.length;

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (activeIndex < totalTabs - 1) {
        onIndexChange(activeIndex + 1);
      }
    },
    onSwipedRight: () => {
      if (activeIndex > 0) {
        onIndexChange(activeIndex - 1);
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 50,
    preventScrollOnSwipe: true,
  });

  return (
    <div className="relative overflow-hidden flex-1" {...handlers}>
      <div
        ref={containerRef}
        className="flex transition-transform duration-300 ease-out h-full"
        style={{
          transform: `translateX(-${activeIndex * 100}%)`,
          width: `${totalTabs * 100}%`,
        }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className={cn(
              "h-full overflow-y-auto scroll-smooth-mobile scrollbar-hide",
              "px-3 sm:px-4 py-4"
            )}
            style={{ width: `${100 / totalTabs}%` }}
          >
            {child}
          </div>
        ))}
      </div>
      
      {/* Swipe indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {children.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              activeIndex === index
                ? "bg-primary w-4"
                : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default SwipeableTabs;