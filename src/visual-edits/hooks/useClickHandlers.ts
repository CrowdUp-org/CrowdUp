"use client";

import { useCallback } from "react";
import { CHANNEL, type ChildToParent } from "../types/messages";
import { BOX_PADDING, FOCUSED_ELEMENT_KEY } from "../types/constants";
import { isTextEditable } from "../utils/validation";
import { parseOrchidsId } from "../utils/domHelpers";
import { getCurrentStyles, normalizeImageSrc } from "../utils/normalization";
import {
  protectChildElements,
  restoreChildElements,
  extractDirectTextContent,
} from "../utils/domHelpers";

type Box = null | { top: number; left: number; width: number; height: number };

interface UseClickHandlersProps {
  isVisualEditModeRef: React.MutableRefObject<boolean>;
  isResizingRef: React.MutableRefObject<boolean>;
  lastClickTimeRef: React.MutableRefObject<number>;
  lastHitElementRef: React.MutableRefObject<HTMLElement | null>;
  focusedElementRef: React.MutableRefObject<HTMLElement | null>;
  editingElementRef: React.MutableRefObject<HTMLElement | null>;
  wasEditableRef: React.MutableRefObject<boolean>;
  originalContentRef: React.MutableRefObject<string>;
  originalSrcRef: React.MutableRefObject<string>;
  focusedImageElementRef: React.MutableRefObject<HTMLImageElement | null>;
  pendingCleanupRef: React.MutableRefObject<NodeJS.Timeout | null>;
  appliedStylesRef: React.MutableRefObject<Map<string, Record<string, string>>>;
  originalStylesRef: React.MutableRefObject<Record<string, string>>;
  hasStyleChangesRef: React.MutableRefObject<boolean>;
  focusedElementId: string | null;
  setFocusedElementId: (id: string | null) => void;
  setFocusTag: (tag: string | null) => void;
  setFocusBox: (box: Box) => void;
  setHoverBox: (box: Box) => void;
  setHoverBoxes: (boxes: Box[]) => void;
  setHoverTag: (tag: string | null) => void;
  flushImageSrcChange: () => void;
  handleStyleBlur: (element: HTMLElement) => void;
  handleTextChange: (element: HTMLElement) => void;
  cleanupEditingElement: () => void;
  postMessageDedup: (data: ChildToParent) => void;
}

const expandBox = (rect: DOMRect): Box => ({
  top: rect.top - BOX_PADDING,
  left: rect.left - BOX_PADDING,
  width: rect.width + BOX_PADDING * 2,
  height: rect.height + BOX_PADDING * 2,
});

