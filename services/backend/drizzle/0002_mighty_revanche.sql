ALTER TABLE "settings" ADD COLUMN "is_open" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "opening_hours" text DEFAULT '' NOT NULL;