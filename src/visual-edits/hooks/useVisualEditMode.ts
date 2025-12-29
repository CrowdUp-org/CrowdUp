"use client";

import { useState, useEffect, useRef } from "react";
import { VISUAL_EDIT_MODE_KEY } from "../types/constants";
import { CHANNEL } from "../types/messages";

export function useVisualEditMode() {
  const [isActive, setIsActive] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(VISUAL_EDIT_MODE_KEY);
      return stored === "true";
    }
    return false;
  });

  const isActiveRef = useRef(false);

  // Keep ref in sync with state and persist to localStorage
  useEffect(() => {
    isActiveRef.current = isActive;
    if (typeof window !== "undefined") {
      localStorage.setItem(VISUAL_EDIT_MODE_KEY, String(isActive));
    }
  }, [isActive]);

  // On mount, notify parent if visual edit mode was restored from localStorage
  useEffect(() => {
    if (isActive) {
      window.parent.postMessage(
        { type: CHANNEL, msg: "VISUAL_EDIT_MODE_ACK", active: true },
        "*",
      );
      window.parent.postMessage(
        { type: CHANNEL, msg: "VISUAL_EDIT_MODE_RESTORED", active: true },
        "*",
      );
    }
  }, []);

  return { isActive, setIsActive, isActiveRef };
}
