ALTER TYPE "public"."order_status" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "razorpay_order_id" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "razorpay_payment_id" varchar(255);