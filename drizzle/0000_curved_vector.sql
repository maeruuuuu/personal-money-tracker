CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`color` text DEFAULT '#ffd93d' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`wallet_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`date` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `transfers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_wallet_id` integer NOT NULL,
	`to_wallet_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`date` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`from_wallet_id`) REFERENCES `wallets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_wallet_id`) REFERENCES `wallets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'cash' NOT NULL,
	`initial_balance` integer DEFAULT 0 NOT NULL,
	`color` text DEFAULT '#4d96ff' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
