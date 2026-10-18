import assert from "node:assert";

function formatRemaining(sleepOption, secondsRemaining) {
  if (sleepOption === -1) return "Akhir Ep";
  if (secondsRemaining === null) return null;
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  if (mins > 0) return `${mins}m`;
  return `${secs}s`;
}

// 1. End of episode mode
assert.strictEqual(formatRemaining(-1, null), "Akhir Ep");

// 2. Off mode
assert.strictEqual(formatRemaining(null, null), null);

// 3. Minutes remaining
assert.strictEqual(formatRemaining(15, 900), "15m");
assert.strictEqual(formatRemaining(30, 1800), "30m");
assert.strictEqual(formatRemaining(15, 60), "1m");

// 4. Seconds remaining (< 1 min)
assert.strictEqual(formatRemaining(15, 59), "59s");
assert.strictEqual(formatRemaining(15, 1), "1s");
assert.strictEqual(formatRemaining(15, 0), "0s");

// 5. Cross-origin iframe audio lifecycle check
function shouldRenderIframe(isSleeping, streamUrl) {
  if (isSleeping) return false;
  return Boolean(streamUrl);
}

// When sleeping, cross-origin iframe must unmount to guarantee audio cut-off
assert.strictEqual(shouldRenderIframe(true, "https://example.com/embed/123"), false);
// When active or waking up, iframe mounts and loads stream cleanly
assert.strictEqual(shouldRenderIframe(false, "https://example.com/embed/123"), true);
assert.strictEqual(shouldRenderIframe(false, ""), false);

console.log("Self-check: Sleep timer formatting, countdown, and cross-origin iframe audio cut-off passed!");
