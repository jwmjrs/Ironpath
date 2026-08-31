import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const workspaces = sqliteTable('workspaces', {
  id: text('id').primaryKey(),
  tokenHash: text('token_hash').notNull(),
  name: text('name').notNull(),
  dataJson: text('data_json').notNull().default('{}'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, table => [index('idx_workspaces_updated_at').on(table.updatedAt)]);

export const hiscoreCache = sqliteTable('hiscore_cache', {
  cacheKey: text('cache_key').primaryKey(),
  responseJson: text('response_json').notNull(),
  fetchedAt: integer('fetched_at').notNull(),
});

export const hiscoreSnapshots = sqliteTable('hiscore_snapshots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupKey: text('group_key').notNull(),
  totalLevel: integer('total_level').notNull(),
  totalXp: integer('total_xp').notNull(),
  playersJson: text('players_json').notNull(),
  capturedAt: integer('captured_at').notNull(),
}, table => [index('idx_hiscore_snapshots_group_captured').on(table.groupKey, table.capturedAt)]);

export const requestLimits = sqliteTable('request_limits', {
  bucketKey: text('bucket_key').primaryKey(),
  requestCount: integer('request_count').notNull(),
  windowStart: integer('window_start').notNull(),
});

export const groupDropArchive = sqliteTable('group_drop_archive', {
  id: integer('id').primaryKey({ autoIncrement:true }),
  groupKey: text('group_key').notNull(),
  itemKey: text('item_key').notNull(),
  itemName: text('item_name').notNull(),
  quantity: integer('quantity').notNull(),
  playerName: text('player_name').notNull(),
  occurredAt: integer('occurred_at').notNull(),
  occurredDate: text('occurred_date').notNull(),
  activityText: text('activity_text').notNull(),
}, table => [index('idx_group_drop_archive_group_time').on(table.groupKey, table.occurredAt)]);
