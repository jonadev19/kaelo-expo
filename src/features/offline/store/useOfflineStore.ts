/**
 * Zustand store for offline download state
 */

import { create } from "zustand";
import type { DownloadProgress } from "../types";

interface OfflineState {
  /** Active downloads keyed by routeId */
  downloads: Record<string, DownloadProgress>;
  /** Set download progress */
  setProgress: (routeId: string, progress: DownloadProgress) => void;
  /** Remove a download entry */
  removeDownload: (routeId: string) => void;
  /** Clear all download entries */
  clearDownloads: () => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  downloads: {},

  setProgress: (routeId, progress) =>
    set((state) => ({
      downloads: { ...state.downloads, [routeId]: progress },
    })),

  removeDownload: (routeId) =>
    set((state) => {
      const { [routeId]: _, ...rest } = state.downloads;
      return { downloads: rest };
    }),

  clearDownloads: () => set({ downloads: {} }),
}));
