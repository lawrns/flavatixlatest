-- Create study_templates table for storing user-defined study configurations
CREATE TABLE IF NOT EXISTS "public"."study_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    "name" "text" NOT NULL,
    "base_category" "text" NOT NULL,
    "categories" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id")
);

-- Enable RLS
ALTER TABLE "public"."study_templates" ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own templates" ON "public"."study_templates"
    FOR SELECT USING ("auth"."uid"() = "user_id");

CREATE POLICY "Users can insert their own templates" ON "public"."study_templates"
    FOR INSERT WITH CHECK ("auth"."uid"() = "user_id");

CREATE POLICY "Users can update their own templates" ON "public"."study_templates"
    FOR UPDATE USING ("auth"."uid"() = "user_id");

CREATE POLICY "Users can delete their own templates" ON "public"."study_templates"
    FOR DELETE USING ("auth"."uid"() = "user_id");

-- Grant permissions
GRANT ALL ON TABLE "public"."study_templates" TO "postgres";
GRANT ALL ON TABLE "public"."study_templates" TO "anon";
GRANT ALL ON TABLE "public"."study_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."study_templates" TO "service_role";
