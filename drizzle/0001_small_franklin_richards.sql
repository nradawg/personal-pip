CREATE TABLE `stream_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`twitch_stream_id` text NOT NULL,
	`started_at` text NOT NULL,
	`ended_at` text,
	`duration_minutes` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `learner_profiles`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stream_sessions_twitch_stream_id_unique` ON `stream_sessions` (`twitch_stream_id`);--> statement-breakpoint
CREATE TABLE `twitch_accounts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`twitch_user_id` text NOT NULL,
	`login` text NOT NULL,
	`display_name` text NOT NULL,
	`profile_image_url` text,
	`access_token` text NOT NULL,
	`refresh_token` text NOT NULL,
	`token_expires_at` text NOT NULL,
	`connected_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `learner_profiles`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `twitch_accounts_twitch_user_id_unique` ON `twitch_accounts` (`twitch_user_id`);