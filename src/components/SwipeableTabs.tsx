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
  const directionLockedRef = useRef<"horizontal" | "vertical" | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const prevIndexRef = useRef(activeIndex);

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
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    startTimeRef.current = Date.now();
    directionLockedRef.current = null;
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startXRef.current;
    const diffY = currentY - startYRef.current;

    // Lock direction on first significant movement (threshold: 6px)
    if (directionLockedRef.current === null) {
      const absX = Math.abs(diffX);
      const absY = Math.abs(diffY);
      
      if (absX < 6 && absY < 6) return; // Not enough movement yet

      // Use a stricter ratio: horizontal only if absX > absY * 1.5
      if (absX > absY * 1.5) {
        directionLockedRef.current = "horizontal";
        setIsDragging(true);
      } else {
        directionLockedRef.current = "vertical";
      }
      return;
    }

    // Once locked vertical, never switch
    if (directionLockedRef.current === "vertical") {
      return;
    }

    // Horizontal swipe - prevent any vertical scroll
    e.preventDefault();
    e.stopPropagation();
    
    // Add resistance at edges
    if ((activeIndex === 0 && diffX > 0) || (activeIndex === totalTabs - 1 && diffX < 0)) {
      setDragOffset(diffX * 0.25);
    } else {
      setDragOffset(diffX);
    }
  }, [activeIndex, totalTabs]);

  const handleTouchEnd = useCallback(() => {
    if (directionLockedRef.current !== "horizontal" || !isDragging) {
      setIsDragging(false);
      setDragOffset(0);
      directionLockedRef.current = null;
      return;
    }
    
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
    directionLockedRef.current = null;
    
    if (newIndex !== activeIndex) {
      onIndexChange(newIndex);
    }
  }, [isDragging, dragOffset, activeIndex, totalTabs, onIndexChange]);

  // Always scroll to top when activeIndex changes (swipe or bottom tab)
  useEffect(() => {
    if (prevIndexRef.current !== activeIndex) {
      const tabElements = containerRef.current?.querySelectorAll<HTMLElement>('[data-tab-panel]');
      if (tabElements) {
        // Scroll target tab to top
        tabElements[activeIndex]?.scrollTo({ top: 0 });
      }
      prevIndexRef.current = activeIndex;
    }
  }, [activeIndex]);

  // Calculate transform with drag offset
  const getTransformX = () => {
    if (containerWidth === 0) return 0;
    return -activeIndex * containerWidth + dragOffset;
  };

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden flex-1"
      style={{ touchAction: "none" }}
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
            data-tab-panel
            className="h-full overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-4 shrink-0"
            style={{ 
              width: containerWidth || '100vw',
              WebkitOverflowScrolling: 'touch',
              touchAction: directionLockedRef.current === "horizontal" ? "none" : "pan-y",
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
