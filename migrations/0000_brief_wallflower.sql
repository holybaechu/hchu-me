CREATE TABLE `project_techs` (
	`project_id` text NOT NULL,
	`tech_id` text NOT NULL,
	PRIMARY KEY(`project_id`, `tech_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_project_techs_tech_id` ON `project_techs` (`tech_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`github_url` text,
	`website_url` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE TABLE `sync_metadata` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `techs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon_url` text
);
