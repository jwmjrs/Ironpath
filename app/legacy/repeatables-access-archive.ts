/**
 * Pre-redesign Repeatables implementation archive.
 *
 * The original screen used a period tab strip, a cycle progress ring, a full
 * checklist, quest-sync access checks, and per-character manual unlock flags.
 * Its active implementation remains in app/page.tsx during the visual rebuild
 * so no tracking, access, or saved completion behaviour is discarded.
 *
 * Saved browser keys used by that implementation:
 * - ironpath-repeatables
 * - ironpath-repeatable-unlocks:<player name>
 */
export const repeatablesAccessArchive = {
  savedKeys: ['ironpath-repeatables', 'ironpath-repeatable-unlocks:<player name>'],
  preservedFeatures: ['daily, weekly and monthly completion state', 'quest access sync', 'level requirement checks', 'manual account unlock confirmations'],
} as const;
