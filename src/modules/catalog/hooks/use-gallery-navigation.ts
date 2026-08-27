"use client";

import { useCallback, useRef, useState } from "react";

const SWIPE_THRESHOLD = 48;

export function useGalleryNavigation(itemCount: number, initialIndex = 0) {
  const [activeIndex, setActiveIndex] = useState(() => clampIndex(initialIndex, itemCount));
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const safeActiveIndex = clampIndex(activeIndex, itemCount);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) =>
      itemCount > 0 ? (clampIndex(current, itemCount) - 1 + itemCount) % itemCount : 0,
    );
  }, [itemCount]);

  const showNext = useCallback(() => {
    setActiveIndex((current) =>
      itemCount > 0 ? (clampIndex(current, itemCount) + 1) % itemCount : 0,
    );
  }, [itemCount]);

  const handleTouchStart = useCallback((clientX: number) => {
    touchStartX.current = clientX;
    didSwipe.current = false;
  }, []);

  const handleTouchEnd = useCallback(
    (clientX: number) => {
      if (touchStartX.current === null) return;
      const distance = clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(distance) < SWIPE_THRESHOLD) return;
      didSwipe.current = true;
      if (distance > 0) showPrevious();
      else showNext();
    },
    [showNext, showPrevious],
  );

  const shouldIgnoreClick = useCallback(() => {
    const ignore = didSwipe.current;
    didSwipe.current = false;
    return ignore;
  }, []);

  return {
    activeIndex: safeActiveIndex,
    setActiveIndex,
    showPrevious,
    showNext,
    handleTouchStart,
    handleTouchEnd,
    shouldIgnoreClick,
  };
}

function clampIndex(index: number, itemCount: number) {
  if (itemCount <= 0) return 0;
  return Math.min(Math.max(index, 0), itemCount - 1);
}
