export interface WatchHistoryItem {
  id: string;
  title: string;
  category: "anime" | "drakor" | "dracin" | "donghua" | "film";
  episodeNumber?: number | string;
  episodeTitle?: string;
  poster?: string;
  watchUrl: string;
  currentTime: number; // in seconds
  duration: number; // in seconds
  progress: number; // 0 to 100 percentage
  updatedAt: number; // timestamp ms
}

const STORAGE_KEY = "nexnime_watch_history";
const MAX_HISTORY_ITEMS = 20;

export function getWatchHistory(): WatchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }
    return [];
  } catch (err) {
    console.error("Failed to read watch history:", err);
    return [];
  }
}

export function saveWatchHistory(
  item: Omit<WatchHistoryItem, "updatedAt" | "progress"> & { progress?: number }
): void {
  if (typeof window === "undefined") return;
  try {
    const current = getWatchHistory();
    const duration = Math.max(0, item.duration || 0);
    const currentTime = Math.max(0, item.currentTime || 0);
    const progress =
      item.progress !== undefined
        ? item.progress
        : duration > 0
        ? Math.min(100, Math.max(0, Math.round((currentTime / duration) * 100)))
        : 0;

    const filtered = current.filter(
      (h) => h.id !== item.id && h.watchUrl !== item.watchUrl
    );

    const updatedItem: WatchHistoryItem = {
      ...item,
      currentTime,
      duration,
      progress,
      updatedAt: Date.now(),
    };

    const newHistory = [updatedItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch (err) {
    console.error("Failed to save watch history:", err);
  }
}

export function getSavedResumeTime(idOrUrl: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const history = getWatchHistory();
    const match = history.find(
      (h) => h.id === idOrUrl || (idOrUrl && h.watchUrl.includes(idOrUrl))
    );
    if (match && match.currentTime > 5 && match.progress < 96) {
      return match.currentTime;
    }
    return 0;
  } catch {
    return 0;
  }
}

export function removeWatchHistory(idOrUrl: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getWatchHistory();
    const filtered = current.filter(
      (h) => h.id !== idOrUrl && h.watchUrl !== idOrUrl
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to remove watch history item:", err);
  }
}

export function clearWatchHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear watch history:", err);
  }
}

export function importWatchHistory(incoming: WatchHistoryItem[]): boolean {
  if (typeof window === "undefined" || !Array.isArray(incoming)) return false;
  try {
    const current = getWatchHistory();
    const map = new Map<string, WatchHistoryItem>();

    for (const item of current) {
      if (item && item.id) map.set(item.id, item);
    }

    for (const item of incoming) {
      if (!item || !item.id || !item.title) continue;
      const existing = map.get(item.id);
      if (!existing || (item.updatedAt || 0) > (existing.updatedAt || 0)) {
        map.set(item.id, item);
      }
    }

    const merged = Array.from(map.values())
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return true;
  } catch (err) {
    console.error("Failed to import watch history:", err);
    return false;
  }
}

export function exportWatchHistoryJSON(): string {
  return JSON.stringify(getWatchHistory(), null, 2);
}

