"use client";

import { useState } from "react";

type Box = null | { top: number; left: number; width: number; height: number };

export function useHoverBox() {
  const [hoverBox, setHoverBox] = useState<Box>(null);
  const [hoverBoxes, setHoverBoxes] = useState<Box[]>([]);
  const [hoverTag, setHoverTag] = useState<string | null>(null);

  const clearHover = () => {
    setHoverBox(null);
    setHoverBoxes([]);
    setHoverTag(null);
  };

  return {
    hoverBox,
    hoverBoxes,
    hoverTag,
    setHoverBox,
    setHoverBoxes,
    setHoverTag,
    clearHover,
  };
}
