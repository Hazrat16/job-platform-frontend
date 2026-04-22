export type StoredActivityEvent = {
  event: string;
  timestamp: number;
  path: string;
  href?: string;
  role?: string;
  userId?: string | null;
  properties?: Record<string, unknown>;
};

const MAX_EVENTS = 5000;
const events: StoredActivityEvent[] = [];

export function pushActivityEvent(event: StoredActivityEvent) {
  events.push(event);
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
}

export function getRecentActivityEvents(limit = 100): StoredActivityEvent[] {
  return events.slice(-Math.max(1, limit)).reverse();
}

export function getActivitySummary() {
  const byEvent = new Map<string, number>();
  const byPath = new Map<string, number>();
  const byRole = new Map<string, number>();

  for (const e of events) {
    byEvent.set(e.event, (byEvent.get(e.event) ?? 0) + 1);
    byPath.set(e.path || "/", (byPath.get(e.path || "/") ?? 0) + 1);
    byRole.set(e.role || "unknown", (byRole.get(e.role || "unknown") ?? 0) + 1);
  }

  const toSortedEntries = (map: Map<string, number>) =>
    [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ key, count }));

  return {
    totals: {
      events: events.length,
      uniquePaths: byPath.size,
      uniqueRoles: byRole.size,
    },
    byEvent: toSortedEntries(byEvent),
    byPath: toSortedEntries(byPath),
    byRole: toSortedEntries(byRole),
    recent: getRecentActivityEvents(40),
  };
}
