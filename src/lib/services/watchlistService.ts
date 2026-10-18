"use client";

export type WatchlistCategory =
  | "all"
  | "anime"
  | "donghua"
  | "drakor"
  | "dracin"
  | "manga"
  | "novel"
  | "film";

export interface WatchlistItem {
  id: string;
  title: string;
  category: "anime" | "donghua" | "drakor" | "dracin" | "manga" | "novel" | "film";
  poster?: string;
  url: string;
  rating?: string;
  status?: string;
  totalEpisodes?: string | number;
  addedAt: number;
}

const STORAGE_KEY = "nexnime_watchlist";

export function getWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    }
    return [];
  } catch (err) {
    console.error("Failed to read watchlist:", err);
    return [];
  }
}

export function isInWatchlist(id: string): boolean {
  if (typeof window === "undefined" || !id) return false;
  const list = getWatchlist();
  return list.some((item) => item.id === id);
}

export function toggleWatchlist(
  item: Omit<WatchlistItem, "addedAt">
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const list = getWatchlist();
    const existingIndex = list.findIndex((x) => x.id === item.id);
    let isNowSaved = false;
    let updatedList: WatchlistItem[];

    if (existingIndex !== -1) {
      // Remove
      updatedList = list.filter((x) => x.id !== item.id);
      isNowSaved = false;
    } else {
      // Add
      const newItem: WatchlistItem = {
        ...item,
        addedAt: Date.now(),
      };
      updatedList = [newItem, ...list];
      isNowSaved = true;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    // Dispatch global event for instant UI sync
    window.dispatchEvent(
      new CustomEvent("nexnime_watchlist_updated", {
        detail: { id: item.id, isSaved: isNowSaved, total: updatedList.length },
      })
    );

    return isNowSaved;
  } catch (err) {
    console.error("Failed to toggle watchlist:", err);
    return false;
  }
}

export function removeFromWatchlist(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getWatchlist();
    const updated = list.filter((x) => x.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent("nexnime_watchlist_updated", {
        detail: { id, isSaved: false, total: updated.length },
      })
    );
  } catch (err) {
    console.error("Failed to remove watchlist item:", err);
  }
}

export function clearWatchlist(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent("nexnime_watchlist_updated", {
        detail: { total: 0 },
      })
    );
  } catch (err) {
    console.error("Failed to clear watchlist:", err);
  }
}
