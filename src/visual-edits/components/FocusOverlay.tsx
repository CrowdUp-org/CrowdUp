"use client";

type Box = null | { top: number; left: number; width: number; height: number };

interface FocusOverlayProps {
  focusBox: Box;
  focusTag: string | null;
  isResizing: boolean;
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
  isActive: boolean;
}

export default function FocusOverlay({
  focusBox,
  focusTag,
  isResizing,
  onResizeStart,
  isActive,
}: FocusOverlayProps) {
  if (!isActive || !focusBox) return null;

  return (
    <>
      {/* Tag label */}
      {focusTag && (
        <div
          className="fixed text-[10px] font-semibold text-white bg-[#3b82f6] px-1 rounded-sm pointer-events-none select-none"
          style={{
            zIndex: 100003,
            left: focusBox.left - 4,
            top: focusBox.top - 16,
          }}
        >
          {focusTag}
        </div>
      )}

      {/* Focus border */}
      <div
        className="fixed pointer-events-none border-[1.5px] border-[#38bdf8] rounded-sm"
        style={{
          zIndex: 100001,
          left: focusBox.left,
          top: focusBox.top,
          width: focusBox.width,
          height: focusBox.height,
        }}
      />

      {/* Resize handles */}
      {!isResizing && (
        <>
          {/* Corner handles */}
          <div
            className="fixed w-2 h-2 bg-[#38bdf8] rounded-full cursor-nw-resize pointer-events-auto resize-handle"
            style={{
              zIndex: 100002,
              left: focusBox.left - 4,
              top: focusBox.top - 4,
            }}
            onMouseDown={(e) => onResizeStart(e, "nw")}
          />
          <div
            className="fixed w-2 h-2 bg-[#38bdf8] rounded-full cursor-ne-resize pointer-events-auto resize-handle"
            style={{
              zIndex: 100002,
              left: focusBox.left + focusBox.width - 4,
              top: focusBox.top - 4,
            }}
            onMouseDown={(e) => onResizeStart(e, "ne")}
          />
          <div
            className="fixed w-2 h-2 bg-[#38bdf8] rounded-full cursor-sw-resize pointer-events-auto resize-handle"
            style={{
              zIndex: 100002,
              left: focusBox.left - 4,
              top: focusBox.top + focusBox.height - 4,
            }}
            onMouseDown={(e) => onResizeStart(e, "sw")}
          />
          <div
            className="fixed w-2 h-2 bg-[#38bdf8] rounded-full cursor-se-resize pointer-events-auto resize-handle"
            style={{
              zIndex: 100002,
              left: focusBox.left + focusBox.width - 4,
              top: focusBox.top + focusBox.height - 4,
            }}
            onMouseDown={(e) => onResizeStart(e, "se")}
          />

          {/* Edge handles */}
          <div
            className="fixed w-2 h-2 bg-[#38bdf8] rounded-full cursor-n-resize pointer-events-auto resize-handle"
            style={{
              zIndex: 100002,
              left: focusBox.left + focusBox.width / 2 - 4,
              top: focusBox.top - 4,
            }}
            onMouseDown={(e) => onResizeStart(e, "n")}
          />
          <div
            className="fixed w-2 h-2 bg-[#38bdf8] rounded-full cursor-s-resize pointer-events-auto resize-handle"
            style={{
              zIndex: 100002,
              left: focusBox.left + focusBox.width / 2 - 4,
              top: focusBox.top + focusBox.height - 4,
            }}
            onMouseDown={(e) => onResizeStart(e, "s")}
          />
          <div
            className="fixed w-2 h-2 bg-[#38bdf8] rounded-full cursor-w-resize pointer-events-auto resize-handle"
            style={{
              zIndex: 100002,
              left: focusBox.left - 4,
              top: focusBox.top + focusBox.height / 2 - 4,
            }}
            onMouseDown={(e) => onResizeStart(e, "w")}
          />
          <div
            className="fixed w-2 h-2 bg-[#38bdf8] rounded-full cursor-e-resize pointer-events-auto resize-handle"
            style={{
              zIndex: 100002,
              left: focusBox.left + focusBox.width - 4,
              top: focusBox.top + focusBox.height / 2 - 4,
            }}
            onMouseDown={(e) => onResizeStart(e, "e")}
          />
        </>
      )}
    </>
  );
}
