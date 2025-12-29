"use client";

import { useCallback } from "react";
import { CHANNEL, type ChildToParent } from "../types/messages";
import { BOX_PADDING } from "../types/constants";
import { parseOrchidsId } from "../utils/domHelpers";

type Box = null | { top: number; left: number; width: number; height: number };

interface UseHoverHandlersProps {
  isVisualEditModeRef: React.MutableRefObject<boolean>;
  isResizingRef: React.MutableRefObject<boolean>;
  lastHitElementRef: React.MutableRefObject<HTMLElement | null>;
  lastHitIdRef: React.MutableRefObject<string | null>;
  isScrolling: boolean;
  focusedElementId: string | null;
  setHoverBox: (box: Box) => void;
  setHoverBoxes: (boxes: Box[]) => void;
  setHoverTag: (tag: string | null) => void;
  flushImageSrcChange: () => void;
  postMessageDedup: (data: ChildToParent) => void;
}

const expandBox = (rect: DOMRect): Box => ({
  top: rect.top - BOX_PADDING,
  left: rect.left - BOX_PADDING,
  width: rect.width + BOX_PADDING * 2,
  height: rect.height + BOX_PADDING * 2,
});

export function useHoverHandlers({
  isVisualEditModeRef,
  isResizingRef,
  lastHitElementRef,
  lastHitIdRef,
  isScrolling,
  focusedElementId,
  setHoverBox,
  setHoverBoxes,
  setHoverTag,
  flushImageSrcChange,
  postMessageDedup,
}: UseHoverHandlersProps) {
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (isResizingRef.current) {
        return;
      }
      // Only track pointer when visual edit mode is active
      if (!isVisualEditModeRef.current) return;

      // Don't show hover boxes while scrolling
      if (isScrolling) return;

      // Hit-testing at pointer position
      const hit =
        document
          .elementFromPoint(e.clientX, e.clientY)
          ?.closest<HTMLElement>("[data-orchids-id]") ?? null;

      if (hit !== lastHitElementRef.current) {
        lastHitElementRef.current = hit;

        if (!hit) {
          setHoverBox(null);
          setHoverBoxes([]);
          setHoverTag(null);
          lastHitIdRef.current = null;
          // If we were previously focused on an image, ensure its src is flushed
          flushImageSrcChange();

          const msg: ChildToParent = {
            type: CHANNEL,
            msg: "HIT",
            id: null,
            tag: null,
            rect: null,
          };
          postMessageDedup(msg);
          return;
        }

        // Don't show hover box if this is the focused element
        const hitId = hit.getAttribute("data-orchids-id");

        // Check if we're already showing boxes for this ID
        if (hitId === lastHitIdRef.current) {
          return;
        }

        lastHitIdRef.current = hitId;

        const tagName =
          hit.getAttribute("data-orchids-name") || hit.tagName.toLowerCase();

        // Update hover boxes immediately for instant feedback
        // Find ALL elements with the same orchids ID
        const allMatchingElements = document.querySelectorAll(
          `[data-orchids-id="${hitId}"]`,
        ) as NodeListOf<HTMLElement>;

        // Create hover boxes for all matching elements except the focused one
        const boxes: Box[] = [];
        allMatchingElements.forEach((element) => {
          // Skip if this element is the focused one
          const elementId = element.getAttribute("data-orchids-id");
          if (elementId === focusedElementId) {
            return;
          }

          const rect = element.getBoundingClientRect();
          boxes.push(expandBox(rect));
        });

        // Set multiple hover boxes
        setHoverBoxes(boxes);

        // Set single hover box for the primary element (for compatibility)
        // Only set if it's not the focused element
        if (hitId !== focusedElementId) {
          const r = hit.getBoundingClientRect();
          const expandedBox = expandBox(r);
          setHoverBox(expandedBox);
        } else {
          setHoverBox(null);
        }

        setHoverTag(tagName);

        const msg: ChildToParent = {
          type: CHANNEL,
          msg: "HIT",
          id: hitId,
          tag: tagName,
          rect:
            hitId !== focusedElementId
              ? expandBox(hit.getBoundingClientRect())
              : null,
        };
        postMessageDedup(msg);
      }
    },
    [
      isResizingRef,
      isVisualEditModeRef,
      isScrolling,
      lastHitElementRef,
      lastHitIdRef,
      focusedElementId,
      setHoverBox,
      setHoverBoxes,
      setHoverTag,
      flushImageSrcChange,
      postMessageDedup,
    ],
  );

  const handlePointerLeave = useCallback(() => {
    if (!isVisualEditModeRef.current) return;

    if (isResizingRef.current) return;

    setHoverBox(null);
    setHoverBoxes([]);
    setHoverTag(null);

    // Flush image src change when cursor leaves iframe altogether
    flushImageSrcChange();

    lastHitElementRef.current = null;
    lastHitIdRef.current = null;
    const msg: ChildToParent = {
      type: CHANNEL,
      msg: "HIT",
      id: null,
      tag: null,
      rect: null,
    };
    postMessageDedup(msg);
  }, [
    isVisualEditModeRef,
    isResizingRef,
    lastHitElementRef,
    lastHitIdRef,
    setHoverBox,
    setHoverBoxes,
    setHoverTag,
    flushImageSrcChange,
    postMessageDedup,
  ]);

  return { handlePointerMove, handlePointerLeave };
}
