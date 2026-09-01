CREATE INDEX `idx_hiscore_snapshots_group_captured` ON `hiscore_snapshots` (`group_key`,`captured_at`);--> statement-breakpoint
CREATE INDEX `idx_workspaces_updated_at` ON `workspaces` (`updated_at`);