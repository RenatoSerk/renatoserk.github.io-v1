import React, { useEffect, useState } from "react";
import { useCursorStore } from "../stores/useCursorStore";

const HOVERING_CURSOR_SIZE = 25;
const DEFAULT_CURSOR_SIZE = 15;

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { isHovering, setIsHovering } = useCursorStore.getState();

  const checkHovering = React.useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const hoveringElement = target.closest("a, button, [role='button'], input, textarea, select");
    if (isHovering !== !!hoveringElement) setIsHovering(!!hoveringElement);
  }, [isHovering, setIsHovering]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", checkHovering);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", checkHovering);
    };
  }, [setIsHovering, checkHovering]);

  const cursorBlendMode = isHovering ? "mix-blend-difference" : "mix-blend-normal";
  const innerBorder = isHovering ? "border-transparent" : "border-orange-500";
  const innerBg = isHovering ? "bg-white" : "bg-transparent";

  const cursorSize = isHovering ? HOVERING_CURSOR_SIZE : DEFAULT_CURSOR_SIZE;

  return (
    <div
      className={`fixed pointer-events-none z-[9999] transition-transform duration-200 ease-out ${cursorBlendMode}`}
      style={{
        transform: `translate(${position.x - cursorSize / 2}px, ${position.y - cursorSize / 2}px)`,
        width: `${cursorSize}px`,
        height: `${cursorSize}px`,
      }}
    >
      <div
        className={`w-full h-full rounded-full border-4 transition-all duration-500 ease-out ${innerBorder} ${innerBg}`}
      />
    </div>
  );
};

export default CustomCursor;