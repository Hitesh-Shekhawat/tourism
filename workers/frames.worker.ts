/// <reference lib="webworker" />
/**
 * Frame-sequence loader (§5): fetches frames in the order it is given (progressive density:
 * every 8th, then every 4th, then all), at most 6 requests in flight, decodes each with
 * createImageBitmap off the main thread and transfers the bitmap back.
 */
type Job = { id: string; queue: { i: number; url: string }[]; inflight: number; cancelled: boolean };

const MAX_INFLIGHT = 6;
const jobs = new Map<string, Job>();
let inflight = 0;

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function pump() {
  while (inflight < MAX_INFLIGHT) {
    // oldest job first: the chapter on screen was requested before the one ahead
    const job = [...jobs.values()].find((j) => !j.cancelled && j.queue.length);
    if (!job) return;
    const item = job.queue.shift()!;
    inflight++;
    job.inflight++;
    fetch(item.url)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.blob();
      })
      .then((b) => createImageBitmap(b))
      .then((bitmap) => {
        if (job.cancelled) return bitmap.close();
        ctx.postMessage({ type: "frame", id: job.id, i: item.i, bitmap }, [bitmap]);
      })
      .catch(() => {
        if (!job.cancelled) ctx.postMessage({ type: "error", id: job.id, i: item.i });
      })
      .finally(() => {
        inflight--;
        job.inflight--;
        if (!job.queue.length && !job.inflight) {
          jobs.delete(job.id);
          if (!job.cancelled) ctx.postMessage({ type: "done", id: job.id });
        }
        pump();
      });
  }
}

ctx.onmessage = (e: MessageEvent) => {
  const m = e.data as { type: "load"; id: string; items: { i: number; url: string }[] } | { type: "cancel"; id: string };
  if (m.type === "load") {
    const old = jobs.get(m.id);
    if (old) old.cancelled = true;
    jobs.set(m.id, { id: m.id, queue: m.items.slice(), inflight: 0, cancelled: false });
    pump();
  } else if (m.type === "cancel") {
    const j = jobs.get(m.id);
    if (j) {
      j.cancelled = true;
      j.queue.length = 0;
      jobs.delete(m.id);
    }
  }
};
