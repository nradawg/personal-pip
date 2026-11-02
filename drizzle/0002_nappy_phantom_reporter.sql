CREATE TABLE `stream_goals` (
	`user_id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`why` text,
	`target_streams` integer DEFAULT 1 NOT NULL,
	`deadline` text NOT NULL,
	`started_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `learner_profiles`(`user_id`) ON UPDATE no action ON DELETE no action
);
