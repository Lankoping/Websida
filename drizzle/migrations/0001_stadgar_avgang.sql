CREATE TABLE "stadgar" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"signatures" text DEFAULT '{}' NOT NULL,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "avgangs_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"namn" text NOT NULL,
	"pnr" text NOT NULL,
	"roll" text NOT NULL,
	"orsak" text NOT NULL,
	"datum" timestamp NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"pdf_url" text,
	"reviewed_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "stadgar" ADD CONSTRAINT "stadgar_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "avgangs_requests" ADD CONSTRAINT "avgangs_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
