"use client";

import { useCallback } from "react";
import { CHANNEL, type ChildToParent } from "../types/messages";
import {
  parseOrchidsId,
  extractDirectTextContent,
  wrapMultiline,
  restoreChildElements,
} from "../utils/domHelpers";

interface UseEditHandlersProps {
  editingElementRef: React.MutableRefObject<HTMLElement | null>;
  wasEditableRef: React.MutableRefObject<boolean>;
  originalContentRef: React.MutableRefObject<string>;
  appliedStylesRef: React.MutableRefObject<Map<string, Record<string, string>>>;
  hasStyleChangesRef: React.MutableRefObject<boolean>;
  postMessageDedup: (data: ChildToParent) => void;
}

export function useEditHandlers({
  editingElementRef,
  wasEditableRef,
  originalContentRef,
  appliedStylesRef,
  hasStyleChangesRef,
  postMessageDedup,
}: UseEditHandlersProps) {
  const handleTextChange = useCallback(
    (element: HTMLElement) => {
      if (element !== editingElementRef.current) {
        console.warn(
          "Attempting to handle text change for non-editing element",
        );
        return;
      }

      const orchidsId = element.getAttribute("data-orchids-id");
      if (!orchidsId) return;

      let newText: string;
      let oldText: string;

      if (element.childElementCount > 0) {
        newText = extractDirectTextContent(element);
        oldText = originalContentRef.current;
      } else {
        newText = element.innerText || element.textContent || "";
        oldText = originalContentRef.current;
      }

      if (newText !== oldText) {
        const parsed = parseOrchidsId(orchidsId);
        if (!parsed) return;

        const msg: ChildToParent = {
          type: CHANNEL,
          msg: "TEXT_CHANGED",
          id: orchidsId,
          oldText: wrapMultiline(oldText),
          newText: wrapMultiline(newText),
          filePath: parsed.filePath,
          line: parsed.line,
          column: parsed.column,
        };

        postMessageDedup(msg);

        originalContentRef.current = newText;
      }
    },
    [editingElementRef, originalContentRef, postMessageDedup],
  );

  const handleStyleChange = useCallback(
    (element: HTMLElement, styles: Record<string, string>) => {
      const orchidsId = element.getAttribute("data-orchids-id");
      if (!orchidsId) return;

      const parsed = parseOrchidsId(orchidsId);
      if (!parsed) return;

      const allMatchingElements = document.querySelectorAll(
        `[data-orchids-id="${orchidsId}"]`,
      ) as NodeListOf<HTMLElement>;

      allMatchingElements.forEach((el) => {
        Object.entries(styles).forEach(([property, value]) => {
          const cssProp = property.replace(/([A-Z])/g, "-$1").toLowerCase();

          let finalValue = value;

          if (
            property === "backgroundColor" &&
            (value === "transparent" ||
              value === "rgba(0, 0, 0, 0)" ||
              value === "rgb(0, 0, 0, 0)")
          ) {
            finalValue = "transparent";
          }

          if (
            (property === "backgroundColor" && finalValue === "transparent") ||
            (property === "backgroundImage" && value === "none") ||
            (property === "textDecoration" && value === "none") ||
            (property === "fontStyle" && value === "normal") ||
            (property === "opacity" && value === "1") ||
            ((property.includes("padding") || property.includes("margin")) &&
              value === "0") ||
            (property === "borderRadius" && value === "0") ||
            (property === "letterSpacing" && value === "normal") ||
            (property === "gap" && value === "normal")
          ) {
            el.style.removeProperty(cssProp);
          } else {
            el.style.setProperty(cssProp, finalValue, "important");
          }
        });
      });

      const existingStyles = appliedStylesRef.current.get(orchidsId) || {};
      appliedStylesRef.current.set(orchidsId, {
        ...existingStyles,
        ...styles,
      });
      hasStyleChangesRef.current = true;
    },
    [appliedStylesRef, hasStyleChangesRef],
  );

  const handleStyleBlur = useCallback(
    (element: HTMLElement) => {
      if (!hasStyleChangesRef.current) return;

      const orchidsId = element.getAttribute("data-orchids-id");
      if (!orchidsId) return;

      const parsed = parseOrchidsId(orchidsId);
      if (!parsed) return;

      const appliedStyles = appliedStylesRef.current.get(orchidsId);
      if (!appliedStyles || Object.keys(appliedStyles).length === 0) return;

      const className = element.getAttribute("class") || "";

      const msg: ChildToParent = {
        type: CHANNEL,
        msg: "STYLE_BLUR",
        id: orchidsId,
        styles: appliedStyles,
        className,
        filePath: parsed.filePath,
        line: parsed.line,
        column: parsed.column,
      };

      postMessageDedup(msg);

      hasStyleChangesRef.current = false;
    },
    [appliedStylesRef, hasStyleChangesRef, postMessageDedup],
  );

  const cleanupEditingElement = useCallback(() => {
    if (editingElementRef.current) {
      const element = editingElementRef.current;

      editingElementRef.current = null;

      handleStyleBlur(element);

      handleTextChange(element);

      if (element.childElementCount > 0) {
        restoreChildElements(element);
      }

      if (!wasEditableRef.current) {
        element.contentEditable = "false";
      }

      const currentStyle = element.getAttribute("style") || "";
      const cleanedStyle = currentStyle
        .replace(/outline:\s*none\s*!important;?/gi, "")
        .replace(/box-shadow:\s*none\s*!important;?/gi, "")
        .trim()
        .replace(/;\s*;/g, ";")
        .replace(/^;|;$/g, "");

      if (cleanedStyle) {
        element.setAttribute("style", cleanedStyle);
      } else {
        element.removeAttribute("style");
      }

      element.blur();

      const handlers = (element as any)._editHandlers;
      if (handlers) {
        element.removeEventListener("focus", handlers.focus);
        element.removeEventListener("blur", handlers.blur);
        element.removeEventListener("input", handlers.input);
        delete (element as any)._editHandlers;
      }

      wasEditableRef.current = false;
      originalContentRef.current = "";
    }
  }, [
    editingElementRef,
    wasEditableRef,
    originalContentRef,
    handleStyleBlur,
    handleTextChange,
  ]);

  return {
    handleTextChange,
    handleStyleChange,
    handleStyleBlur,
    cleanupEditingElement,
  };
}
