// Simple navigation history helper
// Usage: call `recordRoute(currentRoute)` before pushing a new route,
// and call `goBack(router)` in back buttons to navigate to the recorded previous route.

let historyStack: string[] = [];

export const recordRoute = (route: string | undefined | null) => {
  try {
    if (!route) return;
    // Avoid duplicate consecutive entries
    const last = historyStack.length ? historyStack[historyStack.length - 1] : null;
    if (last !== route) historyStack.push(route);
  } catch (e) {
    // noop
  }
};

export const getPrevious = () => {
  if (historyStack.length === 0) return null;
  return historyStack.pop() || null;
};

export const clearHistory = () => {
  historyStack = [];
};

export const goBack = (router: any) => {
  const prev = getPrevious();
  if (prev) {
    try {
      router.push(prev);
    } catch (e) {
      console.error("navigationHistory.goBack: failed to push prev", prev, e);
      try {
        router.back();
      } catch (err) {
        console.error("navigationHistory.goBack: router.back() also failed", err);
      }
    }
  } else {
    // fallback to router.back()
    try {
      router.back();
    } catch (e) {
      console.error("navigationHistory.goBack: router.back() failed", e);
    }
  }
};

export default {
  recordRoute,
  getPrevious,
  clearHistory,
  goBack,
};
