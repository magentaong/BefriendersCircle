import { useRef, useState } from "react";

type Direction = "left" | "right";

export function useCarousel<T extends { _id?: string }>(
  items: T[],
  groupSize: number = 3
) {
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const getIndexForTab = (tab: string): number => carouselIndices[tab] || 0;

  const updateCarouselIndex = (tab: string, newIndex: number) => {
    const maxGroups = Math.max(1, Math.ceil(items.length / groupSize));
    const wrappedIndex = (newIndex + maxGroups) % maxGroups;
    setCarouselIndices((prev) => ({ ...prev, [tab]: wrappedIndex }));
  };

  const getGroupedItems = (tab: string): T[] => {
    const index = getIndexForTab(tab);
    return items.slice(index * groupSize, index * groupSize + groupSize);
  };

  const scrollLeft = (tab: string) => {
    updateCarouselIndex(tab, getIndexForTab(tab) - 1);
  };

  const scrollRight = (tab: string) => {
    updateCarouselIndex(tab, getIndexForTab(tab) + 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (tab: string) => {
    if (touchStartX.current == null || touchEndX.current == null) return;
    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) >= minSwipeDistance) {
      distance > 0 ? scrollRight(tab) : scrollLeft(tab);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const getProgress = (tab: string): number => {
    const index = getIndexForTab(tab);
    const total = Math.max(1, Math.ceil(items.length / groupSize));
    return ((index + 1) / total) * 100;
  };

  return {
    getIndexForTab,
    updateCarouselIndex,
    getGroupedItems,
    scrollLeft,
    scrollRight,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getProgress,
  };
}
