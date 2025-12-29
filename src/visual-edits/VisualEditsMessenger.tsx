/* eslint-disable */
"use client";

import { useEffect, useState, useRef } from "react";
import {
  CHANNEL,
  type ParentToChild,
  type ChildToParent,
} from "./types/messages";
import {
  BOX_PADDING,
  VISUAL_EDIT_MODE_KEY,
  FOCUSED_ELEMENT_KEY,
} from "./types/constants";
import {
  validateAndNormalizeImageSrc,
  isTextEditable,
} from "./utils/validation";
import { normalizeImageSrc, getCurrentStyles } from "./utils/normalization";
import {
  protectChildElements,
  restoreChildElements,
  extractDirectTextContent,
  parseOrchidsId,
  wrapMultiline,
} from "./utils/domHelpers";
import HoverOverlay from "./components/HoverOverlay";
import FocusOverlay from "./components/FocusOverlay";
import { useVisualEditMode } from "./hooks/useVisualEditMode";
import { useFocusBox } from "./hooks/useFocusBox";
import { useHoverBox } from "./hooks/useHoverBox";
import { useResizeState } from "./hooks/useResizeState";
import { useHoverHandlers } from "./hooks/useHoverHandlers";
import { useScrollHandler } from "./hooks/useScrollHandler";
import { useClickHandlers } from "./hooks/useClickHandlers";
import { useEditHandlers } from "./hooks/useEditHandlers";
import { useResizeHandlers } from "./hooks/useResizeHandlers";
import { useMessageHandler } from "./hooks/useMessageHandler";

type Box = null | { top: number; left: number; width: number; height: number };

// Deduplicate helper for high-frequency traffic (HIT / FOCUS_MOVED / SCROLL)
// -----------------------------------------------------------------------------
let _orchidsLastMsg = "";
const postMessageDedup = (data: any) => {
  try {
    const key = JSON.stringify(data);
    if (key === _orchidsLastMsg) return; // identical – drop
    _orchidsLastMsg = key;
  } catch {
    // if stringify fails, fall through
  }
  window.parent.postMessage(data, "*");
};

