CREATE TABLE `idol_expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`amount` real NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`date` text NOT NULL,
	`payment_method` text NOT NULL,
	`wallet_id` integer,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `idol_topups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` real NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`date` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
