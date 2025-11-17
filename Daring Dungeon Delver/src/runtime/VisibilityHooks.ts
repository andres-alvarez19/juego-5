type CleanupFn = () => void;
type PageHideCallback = () => void;
type VisibilityCallback = (isHidden: boolean) => void;

const pageHideListeners = new Set<PageHideCallback>();
const visibilityChangeListeners = new Set<VisibilityCallback>();

let initialized = false;

function ensureInitialized(): void {
  if (initialized) {
    return;
  }

  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  window.addEventListener("pagehide", handlePageHide);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  initialized = true;
}

function handlePageHide(): void {
  pageHideListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Suppress listener failures, this is best-effort only.
    }
  });
}

function handleVisibilityChange(): void {
  const isHidden = document.visibilityState === "hidden";

  visibilityChangeListeners.forEach((listener) => {
    try {
      listener(isHidden);
    } catch {
      // Suppress listener failures.
    }
  });
}

export function onPageHide(callback: PageHideCallback): CleanupFn {
  ensureInitialized();
  pageHideListeners.add(callback);

  return () => {
    pageHideListeners.delete(callback);
  };
}

export function onVisibilityChange(callback: VisibilityCallback): CleanupFn {
  ensureInitialized();
  visibilityChangeListeners.add(callback);

  return () => {
    visibilityChangeListeners.delete(callback);
  };
}

export function resetVisibilityHooks(): void {
  pageHideListeners.clear();
  visibilityChangeListeners.clear();

  if (initialized && typeof window !== "undefined" && typeof document !== "undefined") {
    window.removeEventListener("pagehide", handlePageHide);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  }

  initialized = false;
}

