import { useCallback, useState } from "react";

export type RightPaneItemType =
  | "pledge"
  | "contributor"
  | "dependency"
  | "status-update";

export type SelectedItem =
  | null
  | { type: RightPaneItemType; id: string; mode: "edit" }
  | { type: RightPaneItemType; mode: "create" }
  | { type: "bulk-add"; mode: "wizard" };

const STORAGE_KEY = "defi-united-ops:pane-width";
const DEFAULT_WIDTH = 580;
const MIN_WIDTH = 320;
const MAX_WIDTH = 800;

export interface UseRightPaneResult {
  selectedItem: SelectedItem;
  open: (item: NonNullable<SelectedItem>) => void;
  close: () => void;
  paneWidth: number;
  setPaneWidth: (n: number) => void;
  isFullPane: boolean;
}

export function useRightPane(): UseRightPaneResult {
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [paneWidth, setPaneWidthRaw] = useState<number>(() => {
    if (typeof window === "undefined") return DEFAULT_WIDTH;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const n = stored ? parseInt(stored, 10) : DEFAULT_WIDTH;
    return Number.isFinite(n) ? Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, n)) : DEFAULT_WIDTH;
  });

  const setPaneWidth = useCallback((n: number) => {
    const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, Math.round(n)));
    setPaneWidthRaw(clamped);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(clamped));
    }
  }, []);

  const open = useCallback((item: NonNullable<SelectedItem>) => {
    setSelectedItem(item);
  }, []);

  const close = useCallback(() => {
    setSelectedItem(null);
  }, []);

  return {
    selectedItem,
    open,
    close,
    paneWidth,
    setPaneWidth,
    isFullPane: selectedItem?.type === "bulk-add",
  };
}
