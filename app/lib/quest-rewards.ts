export type QuestState = 'completed' | 'started' | 'not-started' | 'unknown';
export type QuestProfile = { player: string; refreshedAt: string; quests: { title: string; status: string }[] };
export function questKey(value: string) {
  return value.normalize('NFKD').replace(/[’‘]/g, "'").toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/^(?:a|the) /, '');
}
export function questState(status: string): QuestState {
  switch (status.toUpperCase().replace(/[ -]/g, '_')) {
    case 'COMPLETE': case 'COMPLETED': return 'completed';
    case 'STARTED': case 'IN_PROGRESS': return 'started';
    case 'NOT_STARTED': case 'NOT_COMPLETE': case 'INCOMPLETE': return 'not-started';
    default: return 'unknown';
  }
}
export function readQuestProfile(value: unknown, player: string): QuestProfile | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Partial<QuestProfile>;
  if (typeof data.player !== 'string' || data.player.trim().toLowerCase() !== player.trim().toLowerCase() || typeof data.refreshedAt !== 'string' || !Number.isFinite(Date.parse(data.refreshedAt)) || !Array.isArray(data.quests)) return null;
  const quests = data.quests.filter((quest): quest is QuestProfile['quests'][number] => !!quest && typeof quest.title === 'string' && typeof quest.status === 'string');
  return quests.length ? { player: data.player, refreshedAt: data.refreshedAt, quests } : null;
}
export function questStatusMap(profile: QuestProfile | null) {
  return new Map(profile?.quests.map(quest => [questKey(quest.title), questState(quest.status)]) || []);
}