export default function HoverReceiver() {
  const {
    isActive: isVisualEditMode,
    setIsActive: setIsVisualEditMode,
    isActiveRef: isVisualEditModeRef,
  } = useVisualEditMode();
  const {
    focusBox,
    focusedElementId,
    focusTag,
    setFocusBox,
    setFocusedElementId,
    setFocusTag,
  } = useFocusBox();
  const {
    hoverBox,
    hoverBoxes,
    hoverTag,
    setHoverBox,
    setHoverBoxes,
    setHoverTag,
  } = useHoverBox();
  const {
    isResizing,
    resizeHandle,
    resizeStart,
    setIsResizing,
    setResizeHandle,
    setResizeStart,
  } = useResizeState();
  const [isScrolling, setIsScrolling] = useState(false);
  const isResizingRef = useRef(false);
  const lastHitElementRef = useRef<HTMLElement | null>(null);
  const lastHitIdRef = useRef<string | null>(null);
  const focusedElementRef = useRef<HTMLElement | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const originalContentRef = useRef<string>("");
  const originalSrcRef = useRef<string>(""); // track original img src
  const focusedImageElementRef = useRef<HTMLImageElement | null>(null); // track the actual img element
  const editingElementRef = useRef<HTMLElement | null>(null);
  const wasEditableRef = useRef<boolean>(false);
  const styleElementRef = useRef<HTMLStyleElement | null>(null);
  const originalStylesRef = useRef<Record<string, string>>({});
  const appliedStylesRef = useRef<Map<string, Record<string, string>>>(
    new Map(),
  );
  const hasStyleChangesRef = useRef<boolean>(false);
  const lastClickTimeRef = useRef<number>(0);
  const pendingCleanupRef = useRef<NodeJS.Timeout | null>(null);

  // Cache of loaded fonts
  const loadedFontFamilies = useRef<Set<string>>(new Set());
  // Map of elementId that already has a persistent font set
  const persistentFontMap = useRef<Map<string, string>>(new Map());
  // Timeout refs for clearing persistent font map
  const persistentFontTimeouts = useRef<Map<string, number>>(new Map());

  // Scroll handler hook - extracts scroll event logic
  const { handleScroll } = useScrollHandler({
    isVisualEditModeRef,
    isResizingRef,
    scrollTimeoutRef,
    setIsScrolling,
    setHoverBox,
    setHoverBoxes,
    postMessageDedup,
  });

  // Edit handlers hook - extracts text and style change logic
  const {
    handleTextChange,
    handleStyleChange,
    handleStyleBlur,
    cleanupEditingElement,
  } = useEditHandlers({
    editingElementRef,
    wasEditableRef,
    originalContentRef,
    appliedStylesRef,
    hasStyleChangesRef,
    postMessageDedup,
  });

  // Flush image src updates on blur/focus change
  const flushImageSrcChange = () => {
    // Use the stored image element reference if available
    const imgElement = focusedImageElementRef.current;
    if (!imgElement) return;

    const orchidsId = imgElement.getAttribute("data-orchids-id");
    if (!orchidsId) return;

    const parsed = parseOrchidsId(orchidsId);
    if (!parsed) return;

    const newSrc = normalizeImageSrc(imgElement.src);
    const oldSrc = normalizeImageSrc(originalSrcRef.current);

    if (!newSrc || newSrc === oldSrc) return; // nothing changed

    const msg: ChildToParent = {
      type: CHANNEL,
      msg: "IMAGE_BLUR",
      id: orchidsId,
      oldSrc,
      newSrc,
      filePath: parsed.filePath,
      line: parsed.line,
      column: parsed.column,
    };

    postMessageDedup(msg);

    originalSrcRef.current = newSrc; // reset baseline
    focusedImageElementRef.current = null; // clear reference
  };

  // Hover handlers hook - extracts pointer move/leave logic
  const { handlePointerMove, handlePointerLeave } = useHoverHandlers({
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
  });

  // Click handlers hook - extracts mouse down and click capture logic
  const { handleMouseDownCapture, handleClickCapture } = useClickHandlers({
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
  });

  // Resize handlers hook - extracts resize start logic and mousemove/mouseup listeners
  const { handleResizeStart } = useResizeHandlers({
    isResizing,
    resizeHandle,
    resizeStart,
    focusedElementId,
    focusedElementRef,
    isResizingRef,
    hoverBox,
    setIsResizing,
    setResizeHandle,
    setResizeStart,
    setHoverBox,
  });

  // On mount, notify parent if visual edit mode was restored from localStorage
  useEffect(() => {
    if (isVisualEditMode) {
      // Send acknowledgement to parent that visual edit mode is active
      // This will sync the parent's state with our restored state
      window.parent.postMessage(
        { type: CHANNEL, msg: "VISUAL_EDIT_MODE_ACK", active: true },
        "*",
      );

      // Also send a special message to indicate this was restored from localStorage
      window.parent.postMessage(
        { type: CHANNEL, msg: "VISUAL_EDIT_MODE_RESTORED", active: true },
        "*",
      );

      // Restore focused element after a short delay to ensure DOM is ready
      setTimeout(() => {
        if (typeof window !== "undefined") {
          // Restore focused element
          const focusedData = localStorage.getItem(FOCUSED_ELEMENT_KEY);
          if (focusedData) {
            try {
              const { id } = JSON.parse(focusedData);
              const element = document.querySelector(
                `[data-orchids-id="${id}"]`,
              ) as HTMLElement;

              if (element) {
                // Simulate a click on the element to restore focus
                const rect = element.getBoundingClientRect();
                const clickEvent = new MouseEvent("click", {
                  clientX: rect.left + rect.width / 2,
                  clientY: rect.top + rect.height / 2,
                  bubbles: true,
                  cancelable: true,
                });
                element.dispatchEvent(clickEvent);
              }
            } catch {
              // Ignore parsing errors
            }
          }
        }
      }, 500); // Wait 500ms for DOM to be fully ready
    }
  }, []); // Run only on mount

  // Helper function to expand box dimensions
  const expandBox = (rect: DOMRect): Box => ({
    top: rect.top - BOX_PADDING,
    left: rect.left - BOX_PADDING,
    width: rect.width + BOX_PADDING * 2,
    height: rect.height + BOX_PADDING * 2,
  });

  // Helper to update focus box position
  const updateFocusBox = () => {
    if (focusedElementRef.current) {
      const r = focusedElementRef.current.getBoundingClientRect();
      setFocusBox(expandBox(r));
    }
  };

  // Add global styles for contentEditable elements
  useEffect(() => {
    if (isVisualEditMode && !styleElementRef.current) {
      const style = document.createElement("style");
      style.textContent = `
        [contenteditable="true"]:focus {
          outline: none !important;
          box-shadow: none !important;
          border-color: inherit !important;
        }
        [contenteditable="true"] {
          cursor: text !important;
        }
        /* Prevent the default blue highlight on contenteditable */
        [contenteditable="true"]::selection {
          background-color: rgba(59, 130, 246, 0.3);
        }
        [contenteditable="true"]::-moz-selection {
          background-color: rgba(59, 130, 246, 0.3);
        }
        /* Prevent child elements from being editable */
        [contenteditable="true"] [contenteditable="false"] {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          opacity: 0.7 !important;
          cursor: default !important;
        }
        /* Ensure protected elements can't be selected */
        [data-orchids-protected="true"] {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }
      `;
      document.head.appendChild(style);
      styleElementRef.current = style;
    } else if (!isVisualEditMode && styleElementRef.current) {
      styleElementRef.current.remove();
      styleElementRef.current = null;
    }

    return () => {
      if (styleElementRef.current) {
        styleElementRef.current.remove();
        styleElementRef.current = null;
      }
    };
  }, [isVisualEditMode]);

  // Helper to make only text nodes editable and protect child elements
  const protectChildElements = (element: HTMLElement) => {
    // Make all child elements non-editable
    const childElements = element.querySelectorAll("*");
    childElements.forEach((child) => {
      const childEl = child as HTMLElement;
      childEl.contentEditable = "false";
      // Add a data attribute to mark protected elements
      childEl.setAttribute("data-orchids-protected", "true");
      // Only prevent text selection within the child elements when parent is being edited
      // But still allow pointer events for hovering and clicking
      childEl.style.userSelect = "none";
      childEl.style.webkitUserSelect = "none";
      // Don't set pointerEvents to none - we want to allow hover and click
    });
  };

  // Helper to restore child elements after editing
  const restoreChildElements = (element: HTMLElement) => {
    const protectedElements = element.querySelectorAll(
      '[data-orchids-protected="true"]',
    );
    protectedElements.forEach((child) => {
      const childEl = child as HTMLElement;
      childEl.removeAttribute("contenteditable");
      childEl.removeAttribute("data-orchids-protected");
      // Restore original styles
      childEl.style.userSelect = "";
      childEl.style.webkitUserSelect = "";
    });
  };

  // Handle style changes and send to parent

  // Listen for style and image updates from parent
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "ORCHIDS_STYLE_UPDATE") {
        const { elementId, styles } = e.data;

        // Find ALL elements with the same orchids ID
        const allMatchingElements = document.querySelectorAll(
          `[data-orchids-id="${elementId}"]`,
        ) as NodeListOf<HTMLElement>;

        if (allMatchingElements.length > 0) {
          // If fontFamily is present ensure stylesheet loaded first
          const fam = styles.fontFamily || styles["fontFamily"];
          if (fam) {
            const familyKey = fam.replace(/['\s]+/g, "+");
            if (!loadedFontFamilies.current.has(familyKey)) {
              const link = document.createElement("link");
              link.rel = "stylesheet";
              link.href = `https://fonts.googleapis.com/css2?family=${familyKey}:wght@400&display=swap`;
              document.head.appendChild(link);
              loadedFontFamilies.current.add(familyKey);
            }
          }

          // If fontFamily made persistent via style update, remember so previews don't override
          if (fam) {
            persistentFontMap.current.set(elementId, fam);

            // Clear any existing timeout
            const existingTimeout =
              persistentFontTimeouts.current.get(elementId);
            if (existingTimeout) {
              clearTimeout(existingTimeout);
            }

            // Set timeout to clear persistent font after 2 seconds, allowing previews again
            const timeoutId = window.setTimeout(() => {
              persistentFontMap.current.delete(elementId);
              persistentFontTimeouts.current.delete(elementId);
            }, 2000);

            persistentFontTimeouts.current.set(elementId, timeoutId);
          }

          // Apply styles to ALL matching elements
          allMatchingElements.forEach((element) => {
            // Only update handleStyleChange for the focused element to track changes
            if (focusedElementRef.current === element) {
              handleStyleChange(element, styles);
            } else {
              // For other elements, apply styles directly
              Object.entries(styles).forEach(([property, value]) => {
                const cssProp = property
                  .replace(/([A-Z])/g, "-$1")
                  .toLowerCase();

                // Handle special cases for default values
                let finalValue = String(value);

                // If backgroundColor is being set to transparent, use transparent keyword
                if (
                  property === "backgroundColor" &&
                  (value === "transparent" ||
                    value === "rgba(0, 0, 0, 0)" ||
                    value === "rgb(0, 0, 0, 0)")
                ) {
                  finalValue = "transparent";
                }

                // If removing styles (setting to default), remove the property
                if (
                  (property === "backgroundColor" &&
                    finalValue === "transparent") ||
                  (property === "backgroundImage" && value === "none") ||
                  (property === "textDecoration" && value === "none") ||
                  (property === "fontStyle" && value === "normal") ||
                  (property === "opacity" && value === "1") ||
                  ((property.includes("padding") ||
                    property.includes("margin")) &&
                    value === "0") ||
                  (property === "borderRadius" && value === "0") ||
                  (property === "letterSpacing" && value === "normal") ||
                  (property === "gap" && value === "normal")
                ) {
                  // Remove the property to let the stylesheet value show through
                  element.style.removeProperty(cssProp);
                } else {
                  element.style.setProperty(cssProp, finalValue, "important");
                }
              });
            }
          });
        }
      } else if (e.data?.type === "ORCHIDS_IMAGE_UPDATE") {
        const { elementId, src, oldSrc } = e.data;
        let element: HTMLImageElement | null = null;
        const candidates = document.querySelectorAll(
          `[data-orchids-id="${elementId}"]`,
        );
        candidates.forEach((el) => {
          if (el.tagName.toLowerCase() === "img") {
            const img = el as HTMLImageElement;
            const norm = normalizeImageSrc(img.src);
            if (!element) element = img; // first fallback
            if (oldSrc && normalizeImageSrc(oldSrc) === norm) {
              element = img;
            }
          }
        });

        if (!element) return;

        if ((element as HTMLElement).tagName.toLowerCase() === "img") {
          const imgEl = element as HTMLImageElement;

          {
            /*
             * Clear any existing responsive sources so the newly uploaded image
             * always displays.  Some frameworks (e.g. Next.js) add a `srcset`
             * attribute which can override `src` in certain viewport/device
             * scenarios, so we strip it out before setting the new source.
             */
            imgEl.removeAttribute("srcset");
            imgEl.srcset = "";

            // Validate and sanitize the src value using custom validation
            // Treat empty or whitespace-only values as unsafe right away.
            if (!src || !src.trim()) {
              console.warn("Blocked empty image src");
            } else {
              // Validate and normalize using custom security check
              const normalizedSrc = validateAndNormalizeImageSrc(src);

              if (normalizedSrc) {
                imgEl.src = normalizedSrc;

                // Update baseline src so flush doesn't treat this as pending change
                originalSrcRef.current = normalizeImageSrc(normalizedSrc);
                focusedImageElementRef.current = imgEl;

                imgEl.onload = () => updateFocusBox();
              } else {
                // Unsafe src provided - skip or optionally assign a safe placeholder
                console.warn("Blocked unsafe image src:", src);
              }
            }
          }
        }
      } else if (e.data?.type === "RESIZE_ELEMENT") {
        const { elementId, width, height } = e.data;
        const element = document.querySelector(
          `[data-orchids-id="${elementId}"]`,
        ) as HTMLElement;

        if (element && focusedElementRef.current === element) {
          // Apply temporary resize styles
          element.style.setProperty("width", `${width}px`, "important");
          element.style.setProperty("height", `${height}px`, "important");

          // Update focus box
          updateFocusBox();
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Prevent all navigation in visual edit mode
  useEffect(() => {
    if (!isVisualEditMode) return;

    // Prevent link clicks
    const preventLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link && !link.isContentEditable) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Prevent form submissions
    const preventFormSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Add listeners in capture phase to catch events early
    document.addEventListener("click", preventLinkClick, true);
    document.addEventListener("submit", preventFormSubmit, true);

    return () => {
      document.removeEventListener("click", preventLinkClick, true);
      document.removeEventListener("submit", preventFormSubmit, true);
    };
  }, [isVisualEditMode]);

  // Clean up when exiting visual edit mode
  useEffect(() => {
    if (!isVisualEditMode) {
      cleanupEditingElement();
      // Clear applied styles tracking
      appliedStylesRef.current.clear();
      hasStyleChangesRef.current = false;

      // Clear image element reference
      focusedImageElementRef.current = null;
    }
  }, [isVisualEditMode]);

  // Update focus box position when scrolling or resizing
  useEffect(() => {
    if (focusedElementRef.current) {
      const handleUpdate = () => {
        updateFocusBox();

        if (focusedElementRef.current && focusedElementId) {
          const fr = focusedElementRef.current.getBoundingClientRect();
          const fBox = expandBox(fr);
          if (fBox) {
            const focMsg: ChildToParent = {
              type: CHANNEL,
              msg: "FOCUS_MOVED",
              id: focusedElementId,
              rect: {
                top: fBox.top,
                left: fBox.left,
                width: fBox.width,
                height: fBox.height,
              },
            };
            postMessageDedup(focMsg);
          }
        }
      };

      window.addEventListener("scroll", handleUpdate, true);
      window.addEventListener("resize", handleUpdate);

      // Also observe the focused element for size changes
      const resizeObserver = new ResizeObserver(handleUpdate);
      resizeObserver.observe(focusedElementRef.current);

      return () => {
        window.removeEventListener("scroll", handleUpdate, true);
        window.removeEventListener("resize", handleUpdate);
        resizeObserver.disconnect();
      };
    }
  }, [focusedElementId]);

  // Scroll event listener setup
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [handleScroll, scrollTimeoutRef]);

  // Pointer event listeners setup
  useEffect(() => {
    document.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [handlePointerMove, handlePointerLeave]);

  // Click event listeners setup
  useEffect(() => {
    document.addEventListener("mousedown", handleMouseDownCapture, {
      capture: true,
    });
    document.addEventListener("click", handleClickCapture, { capture: true });
    return () => {
      document.removeEventListener("mousedown", handleMouseDownCapture, true);
      document.removeEventListener("click", handleClickCapture, true);
    };
  }, [handleMouseDownCapture, handleClickCapture]);

  // Message handler hook - extracts postMessage event handling
  useMessageHandler({
    focusedElementRef,
    originalSrcRef,
    focusedImageElementRef,
    loadedFontFamilies,
    persistentFontMap,
    persistentFontTimeouts,
    appliedStylesRef,
    setHoverBoxes,
    setHoverTag,
    handleStyleChange,
    postMessageDedup,
  });

  return (
    <>
      <HoverOverlay
        boxes={hoverBoxes}
        isActive={isVisualEditMode && !isResizing}
      />
      <FocusOverlay
        focusBox={focusBox}
        focusTag={focusTag}
        isResizing={isResizing}
        onResizeStart={handleResizeStart}
        isActive={isVisualEditMode}
      />
    </>
  );
}
