/**
 * Tab bar outer height used in App.js MainTabs — keep these in sync:
 * height: 52 + max(bottomInset, 10)
 */
export function getTabBarHeight(bottomInset) {
  return 52 + Math.max(bottomInset ?? 0, 10);
}
