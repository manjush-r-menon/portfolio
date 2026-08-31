// Plain module-level pub/sub, not React state or context — Preloader's
// GSAP timeline calls markPreloaderDone() directly from its own tick, and
// subscribers' callbacks run synchronously in that same call, with no
// React re-render round-trip in between. A context+state version of this
// (setDone -> provider value change -> consumer effect) adds a render
// round-trip between "the timeline says go" and the reveal actually
// starting, which was visible as a small lag on first load.
let done = false;
const listeners = new Set<() => void>();

export function markPreloaderDone() {
  if (done) return;
  done = true;
  listeners.forEach((cb) => cb());
  listeners.clear();
}

export function onPreloaderDone(cb: () => void): () => void {
  if (done) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}
