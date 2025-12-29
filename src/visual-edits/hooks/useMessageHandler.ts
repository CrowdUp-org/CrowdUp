"use client";

import { useEffect } from "react";
import { CHANNEL, type ParentToChild, type ChildToParent } from "../types/messages";
import { BOX_PADDING } from "../types/constants";
import { validateAndNormalizeImageSrc } from "../utils/validation";
import { normalizeImageSrc } from "../utils/normalization";
import { parseOrchidsId } from "../utils/domHelpers";

type Box = null | { top: number; left: number; width: number; height: number };

interface UseMessageHandlerProps {
  focusedElementRef: React.MutableRefObject<HTMLElement | null>;
  originalSrcRef: React.MutableRefObject<string>;
  focusedImageElementRef: React.MutableRefObject<HTMLImageElement | null>;
  loadedFontFamilies: React.MutableRefObject<Set<string>>;
  persistentFontMap: React.MutableRefObject<Map<string, string>>;
  persistentFontTimeouts: React.MutableRefObject<Map<string, number>>;
  appliedStylesRef: React.MutableRefObject<Map<string, Record<string, string>>>;
  setHoverBoxes: (boxes: Box[]) => void;
  setHoverTag: (tag: string | null) => void;
  handleStyleChange: (element: HTMLElement, styles: Record<string, string>) => void;
  postMessageDedup: (data: ChildToParent) => void;
}

const expandBox = (rect: DOMRect): Box => ({
  top: rect.top - BOX_PADDING,
  left: rect.left - BOX_PADDING,
  width: rect.width + BOX_PADDING * 2,
  height: rect.height + BOX_PADDING * 2,
});

export function useMessageHandler({
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
}: UseMessageHandlerProps) {
  useEffect(() => {
    function handleMessage(e: MessageEvent<ParentToChild>) {
      if (e.data?.type !== CHANNEL) return;

      if (e.data.msg === "PREVIEW_FONT" && "elementId" in e.data) {
        const { elementId, fontFamily } = e.data;

        if (persistentFontMap.current.has(elementId)) {
          return;
        }

        const element = document.querySelector(
          `[data-orchids-id="${elementId}"]`,
        ) as HTMLElement | null;
        if (!element) return;

        const familyKey = fontFamily.replace(/\s+/g, "+");
        if (!loadedFontFamilies.current.has(familyKey)) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = `https://fonts.googleapis.com/css2?family=${familyKey}:wght@400&display=swap`;
          document.head.appendChild(link);
          loadedFontFamilies.current.add(familyKey);
        }

        element.style.fontFamily = `'${fontFamily}', sans-serif`;
        return;
      }

      if (e.data.msg === "SCROLL" && "dx" in e.data && "dy" in e.data) {
        window.scrollBy(e.data.dx, e.data.dy);
      }

      if (e.data.msg === "VISUAL_EDIT_MODE" && "active" in e.data) {
        window.parent.postMessage(
          { type: CHANNEL, msg: "VISUAL_EDIT_MODE_ACK", active: e.data.active },
          "*",
        );
      }

      if (e.data.msg === "CLEAR_INLINE_STYLES" && "elementId" in e.data) {
        const allMatchingElements = document.querySelectorAll(
          `[data-orchids-id="${e.data.elementId}"]`,
        ) as NodeListOf<HTMLElement>;

        allMatchingElements.forEach((element) => {
          const stylesToClear = [
            "fontSize",
            "color",
            "fontWeight",
            "fontStyle",
            "textDecoration",
            "textAlign",
            "paddingLeft",
            "paddingRight",
            "paddingTop",
            "paddingBottom",
            "marginLeft",
            "marginRight",
            "marginTop",
            "marginBottom",
            "backgroundColor",
            "backgroundImage",
          ];

          stylesToClear.forEach((prop) => {
            (element.style as any)[prop] = "";
          });
        });

        appliedStylesRef.current.delete(e.data.elementId);
      }

      if (e.data.msg === "SHOW_ELEMENT_HOVER" && "elementId" in e.data) {
        const { elementId } = e.data;

        if (!elementId) {
          setHoverBoxes([]);
          setHoverTag(null);
          return;
        }

        const allMatchingElements = document.querySelectorAll(
          `[data-orchids-id="${elementId}"]`,
        ) as NodeListOf<HTMLElement>;

        if (allMatchingElements.length > 0) {
          const boxes: Box[] = [];
          let tagName = "";

          allMatchingElements.forEach((element) => {
            if (element === focusedElementRef.current) {
              return;
            }

            const rect = element.getBoundingClientRect();
            boxes.push(expandBox(rect));

            if (!tagName) {
              tagName =
                element.getAttribute("data-orchids-name") ||
                element.tagName.toLowerCase();
            }
          });

          setHoverBoxes(boxes);
          setHoverTag(boxes.length > 0 ? tagName : null);
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
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
  ]);
}
