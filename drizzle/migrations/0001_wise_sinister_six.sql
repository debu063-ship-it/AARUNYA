ALTER TABLE "order_items" ALTER COLUMN "size" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sizes" json DEFAULT '["XS","S","M","L","XL","XXL"]'::json;