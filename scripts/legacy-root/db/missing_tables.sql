-- Missing tables for Flavatix project
-- Apply this SQL in your Supabase SQL Editor

-- Create quick_reviews table
CREATE TABLE IF NOT EXISTS "public"."quick_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "item_name" character varying(255) NOT NULL,
    "picture_url" "text",
    "batch_lot_barcode" character varying(255),
    "category" character varying(100) NOT NULL,
    "production_date" "date",
    "aroma_notes" "text",
    "aroma_intensity" integer,
    "salt_score" integer,
    "salt_notes" "text",
    "umami_score" integer,
    "spiciness_score" integer,
    "spiciness_notes" "text",
    "acidity_score" integer,
    "acidity_notes" "text",
    "sweetness_score" integer,
    "sweetness_notes" "text",
    "flavor_notes" "text",
    "flavor_intensity" integer,
    "texture_notes" "text",
    "typicity_score" integer,
    "complexity_score" integer,
    "other_notes" "text",
    "overall_score" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "quick_reviews_acidity_score_check" CHECK ((("acidity_score" >= 1) AND ("acidity_score" <= 100))),
    CONSTRAINT "quick_reviews_aroma_intensity_check" CHECK ((("aroma_intensity" >= 1) AND ("aroma_intensity" <= 100))),
    CONSTRAINT "quick_reviews_complexity_score_check" CHECK ((("complexity_score" >= 1) AND ("complexity_score" <= 100))),
    CONSTRAINT "quick_reviews_flavor_intensity_check" CHECK ((("flavor_intensity" >= 1) AND ("flavor_intensity" <= 100))),
    CONSTRAINT "quick_reviews_overall_score_check" CHECK ((("overall_score" >= 1) AND ("overall_score" <= 100))),
    CONSTRAINT "quick_reviews_salt_score_check" CHECK ((("salt_score" >= 1) AND ("salt_score" <= 100))),
    CONSTRAINT "quick_reviews_spiciness_score_check" CHECK ((("spiciness_score" >= 1) AND ("spiciness_score" <= 100))),
    CONSTRAINT "quick_reviews_sweetness_score_check" CHECK ((("sweetness_score" >= 1) AND ("sweetness_score" <= 100))),
    CONSTRAINT "quick_reviews_umami_score_check" CHECK ((("umami_score" >= 1) AND ("umami_score" <= 100)))
);

-- Create prose_reviews table
CREATE TABLE IF NOT EXISTS "public"."prose_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "item_name" character varying(255) NOT NULL,
    "picture_url" "text",
    "batch_lot_barcode" character varying(255),
    "category" character varying(100) NOT NULL,
    "production_date" "date",
    "review_content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Add primary keys
ALTER TABLE ONLY "public"."quick_reviews"
    ADD CONSTRAINT "quick_reviews_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."prose_reviews"
    ADD CONSTRAINT "prose_reviews_pkey" PRIMARY KEY ("id");

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_quick_reviews_user_id" ON "public"."quick_reviews" USING "btree" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_quick_reviews_category" ON "public"."quick_reviews" USING "btree" ("category");
CREATE INDEX IF NOT EXISTS "idx_quick_reviews_created_at" ON "public"."quick_reviews" USING "btree" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_prose_reviews_user_id" ON "public"."prose_reviews" USING "btree" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_prose_reviews_category" ON "public"."prose_reviews" USING "btree" ("category");
CREATE INDEX IF NOT EXISTS "idx_prose_reviews_created_at" ON "public"."prose_reviews" USING "btree" ("created_at" DESC);

-- Add foreign key constraints
ALTER TABLE ONLY "public"."quick_reviews"
    ADD CONSTRAINT "quick_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."prose_reviews"
    ADD CONSTRAINT "prose_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- Add Row Level Security (RLS) policies
ALTER TABLE "public"."quick_reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."prose_reviews" ENABLE ROW LEVEL SECURITY;

-- Policies for quick_reviews
CREATE POLICY "Users can view own quick reviews" ON "public"."quick_reviews" FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can insert own quick reviews" ON "public"."quick_reviews" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can update own quick reviews" ON "public"."quick_reviews" FOR UPDATE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can delete own quick reviews" ON "public"."quick_reviews" FOR DELETE USING (("auth"."uid"() = "user_id"));

-- Policies for prose_reviews
CREATE POLICY "Users can view own prose reviews" ON "public"."prose_reviews" FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can insert own prose reviews" ON "public"."prose_reviews" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can update own prose reviews" ON "public"."prose_reviews" FOR UPDATE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can delete own prose reviews" ON "public"."prose_reviews" FOR DELETE USING (("auth"."uid"() = "user_id"));

-- Add triggers for updating timestamps
CREATE OR REPLACE TRIGGER "update_quick_reviews_updated_at" 
    BEFORE UPDATE ON "public"."quick_reviews" 
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_prose_reviews_updated_at" 
    BEFORE UPDATE ON "public"."prose_reviews" 
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Add triggers for updating review counts in profiles
CREATE OR REPLACE TRIGGER "quick_reviews_count_trigger" 
    AFTER INSERT OR DELETE ON "public"."quick_reviews" 
    FOR EACH ROW EXECUTE FUNCTION "public"."update_reviews_count"();

CREATE OR REPLACE TRIGGER "prose_reviews_count_trigger" 
    AFTER INSERT OR DELETE ON "public"."prose_reviews" 
    FOR EACH ROW EXECUTE FUNCTION "public"."update_reviews_count"();

-- Grant permissions
GRANT SELECT ON TABLE "public"."quick_reviews" TO "anon";
GRANT ALL ON TABLE "public"."quick_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."quick_reviews" TO "service_role";

GRANT SELECT ON TABLE "public"."prose_reviews" TO "anon";
GRANT ALL ON TABLE "public"."prose_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."prose_reviews" TO "service_role";