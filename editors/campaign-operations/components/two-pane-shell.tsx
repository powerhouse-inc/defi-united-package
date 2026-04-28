import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import type { UseRightPaneResult } from "../state/use-right-pane.js";

interface TwoPaneShellProps {
  leftPane: ReactNode;
  rightPane: ReactNode;
  fullPane?: ReactNode;
  rightPaneState: UseRightPaneResult;
}

function useStacked(): boolean {
  const [v, setV] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => setV(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return v;
}

export function TwoPaneShell({ leftPane, rightPane, fullPane, rightPaneState }: TwoPaneShellProps) {
  const { paneWidth, setPaneWidth, isFullPane } = rightPaneState;
  const draggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stacked = useStacked();

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = rect.right - e.clientX;
      setPaneWidth(newWidth);
    },
    [setPaneWidth],
  );

  const onPointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  if (isFullPane && fullPane) {
    return <div className="defi-united-ops__full-pane" style={{ height: "100%" }}>{fullPane}</div>;
  }

  return (
    <div
      ref={containerRef}
      className="defi-united-ops__two-pane"
      style={{
        display: "grid",
        gridTemplateColumns: stacked ? "1fr" : `1fr ${paneWidth}px`,
        gridTemplateRows: stacked ? "auto auto" : "1fr",
        gap: 0,
        position: "relative",
        height: "100%",
      }}
    >
      <div className="defi-united-ops__left-pane" style={{ minWidth: 0, overflow: "auto" }}>
        {leftPane}
      </div>
      {!stacked && (
        <div
          className="defi-united-ops__splitter"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          role="separator"
          aria-orientation="vertical"
          tabIndex={0}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: paneWidth - 4,
            width: 8,
            cursor: "col-resize",
            background: "transparent",
            zIndex: 5,
          }}
        />
      )}
      <div
        className="defi-united-ops__right-pane"
        style={{
          minWidth: 0,
          overflow: "auto",
          borderLeft: stacked ? undefined : "1px solid #e6e8ec",
          background: "#f7f8fa",
        }}
      >
        {rightPane}
      </div>
    </div>
  );
}
