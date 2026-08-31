CREATE TABLE `group_drop_archive` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `group_key` text NOT NULL,
  `item_key` text NOT NULL,
  `item_name` text NOT NULL,
  `quantity` integer NOT NULL,
  `player_name` text NOT NULL,
  `occurred_at` integer NOT NULL,
  `occurred_date` text NOT NULL,
  `activity_text` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_group_drop_archive_group_time` ON `group_drop_archive` (`group_key`,`occurred_at`);
