ALTER TABLE "bookings" ALTER COLUMN "total_price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "hotels" ALTER COLUMN "price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "hotels" ALTER COLUMN "rating" SET DATA TYPE numeric(3, 1);