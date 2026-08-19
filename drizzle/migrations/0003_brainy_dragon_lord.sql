CREATE TYPE "public"."suggestion_status" AS ENUM('open', 'reviewed', 'planned', 'done');--> statement-breakpoint
CREATE TYPE "public"."suggestion_type" AS ENUM('new_design', 'different_fabric', 'other');--> statement-breakpoint
CREATE TABLE "suggestion_upvotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"suggestion_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suggestions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "suggestion_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"product_id" integer,
	"fabric_or_material" varchar(255),
	"upvote_count" integer DEFAULT 0 NOT NULL,
	"status" "suggestion_status" DEFAULT 'open' NOT NULL,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "suggestion_upvotes_suggestion_user_idx" ON "suggestion_upvotes" USING btree ("suggestion_id","user_id");