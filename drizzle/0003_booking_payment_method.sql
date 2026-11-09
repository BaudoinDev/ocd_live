CREATE TYPE "public"."payment_method" AS ENUM('mobile_money', 'card');--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_method" "payment_method";