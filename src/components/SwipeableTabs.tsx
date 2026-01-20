import { useRef, useState, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SwipeableTabsProps {
  activeIndex: number;
  onIndexChange: (index: number) => void;
  children: ReactNode;
}

const SwipeableTabs = ({ activeIndex, onIndexChange, children }: SwipeableTabsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);

  const tabs = (Array.isArray(children) ? children : [children]).flat();
  const totalTabs = tabs.length;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    startTimeRef.current = Date.now();
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;

    // Keep the gesture feeling like a horizontal swipe (prevents accidental vertical scroll)
    e.preventDefault();
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    
    // Add resistance at edges
    if ((activeIndex === 0 && diff > 0) || (activeIndex === totalTabs - 1 && diff < 0)) {
      setDragOffset(diff * 0.3);
    } else {
      setDragOffset(diff);
    }
  }, [isDragging, activeIndex, totalTabs]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    const velocity = dragOffset / (Date.now() - startTimeRef.current);
    const threshold = 50;
    const velocityThreshold = 0.3;
    
    let newIndex = activeIndex;
    
    if (Math.abs(dragOffset) > threshold || Math.abs(velocity) > velocityThreshold) {
      if (dragOffset > 0 && activeIndex > 0) {
        newIndex = activeIndex - 1;
      } else if (dragOffset < 0 && activeIndex < totalTabs - 1) {
        newIndex = activeIndex + 1;
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
    
    if (newIndex !== activeIndex) {
      onIndexChange(newIndex);
    }
  }, [isDragging, dragOffset, activeIndex, totalTabs, onIndexChange]);

  // Calculate transform with drag offset
  const getTransform = () => {
    const baseOffset = -activeIndex * 100;
    const dragPercent = containerRef.current 
      ? (dragOffset / containerRef.current.offsetWidth) * 100 
      : 0;
    return `translateX(${baseOffset + dragPercent}%)`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden flex-1 touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={cn(
          "flex h-full will-change-transform",
          !isDragging && "transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
        )}
        style={{
          transform: getTransform(),
          width: `${totalTabs * 100}%`,
        }}
      >
        {tabs.map((child, index) => (
          <div
            key={index}
            className="h-full overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-4"
            style={{ 
              width: `${100 / totalTabs}%`,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwipeableTabs;