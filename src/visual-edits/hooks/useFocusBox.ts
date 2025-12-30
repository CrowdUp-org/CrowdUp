"use client";

import { useState } from "react";

type Box = null | { top: number; left: number; width: number; height: number };

export function useFocusBox() {
  const [focusBox, setFocusBox] = useState<Box>(null);
  const [focusedElementId, setFocusedElementId] = useState<string | null>(null);
  const [focusTag, setFocusTag] = useState<string | null>(null);

  const updateFocusBox = (
    box: Box,
    elementId: string | null,
    tag: string | null,
  ) => {
    setFocusBox(box);
    setFocusedElementId(elementId);
    setFocusTag(tag);
  };

  const clearFocusBox = () => {
    setFocusBox(null);
    setFocusedElementId(null);
    setFocusTag(null);
  };

  return {
    focusBox,
    focusedElementId,
    focusTag,
    updateFocusBox,
    clearFocusBox,
    setFocusBox,
    setFocusedElementId,
    setFocusTag,
  };
}
