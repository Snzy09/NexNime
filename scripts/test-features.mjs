import assert from "node:assert";

// 1. Watchlist CRUD & filter self-check
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
}

const mockStorage = new MockStorage();

function getWatchlist() {
  const data = mockStorage.getItem("nexnime_watchlist");
  return data ? JSON.parse(data) : [];
}

function isInWatchlist(id) {
  return getWatchlist().some((item) => item.id === id);
}

function addToWatchlist(item) {
  const list = getWatchlist().filter((i) => i.id !== item.id);
  list.unshift({ ...item, savedAt: Date.now() });
  mockStorage.setItem("nexnime_watchlist", JSON.stringify(list));
}

function removeFromWatchlist(id) {
  const list = getWatchlist().filter((i) => i.id !== id);
  mockStorage.setItem("nexnime_watchlist", JSON.stringify(list));
}

function toggleWatchlist(item) {
  if (isInWatchlist(item.id)) {
    removeFromWatchlist(item.id);
    return false;
  }
  addToWatchlist(item);
  return true;
}

// Assert Watchlist Operations
assert.strictEqual(isInWatchlist("anime-1"), false);
assert.strictEqual(toggleWatchlist({ id: "anime-1", title: "Naruto", category: "anime" }), true);
assert.strictEqual(isInWatchlist("anime-1"), true);
assert.strictEqual(toggleWatchlist({ id: "anime-1", title: "Naruto", category: "anime" }), false);
assert.strictEqual(isInWatchlist("anime-1"), false);

// Test category filtering
addToWatchlist({ id: "anime-1", title: "Bleach", category: "anime" });
addToWatchlist({ id: "manga-1", title: "Solo Leveling", category: "manga" });
addToWatchlist({ id: "drakor-1", title: "Queen of Tears", category: "drakor" });

const all = getWatchlist();
assert.strictEqual(all.length, 3);
const mangaOnly = all.filter((i) => i.category === "manga");
assert.strictEqual(mangaOnly.length, 1);
assert.strictEqual(mangaOnly[0].title, "Solo Leveling");

// 2. Manga Paged Mode Boundary & Progress self-check
function clampPage(current, delta, total) {
  if (total <= 0) return 0;
  return Math.min(total - 1, Math.max(0, current + delta));
}

function computeEffectiveProgress(readMode, currentPage, totalPages, scrollProgress) {
  if (readMode === "paged") {
    return totalPages > 1 ? (currentPage / (totalPages - 1)) * 100 : 100;
  }
  return scrollProgress;
}

assert.strictEqual(clampPage(0, -1, 10), 0); // Cannot go below 0
assert.strictEqual(clampPage(0, 1, 10), 1);
assert.strictEqual(clampPage(9, 1, 10), 9); // Cannot exceed total - 1
assert.strictEqual(computeEffectiveProgress("paged", 0, 11, 50), 0);
assert.strictEqual(computeEffectiveProgress("paged", 5, 11, 50), 50);
assert.strictEqual(computeEffectiveProgress("paged", 10, 11, 50), 100);
assert.strictEqual(computeEffectiveProgress("webtoon", 5, 11, 75), 75);

// 3. Skip Intro / OP (+85s) calculation self-check
function skipIntroTime(currentTime, duration, seconds = 85) {
  if (duration > 0) {
    return Math.min(duration, currentTime + seconds);
  }
  return currentTime + seconds;
}

assert.strictEqual(skipIntroTime(10, 1440, 85), 95);
assert.strictEqual(skipIntroTime(1400, 1440, 85), 1440); // Clamped at duration end
assert.strictEqual(skipIntroTime(0, 0, 85), 85); // Unknown duration

// 4. Quick Reactions (Base count hash, toggle increment/decrement)
function getBaseCounts(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  return {
    fire: (abs % 45) + 18,
    sad: ((abs >> 2) % 30) + 6,
    laugh: ((abs >> 4) % 35) + 12,
    shock: ((abs >> 6) % 28) + 8,
    love: ((abs >> 8) % 55) + 24,
  };
}

const baseCountsA = getBaseCounts("anime-naruto-ep-1");
const baseCountsB = getBaseCounts("anime-naruto-ep-1");
const baseCountsC = getBaseCounts("donghua-btth-ep-10");

// Consistent hashing
assert.deepStrictEqual(baseCountsA, baseCountsB);
// Distinct IDs get different hashes
assert.notDeepStrictEqual(baseCountsA, baseCountsC);
assert.ok(baseCountsA.fire >= 18);
assert.ok(baseCountsA.love >= 24);

// Toggle reaction logic
function toggleReaction(state, key) {
  const isCurrentActive = Boolean(state.userReactions[key]);
  return {
    counts: {
      ...state.counts,
      [key]: Math.max(0, (state.counts[key] || 0) + (isCurrentActive ? -1 : 1)),
    },
    userReactions: {
      ...state.userReactions,
      [key]: !isCurrentActive,
    },
  };
}

let reactionState = { counts: { ...baseCountsA }, userReactions: {} };
const initialFire = reactionState.counts.fire;

// Activate reaction
reactionState = toggleReaction(reactionState, "fire");
assert.strictEqual(reactionState.userReactions.fire, true);
assert.strictEqual(reactionState.counts.fire, initialFire + 1);

// Deactivate reaction
reactionState = toggleReaction(reactionState, "fire");
assert.strictEqual(reactionState.userReactions.fire, false);
assert.strictEqual(reactionState.counts.fire, initialFire);

console.log("Self-check: Watchlist CRUD, Manga Paged mode, +85s Skip Intro, and Quick Reactions assertions passed!");
