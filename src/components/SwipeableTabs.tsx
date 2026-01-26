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
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
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
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    startTimeRef.current = Date.now();
    setIsHorizontalSwipe(null); // Reset direction detection
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startXRef.current;
    const diffY = currentY - startYRef.current;

    // Detect direction on first significant movement (threshold: 10px)
    if (isHorizontalSwipe === null) {
      const absX = Math.abs(diffX);
      const absY = Math.abs(diffY);
      
      if (absX > 10 || absY > 10) {
        // If horizontal movement is greater, it's a swipe
        const isHorizontal = absX > absY;
        setIsHorizontalSwipe(isHorizontal);
        
        if (isHorizontal) {
          setIsDragging(true);
        }
      }
      return;
    }

    // If vertical scroll, don't interfere
    if (!isHorizontalSwipe) {
      return;
    }

    // Horizontal swipe - prevent scroll and handle tab change
    e.preventDefault();
    
    // Add resistance at edges
    if ((activeIndex === 0 && diffX > 0) || (activeIndex === totalTabs - 1 && diffX < 0)) {
      setDragOffset(diffX * 0.3);
    } else {
      setDragOffset(diffX);
    }
  }, [isHorizontalSwipe, activeIndex, totalTabs]);

  const handleTouchEnd = useCallback(() => {
    // If it wasn't a horizontal swipe, just reset
    if (!isHorizontalSwipe || !isDragging) {
      setIsDragging(false);
      setDragOffset(0);
      setIsHorizontalSwipe(null);
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
    setIsHorizontalSwipe(null);
    
    if (newIndex !== activeIndex) {
      onIndexChange(newIndex);
    }
  }, [isHorizontalSwipe, isDragging, dragOffset, activeIndex, totalTabs, onIndexChange]);

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
