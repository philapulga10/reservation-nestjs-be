CREATE TYPE "public"."reward_tx_type" AS ENUM('EARN', 'REDEEM', 'ADJUST');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "admin_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text,
	"action" text NOT NULL,
	"metadata" json DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_email" text,
	"action" text NOT NULL,
	"collection_name" text NOT NULL,
	"object_id" text NOT NULL,
	"before" json,
	"after" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"user_email" text NOT NULL,
	"hotel_id" text NOT NULL,
	"hotel_name" text NOT NULL,
	"num_days" integer NOT NULL,
	"num_rooms" integer NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"is_cancelled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotels" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"rating" numeric(3, 1) NOT NULL,
	"image" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reward_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"actor_id" text,
	"type" "reward_tx_type" DEFAULT 'EARN' NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"points" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"reason" text NOT NULL,
	"metadata" json DEFAULT '{}' NOT NULL,
	"correlation_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "role" DEFAULT 'USER' NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"last_logout_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_history" ADD CONSTRAINT "reward_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_history" ADD CONSTRAINT "reward_history_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_reward_history_user_date" ON "reward_history" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_reward_history_type_date" ON "reward_history" USING btree ("type","date");--> statement-breakpoint
CREATE INDEX "idx_reward_history_actor_date" ON "reward_history" USING btree ("actor_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "uid_reward_history_corr" ON "reward_history" USING btree ("correlation_id");