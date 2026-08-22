ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "colors" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "color" varchar(64);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_courier" varchar(64) DEFAULT 'Delhivery';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "waybill" varchar(64);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_label_url" varchar(512);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delhivery_status" varchar(128);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "estimated_delivery_date" timestamp with time zone;
