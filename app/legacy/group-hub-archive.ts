/**
 * Group Hub archive
 *
 * The original shared-workspace board was retired during the 2026 refactor.
 * Its functions covered Journey tiers, group Requests, shops, PvM, and estate
 * tracking. Those screens were replaced by focused Dashboard, Resources, and
 * Supplemental Information views.
 *
 * The complete implementation is preserved in the Git revision immediately
 * before this refactor. Keeping the record in Git avoids shipping inactive
 * code in the production bundle while retaining a recoverable history.
 */
export const groupHubArchive = {
  status: 'retired',
  replacedBy: ['Dashboard', 'Resources', 'Supplemental Info'],
  preservedCapabilities: ['Journey tier tracking', 'Requests', 'shop routes', 'PvM milestones', 'estate checklist'],
} as const;
