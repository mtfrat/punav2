type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/** Run after the load event and an idle slice, so the task is not on the first-paint path. */
export function afterWindowLoadIdle(task: () => void) {
  if (typeof window === "undefined") return () => {};
  const win = window as IdleWindow;
  let cancelled = false;
  let idleHandle = 0;
  let timer = 0;

  const run = () => {
    if (cancelled) return;
    if (typeof win.requestIdleCallback === "function") {
      idleHandle = win.requestIdleCallback(() => {
        if (!cancelled) task();
      }, { timeout: 2000 });
      return;
    }
    timer = window.setTimeout(() => {
      if (!cancelled) task();
    }, 1);
  };

  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });

  return () => {
    cancelled = true;
    window.removeEventListener("load", run);
    if (idleHandle && typeof win.cancelIdleCallback === "function") win.cancelIdleCallback(idleHandle);
    if (timer) window.clearTimeout(timer);
  };
}

let painted = false;
const paintWaiters: Array<() => void> = [];

function markFirstPaint() {
  if (painted || typeof window === "undefined") return;
  painted = true;
  const waiters = paintWaiters.splice(0);
  for (const waiter of waiters) waiter();
}

if (typeof window !== "undefined") {
  requestAnimationFrame(() => {
    requestAnimationFrame(markFirstPaint);
  });
}

function afterFirstPaint() {
  if (typeof window === "undefined" || painted) return Promise.resolve();
  return new Promise<void>((resolve) => {
    paintWaiters.push(resolve);
  });
}

let motionReady: Promise<void> | null = null;

/**
 * Resolves once the hero can paint without GSAP: after the first frame, then on
 * idle or the first scroll/pointer/key interaction.
 */
export function whenMotionReady() {
  if (typeof window === "undefined") return Promise.resolve();
  if (!motionReady) {
    motionReady = new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        for (const event of events) window.removeEventListener(event, onInteract);
        resolve();
      };
      const events = ["scroll", "pointerdown", "keydown", "touchstart"] as const;
      const onInteract = () => {
        void afterFirstPaint().then(finish);
      };
      for (const event of events) window.addEventListener(event, onInteract, { passive: true });
      void afterFirstPaint().then(() => afterWindowLoadIdle(finish));
    });
  }
  return motionReady;
}

type GsapApi = {
  gsap: typeof import("gsap").default;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
};

let gsapApi: Promise<GsapApi> | null = null;

export function loadGsap() {
  if (!gsapApi) {
    gsapApi = whenMotionReady().then(async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    });
  }
  return gsapApi;
}
