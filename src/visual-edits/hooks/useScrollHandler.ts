"use client";

import { useCallback } from "react";
import { CHANNEL, type ChildToParent } from "../types/messages";

type Box = null | { top: number; left: number; width: number; height: number };

interface UseScrollHandlerProps {
  isVisualEditModeRef: React.MutableRefObject<boolean>;
  isResizingRef: React.MutableRefObject<boolean>;
  scrollTimeoutRef: React.MutableRefObject<number | null>;
  setIsScrolling: (value: boolean) => void;
  setHoverBox: (box: Box) => void;
  setHoverBoxes: (boxes: Box[]) => void;
  postMessageDedup: (data: ChildToParent) => void;
}

export function useScrollHandler({
  isVisualEditModeRef,
  isResizingRef,
  scrollTimeoutRef,
  setIsScrolling,
  setHoverBox,
  setHoverBoxes,
  postMessageDedup,
}: UseScrollHandlerProps) {
  const handleScroll = useCallback(() => {
    if (isResizingRef.current) return;
    // Only update hover box if visual edit mode is active
    if (!isVisualEditModeRef.current) return;

    // Hide hover boxes while scrolling
    setIsScrolling(true);
    setHoverBox(null);
    setHoverBoxes([]);

    // Notify parent that scrolling has started
    const scrollMsg: ChildToParent = {
      type: CHANNEL,
      msg: "SCROLL_STARTED",
    };
    postMessageDedup(scrollMsg);

    // Reset the notification flag after scrolling stops
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsScrolling(false);
      const scrollStopMsg: ChildToParent = {
        type: CHANNEL,
        msg: "SCROLL_STOPPED",
      };
      postMessageDedup(scrollStopMsg);
    }, 16); // One frame (16ms) for instant restoration
  }, [
    isVisualEditModeRef,
    isResizingRef,
    scrollTimeoutRef,
    setIsScrolling,
    setHoverBox,
    setHoverBoxes,
    postMessageDedup,
  ]);

  return { handleScroll };
}
