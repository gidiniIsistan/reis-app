CREATE TABLE `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `attachment` (
	`id` text PRIMARY KEY NOT NULL,
	`filePath` text NOT NULL,
	`fileName` text NOT NULL,
	`mime` text NOT NULL,
	`fileSize` integer NOT NULL,
	`uploaded_at` text DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE `authenticator` (
	`credentialID` text NOT NULL,
	`userId` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`credentialPublicKey` text NOT NULL,
	`counter` integer NOT NULL,
	`credentialDeviceType` text NOT NULL,
	`credentialBackedUp` integer NOT NULL,
	`transports` text,
	PRIMARY KEY(`userId`, `credentialID`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `class` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`desc` text,
	`entercode` text NOT NULL,
	`start_date` text DEFAULT current_timestamp NOT NULL,
	`end_date` text,
	`deleted` integer DEFAULT 0 NOT NULL,
	`recorrido_id` text NOT NULL,
	FOREIGN KEY (`recorrido_id`) REFERENCES `recorrido`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `dx_question` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`class_id` text NOT NULL,
	`group_id` text NOT NULL,
	`dx_answer` text,
	`subject` text NOT NULL,
	`topic` text NOT NULL,
	`issues` text,
	FOREIGN KEY (`class_id`,`group_id`) REFERENCES `quiz`(`class_id`,`group_id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `group` (
	`id` text PRIMARY KEY NOT NULL,
	`lider_id` text NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	`recorrido_id` text NOT NULL,
	FOREIGN KEY (`lider_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`recorrido_id`) REFERENCES `recorrido`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `new_question` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`class_id` text NOT NULL,
	`group_id` text NOT NULL,
	FOREIGN KEY (`class_id`,`group_id`) REFERENCES `quiz`(`class_id`,`group_id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `question_attachment` (
	`question_id` text NOT NULL,
	`attachment_id` text NOT NULL,
	PRIMARY KEY(`question_id`, `attachment_id`),
	FOREIGN KEY (`question_id`) REFERENCES `dx_question`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`attachment_id`) REFERENCES `attachment`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quiz` (
	`group_id` text NOT NULL,
	`class_id` text NOT NULL,
	`gen_answer` text,
	`org_value` integer NOT NULL,
	`org_answer` text,
	`org_users` text NOT NULL,
	`submitted` integer DEFAULT 0 NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	`created` text DEFAULT current_timestamp NOT NULL,
	`modified` text DEFAULT current_timestamp NOT NULL,
	PRIMARY KEY(`group_id`, `class_id`),
	FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`class_id`) REFERENCES `class`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `quiz_attachment` (
	`group_id` text NOT NULL,
	`class_id` text NOT NULL,
	`attachment_id` text NOT NULL,
	PRIMARY KEY(`group_id`, `class_id`, `attachment_id`),
	FOREIGN KEY (`attachment_id`) REFERENCES `attachment`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`class_id`,`group_id`) REFERENCES `quiz`(`class_id`,`group_id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recorrido` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`desc` text NOT NULL,
	`gen_question` text NOT NULL,
	`created` text DEFAULT current_timestamp NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`teacher_id` text NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `source` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`details` text NOT NULL,
	`extra_details` text,
	`rating` integer NOT NULL,
	`dx_question_id` text NOT NULL,
	FOREIGN KEY (`dx_question_id`) REFERENCES `dx_question`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_group` (
	`user_id` text NOT NULL,
	`group_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `group_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`emailVerified` integer,
	`image` text,
	`role` text DEFAULT 'user' NOT NULL,
	`last_seen` text DEFAULT current_timestamp NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `authenticator_credentialID_unique` ON `authenticator` (`credentialID`);--> statement-breakpoint
CREATE UNIQUE INDEX `class_entercode_unique` ON `class` (`entercode`);--> statement-breakpoint
CREATE UNIQUE INDEX `codeIdx` ON `class` (`entercode`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);
