import { useRef, useState, useCallback, useEffect, ReactNode } from "react";
import React from "react";
import { cn } from "@/lib/utils";

interface SwipeableTabsProps {
  activeIndex: number;
  onIndexChange: (index: number) => void;
  children: ReactNode;
}

const SwipeableTabs = ({ activeIndex, onIndexChange, children }: SwipeableTabsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);

  const tabs = React.Children.toArray(children);
  const totalTabs = tabs.length;

  // Measure container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    startTimeRef.current = Date.now();
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;

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
    
    const elapsed = Date.now() - startTimeRef.current;
    const velocity = elapsed > 0 ? dragOffset / elapsed : 0;
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
  const getTransformX = () => {
    if (containerWidth === 0) return 0;
    return -activeIndex * containerWidth + dragOffset;
  };

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden flex-1"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={cn(
          "flex h-full will-change-transform",
          !isDragging && "transition-transform duration-300 ease-out"
        )}
        style={{
          transform: `translateX(${getTransformX()}px)`,
        }}
      >
        {tabs.map((child, index) => (
          <div
            key={index}
            className="h-full overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-4 shrink-0"
            style={{ 
              width: containerWidth || '100vw',
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
