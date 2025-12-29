"use client";

type Box = null | { top: number; left: number; width: number; height: number };

interface HoverOverlayProps {
  boxes: Box[];
  isActive: boolean;
}

export default function HoverOverlay({ boxes, isActive }: HoverOverlayProps) {
  if (!isActive) return null;

  return (
    <>
      {boxes
        .filter((box): box is NonNullable<Box> => box !== null)
        .map((box, index) => (
          <div key={index}>
            <div
              className="fixed pointer-events-none border-[0.5px] border-[#38bdf8] bg-blue-200/20 border-dashed rounded-sm"
              style={{
                zIndex: 100000,
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
              }}
            />
          </div>
        ))}
    </>
  );
}
