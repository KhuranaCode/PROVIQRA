/**
 * Pure, framework-free state helpers.
 *
 * Everything here is deterministic and side-effect free so it can be unit
 * tested in Node (see test_core.js) and shared by every screen.
 */

export const STATE_VERSION = 2;

const ARRAY_KEYS = ['users', 'opportunities', 'connections', 'conversations', 'outcomes', 'reports', 'blocks'];

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Merge persisted state with defaults so stale or partially corrupted
 * localStorage can never crash the app (e.g. a missing `reports` array).
 * Also migrates the v1 `blockedUserIds` list into directional `blocks`.
 */
export function hydrateState(raw, defaults) {
  if (!isObj(raw)) return { ...defaults };

  const next = { ...defaults, ...raw };

  for (const key of ARRAY_KEYS) {
    if (!Array.isArray(next[key])) next[key] = Array.isArray(defaults[key]) ? [...defaults[key]] : [];
  }

  // Seeded users must always exist; persisted edits win.
  if (next.users.length === 0) next.users = [...defaults.users];

  // v1 -> v2: blockedUserIds had no "who blocked whom". Attribute legacy
  // entries to the persona that was active when the state was saved.
  if (Array.isArray(raw.blockedUserIds) && raw.blockedUserIds.length && (!Array.isArray(raw.blocks) || raw.blocks.length === 0)) {
    const blocker = raw.currentUserId || defaults.currentUserId;
    next.blocks = raw.blockedUserIds
      .filter((id) => typeof id === 'string' && id !== blocker)
      .map((blockedId) => ({ blockerId: blocker, blockedId }));
  }
  delete next.blockedUserIds;

  if (!next.users.some((u) => u.id === next.currentUserId)) {
    next.currentUserId = next.users[0].id;
  }
  if (next.theme !== 'dark' && next.theme !== 'light') next.theme = defaults.theme;

  next.version = STATE_VERSION;
  return next;
}

/** True if either user has blocked the other. */
export function isBlockedBetween(blocks = [], a, b) {
  return blocks.some(
    (x) => (x.blockerId === a && x.blockedId === b) || (x.blockerId === b && x.blockedId === a)
  );
}

/** Users the given viewer may see: everyone except blocked pairs (either direction). */
export function getVisibleUsers(users = [], blocks = [], viewerId) {
  return users.filter((u) => u.id === viewerId || !isBlockedBetween(blocks, viewerId, u.id));
}

/** Most relevant connection between two users (accepted > pending > anything else). */
export function findConnection(connections = [], a, b) {
  const between = connections.filter(
    (c) => (c.senderId === a && c.receiverId === b) || (c.senderId === b && c.receiverId === a)
  );
  return (
    between.find((c) => c.status === 'accepted') ||
    between.find((c) => c.status === 'pending') ||
    between[0] ||
    null
  );
}

/**
 * Connection state from the viewer's perspective, used to drive Connect buttons.
 * Returns 'self' | 'connected' | 'outgoing' | 'incoming' | 'none'.
 */
export function getConnectionState(connections, viewerId, otherId) {
  if (viewerId === otherId) return 'self';
  const c = findConnection(connections, viewerId, otherId);
  if (!c) return 'none';
  if (c.status === 'accepted') return 'connected';
  if (c.status === 'pending') return c.senderId === viewerId ? 'outgoing' : 'incoming';
  return 'none'; // declined requests may be re-sent
}

/** Shared trimming/length guard for free-text input. */
export function cleanText(value, max = 2000) {
  return String(value ?? '').replace(/\s+$/g, '').replace(/^\s+/g, '').slice(0, max);
}
