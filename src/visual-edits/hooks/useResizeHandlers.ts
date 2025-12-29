"use client";

import { useCallback, useEffect } from "react";
import { CHANNEL, type ChildToParent } from "../types/messages";
import { parseOrchidsId } from "../utils/domHelpers";
import { BOX_PADDING } from "../types/constants";

type Box = null | { top: number; left: number; width: number; height: number };
type ResizeStart = {
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

interface UseResizeHandlersProps {
  isResizing: boolean;
  resizeHandle: string | null;
  resizeStart: ResizeStart;
  focusedElementId: string | null;
  focusedElementRef: React.MutableRefObject<HTMLElement | null>;
  isResizingRef: React.MutableRefObject<boolean>;
  hoverBox: Box;
  setIsResizing: (value: boolean) => void;
  setResizeHandle: (value: string | null) => void;
  setResizeStart: (value: ResizeStart) => void;
  setHoverBox: (box: Box) => void;
}

const expandBox = (rect: DOMRect): Box => ({
  top: rect.top - BOX_PADDING,
  left: rect.left - BOX_PADDING,
  width: rect.width + BOX_PADDING * 2,
  height: rect.height + BOX_PADDING * 2,
});

export function useResizeHandlers({
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
}: UseResizeHandlersProps) {
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: string) => {
      if (!focusedElementRef.current) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = focusedElementRef.current.getBoundingClientRect();

      setHoverBox(null);

      document.body.style.pointerEvents = "none";
      const resizeHandles = document.querySelectorAll(".resize-handle");
      resizeHandles.forEach((handle) => {
        (handle as HTMLElement).style.pointerEvents = "auto";
      });

      setIsResizing(true);
      isResizingRef.current = true;
      setResizeHandle(handle);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
      });
    },
    [
      focusedElementRef,
      isResizingRef,
      setHoverBox,
      setIsResizing,
      setResizeHandle,
      setResizeStart,
    ],
  );

  useEffect(() => {
    if (
      !isResizing ||
      !resizeStart ||
      !resizeHandle ||
      !focusedElementRef.current
    )
      return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStart.x;
      const dy = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;

      if (resizeHandle.includes("e")) newWidth = resizeStart.width + dx;
      if (resizeHandle.includes("w")) newWidth = resizeStart.width - dx;
      if (resizeHandle.includes("s")) newHeight = resizeStart.height + dy;
      if (resizeHandle.includes("n")) newHeight = resizeStart.height - dy;

      const parent = focusedElementRef.current?.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const parentStyles = window.getComputedStyle(parent);
        const parentPaddingLeft = parseFloat(parentStyles.paddingLeft) || 0;
        const parentPaddingRight = parseFloat(parentStyles.paddingRight) || 0;
        const parentPaddingTop = parseFloat(parentStyles.paddingTop) || 0;
        const parentPaddingBottom = parseFloat(parentStyles.paddingBottom) || 0;

        const maxWidth =
          parentRect.width - parentPaddingLeft - parentPaddingRight;
        const maxHeight =
          parentRect.height - parentPaddingTop - parentPaddingBottom;

        const exceedsWidth = newWidth > maxWidth;
        const exceedsHeight = newHeight > maxHeight;

        newWidth = Math.max(
          20,
          exceedsWidth ? newWidth : Math.min(newWidth, maxWidth),
        );

        newHeight = Math.max(
          20,
          exceedsHeight ? newHeight : Math.min(newHeight, maxHeight),
        );
      } else {
        newWidth = Math.max(20, newWidth);
        newHeight = Math.max(20, newHeight);
      }

      if (hoverBox) {
        setHoverBox(null);
      }

      if (focusedElementId) {
        window.parent.postMessage(
          {
            type: CHANNEL,
            msg: "RESIZE_ELEMENT",
            elementId: focusedElementId,
            width: Math.round(newWidth),
            height: Math.round(newHeight),
          },
          "*",
        );
      }
    };

    const handleMouseUp = () => {
      if (focusedElementRef.current && focusedElementId) {
        const element = focusedElementRef.current;
        const computedStyle = window.getComputedStyle(element);
        const width = parseFloat(computedStyle.width) || element.offsetWidth;
        const height = parseFloat(computedStyle.height) || element.offsetHeight;

        const maxWidth = computedStyle.maxWidth;
        const maxHeight = computedStyle.maxHeight;
        const hasMaxWidth =
          maxWidth && maxWidth !== "none" && maxWidth !== "initial";
        const hasMaxHeight =
          maxHeight && maxHeight !== "none" && maxHeight !== "initial";

        const parent = element.parentElement;
        let widthValue = `${Math.round(width)}px`;
        let heightValue = `${Math.round(height)}px`;

        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          const parentStyles = window.getComputedStyle(parent);
          const parentPaddingLeft = parseFloat(parentStyles.paddingLeft) || 0;
          const parentPaddingRight = parseFloat(parentStyles.paddingRight) || 0;
          const parentPaddingTop = parseFloat(parentStyles.paddingTop) || 0;
          const parentPaddingBottom =
            parseFloat(parentStyles.paddingBottom) || 0;

          const parentInnerWidth =
            parentRect.width - parentPaddingLeft - parentPaddingRight;
          const parentInnerHeight =
            parentRect.height - parentPaddingTop - parentPaddingBottom;

          const widthPercent = (width / parentInnerWidth) * 100;
          const heightPercent = (height / parentInnerHeight) * 100;

          if (
            Math.abs(widthPercent - Math.round(widthPercent)) < 0.1 ||
            [25, 33.333, 50, 66.667, 75, 100].some(
              (v) => Math.abs(widthPercent - v) < 0.5,
            )
          ) {
            widthValue = `${Math.round(widthPercent * 10) / 10}%`;
          }

          if (
            Math.abs(heightPercent - Math.round(heightPercent)) < 0.1 &&
            [25, 50, 75, 100].includes(Math.round(heightPercent))
          ) {
            heightValue = `${Math.round(heightPercent)}%`;
          }
        }

        const styles: Record<string, string> = {};

        styles.width = widthValue;
        styles.height = heightValue;

        if (hasMaxWidth) {
          styles.maxWidth = widthValue;
        }

        if (hasMaxHeight) {
          styles.maxHeight = heightValue;
        }

        const msg: ChildToParent = {
          type: CHANNEL,
          msg: "STYLE_BLUR",
          id: focusedElementId,
          styles,
          filePath: "",
          line: 0,
          column: 0,
          className: element.getAttribute("class") || "",
        };

        const orchidsId = element.getAttribute("data-orchids-id");
        if (orchidsId) {
          const parsed = parseOrchidsId(orchidsId);
          if (parsed) {
            msg.filePath = parsed.filePath;
            msg.line = parsed.line;
            msg.column = parsed.column;
          }
        }

        window.parent.postMessage(msg, "*");
      }

      setIsResizing(false);
      isResizingRef.current = false;
      setResizeHandle(null);
      setResizeStart(null);

      document.body.style.pointerEvents = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isResizing,
    resizeStart,
    resizeHandle,
    focusedElementId,
    focusedElementRef,
    isResizingRef,
    hoverBox,
    setIsResizing,
    setResizeHandle,
    setResizeStart,
    setHoverBox,
  ]);

  return { handleResizeStart };
}
