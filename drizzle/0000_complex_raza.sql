CREATE TABLE `learner_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`current_lesson` integer DEFAULT 0 NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`streak` integer DEFAULT 0 NOT NULL,
	`last_practice` text,
	`goal` text,
	`why` text,
	`companion_name` text DEFAULT 'Pip' NOT NULL,
	`companion_style` text DEFAULT 'duck' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
