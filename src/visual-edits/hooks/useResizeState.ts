"use client";

import { useState } from "react";

interface ResizeStart {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useResizeState() {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<ResizeStart | null>(null);

  const startResize = (
    handle: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => {
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({ x, y, width, height });
  };

  const stopResize = () => {
    setIsResizing(false);
    setResizeHandle(null);
    setResizeStart(null);
  };

  return {
    isResizing,
    resizeHandle,
    resizeStart,
    startResize,
    stopResize,
    setIsResizing,
    setResizeHandle,
    setResizeStart,
  };
}
