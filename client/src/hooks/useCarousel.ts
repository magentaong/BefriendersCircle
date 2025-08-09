import { useRef, useState } from "react";

// Swipe direction
type Direction = "left" | "right";

// Touch support 
export function useCarousel<T extends { _id?: string }>(
  items: T[], // Items to display
  groupSize: number = 3 // Number of items to show per page
) {
  // Track coursel position for multiple tabs or categories
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});
  
  // Touch gestures for mobile
  const touchStartX = useRef<number | null>(null); // Touch start
  const touchEndX = useRef<number | null>(null); // Touch ended
  const minSwipeDistance = 50; 

  // Current carousel index
  const getIndexForTab = (tab: string): number => carouselIndices[tab] || 0;
  // Update carousel position
  const updateCarouselIndex = (tab: string, newIndex: number) => {
    // Calculate total number of groups needed to display all items
    const maxGroups = Math.max(1, Math.ceil(items.length / groupSize));
    // Wrap around to beginning
    const wrappedIndex = (newIndex + maxGroups) % maxGroups;
    setCarouselIndices((prev) => ({ ...prev, [tab]: wrappedIndex }));
  };

  // Items should be displayed for current page of a tab 
  const getGroupedItems = (tab: string): T[] => {
    const index = getIndexForTab(tab); // Current group index
    // Slice array to items for current page
    return items.slice(index * groupSize, index * groupSize + groupSize);
  };

  // Navigate to previous group (wraparound to last group)
  const scrollLeft = (tab: string) => {
    updateCarouselIndex(tab, getIndexForTab(tab) - 1);
  };

  // Navigate to next group (wraparound to first group)
  const scrollRight = (tab: string) => {
    updateCarouselIndex(tab, getIndexForTab(tab) + 1);
  };

  // Starting position
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  // Update ending position as user moves finger
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  // Ending position, swipe direction and trigger navigation
  const handleTouchEnd = (tab: string) => {
    // Exit early if no start or end 
    if (touchStartX.current == null || touchEndX.current == null) return;
    const distance = touchStartX.current - touchEndX.current;     // Calculate swipe distance 
    // Trigger navigation only if swipe distance exceeds minimum threshold
    if (Math.abs(distance) >= minSwipeDistance) {
      distance > 0 ? scrollRight(tab) : scrollLeft(tab);
    }

    // Reset for next swipe
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Progress percentage for progress bar
  const getProgress = (tab: string): number => {
    const index = getIndexForTab(tab); // Current group index
    const total = Math.max(1, Math.ceil(items.length / groupSize)); // Total number of groups
    return ((index + 1) / total) * 100; // 1-based precentage (currentGroup / totalGroups) * 100
  };

  return {
    getIndexForTab,
    updateCarouselIndex,
    getGroupedItems, // items for current page
    scrollLeft,
    scrollRight,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getProgress,
  };
}