export function useClickHandlers({
  isVisualEditModeRef,
  isResizingRef,
  lastClickTimeRef,
  lastHitElementRef,
  focusedElementRef,
  editingElementRef,
  wasEditableRef,
  originalContentRef,
  originalSrcRef,
  focusedImageElementRef,
  pendingCleanupRef,
  appliedStylesRef,
  originalStylesRef,
  hasStyleChangesRef,
  focusedElementId,
  setFocusedElementId,
  setFocusTag,
  setFocusBox,
  setHoverBox,
  setHoverBoxes,
  setHoverTag,
  flushImageSrcChange,
  handleStyleBlur,
  handleTextChange,
  cleanupEditingElement,
  postMessageDedup,
}: UseClickHandlersProps) {
  const handleMouseDownCapture = useCallback(
    (e: MouseEvent) => {
      if (isResizingRef.current) return;
      if (!isVisualEditModeRef.current) return;

      const hit = (e.target as HTMLElement)?.closest<HTMLElement>(
        "[data-orchids-id]",
      );

      if (hit && isTextEditable(hit)) {
        wasEditableRef.current = hit.contentEditable === "true";

        if (!wasEditableRef.current) {
          const currentStyle = hit.getAttribute("style") || "";
          hit.setAttribute(
            "style",
            `${currentStyle}; outline: none !important; box-shadow: none !important;`,
          );

          hit.contentEditable = "true";

          if (hit.childElementCount > 0) {
            protectChildElements(hit);
          }
        }
      }
    },
    [isResizingRef, isVisualEditModeRef, wasEditableRef],
  );

  const handleClickCapture = useCallback(
    (e: MouseEvent) => {
      if (isResizingRef.current) return;
      if (!isVisualEditModeRef.current) return;

      const now = Date.now();
      if (now - lastClickTimeRef.current < 100) {
        return;
      }
      lastClickTimeRef.current = now;

      const target = e.target as HTMLElement;
      const hit = target.closest<HTMLElement>("[data-orchids-id]");

      if (hit) {
        const tagName =
          hit.getAttribute("data-orchids-name") || hit.tagName.toLowerCase();

        const hitId = hit.getAttribute("data-orchids-id");
        const isEditable = isTextEditable(hit);

        const isLink = hit.tagName.toLowerCase() === "a" || !!hit.closest("a");
        const isButton =
          hit.tagName.toLowerCase() === "button" ||
          hit.getAttribute("role") === "button";

        if (isLink || isButton || !isEditable) {
          e.preventDefault();
          e.stopPropagation();
        }

        const prevFocused = focusedElementRef.current;

        focusedElementRef.current = hit;
        setFocusedElementId(hitId);
        setFocusTag(tagName);

        if (hitId && typeof window !== "undefined") {
          const focusedElementData = {
            id: hitId,
            tag: tagName,
          };
          localStorage.setItem(
            FOCUSED_ELEMENT_KEY,
            JSON.stringify(focusedElementData),
          );
        }

        const allMatchingElements = document.querySelectorAll(
          `[data-orchids-id="${hitId}"]`,
        ) as NodeListOf<HTMLElement>;

        const boxes: Box[] = [];
        allMatchingElements.forEach((element) => {
          if (element === hit) {
            return;
          }

          const rect = element.getBoundingClientRect();
          boxes.push(expandBox(rect));
        });

        setHoverBoxes(boxes);
        if (boxes.length > 0) {
          setHoverTag(tagName);
        }

        if (hit.tagName.toLowerCase() === "img") {
          focusedImageElementRef.current = hit as HTMLImageElement;
        } else {
          focusedImageElementRef.current = null;
        }

        originalStylesRef.current = getCurrentStyles(hit);

        if (isEditable) {
          if (pendingCleanupRef.current) {
            clearTimeout(pendingCleanupRef.current);
            pendingCleanupRef.current = null;
          }

          if (editingElementRef.current && editingElementRef.current !== hit) {
            editingElementRef.current.blur();
            cleanupEditingElement();
          }

          if (hit !== editingElementRef.current) {
            editingElementRef.current = hit;
            if (hit.childElementCount > 0) {
              originalContentRef.current = extractDirectTextContent(hit);
            } else {
              originalContentRef.current =
                hit.innerText || hit.textContent || "";
            }

            const createHandlers = (element: HTMLElement) => {
              const handleFocus = () => {
                if (element !== editingElementRef.current) return;

                handleStyleBlur(element);

                if (element.childElementCount > 0) {
                  originalContentRef.current =
                    extractDirectTextContent(element);
                } else {
                  originalContentRef.current =
                    element.innerText || element.textContent || "";
                }

                hasStyleChangesRef.current = false;
              };

              const handleBlur = () => {
                if (element !== editingElementRef.current) return;

                handleStyleBlur(element);
                handleTextChange(element);
              };

              const handleInput = () => {
                if (element !== editingElementRef.current) return;
              };

              return { handleFocus, handleBlur, handleInput };
            };

            const handlers = createHandlers(hit);
            hit.addEventListener("focus", handlers.handleFocus);
            hit.addEventListener("blur", handlers.handleBlur);
            hit.addEventListener("input", handlers.handleInput);

            (hit as any)._editHandlers = {
              focus: handlers.handleFocus,
              blur: handlers.handleBlur,
              input: handlers.handleInput,
            };
          }
        }

        const r = hit.getBoundingClientRect();
        const expandedBox = expandBox(r);
        setFocusBox(expandedBox);

        setHoverBox(null);

        const className = hit.getAttribute("class") || "";

        const srcRaw =
          hit.tagName.toLowerCase() === "img"
            ? (hit as HTMLImageElement).src
            : undefined;

        if (srcRaw) {
          originalSrcRef.current = normalizeImageSrc(srcRaw);
        }

        const computedStyles = getCurrentStyles(hit);

        const msg: ChildToParent = {
          type: CHANNEL,
          msg: "ELEMENT_CLICKED",
          id: hitId,
          tag: tagName,
          rect: expandedBox
            ? {
                top: expandedBox.top,
                left: expandedBox.left,
                width: expandedBox.width,
                height: expandedBox.height,
              }
            : {
                top: 0,
                left: 0,
                width: 0,
                height: 0,
              },
          clickPosition: {
            x: e.clientX,
            y: e.clientY,
          },
          isEditable,
          currentStyles: computedStyles,
          className,
          src: srcRaw,
        };

        postMessageDedup(msg);

        setTimeout(() => {
          flushImageSrcChange();

          if (prevFocused && prevFocused !== hit) {
            handleStyleBlur(prevFocused);
          }

          if (editingElementRef.current && editingElementRef.current !== hit) {
            cleanupEditingElement();
          }
        }, 0);
      } else {
        if (focusedElementRef.current) {
          flushImageSrcChange();
          handleStyleBlur(focusedElementRef.current);
          cleanupEditingElement();

          focusedElementRef.current = null;
          setFocusedElementId(null);
          setFocusTag(null);
          setFocusBox(null);
          setHoverBox(null);
          setHoverBoxes([]);
          setHoverTag(null);

          if (typeof window !== "undefined") {
            localStorage.removeItem(FOCUSED_ELEMENT_KEY);
          }

          const msg: ChildToParent = {
            type: CHANNEL,
            msg: "ELEMENT_CLICKED",
            id: null,
            tag: null,
            rect: {
              top: 0,
              left: 0,
              width: 0,
              height: 0,
            },
            clickPosition: {
              x: e.clientX,
              y: e.clientY,
            },
            isEditable: false,
            currentStyles: {},
            className: "",
          };
          postMessageDedup(msg);
        }
      }
    },
    [
      isResizingRef,
      isVisualEditModeRef,
      lastClickTimeRef,
      focusedElementRef,
      editingElementRef,
      originalContentRef,
      originalSrcRef,
      focusedImageElementRef,
      pendingCleanupRef,
      originalStylesRef,
      hasStyleChangesRef,
      setFocusedElementId,
      setFocusTag,
      setFocusBox,
      setHoverBox,
      setHoverBoxes,
      setHoverTag,
      flushImageSrcChange,
      handleStyleBlur,
      handleTextChange,
      cleanupEditingElement,
      postMessageDedup,
    ],
  );

  return { handleMouseDownCapture, handleClickCapture };
}
