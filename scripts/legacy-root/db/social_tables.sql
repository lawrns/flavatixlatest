-- Social Features Tables for Flavatix

-- Likes table for tasting posts
CREATE TABLE IF NOT EXISTS "public"."tasting_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tasting_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tasting_likes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tasting_likes_unique" UNIQUE ("user_id", "tasting_id")
);

-- Comments table for tasting posts
CREATE TABLE IF NOT EXISTS "public"."tasting_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tasting_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tasting_comments_pkey" PRIMARY KEY ("id")
);

-- Shares table for tasting posts
CREATE TABLE IF NOT EXISTS "public"."tasting_shares" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tasting_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tasting_shares_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tasting_shares_unique" UNIQUE ("user_id", "tasting_id")
);

-- Follow relationships
CREATE TABLE IF NOT EXISTS "public"."user_follows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "follower_id" "uuid" NOT NULL,
    "following_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_follows_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_follows_unique" UNIQUE ("follower_id", "following_id"),
    CONSTRAINT "no_self_follow" CHECK ("follower_id" != "following_id")
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_tasting_likes_tasting_id" ON "public"."tasting_likes" USING "btree" ("tasting_id");
CREATE INDEX IF NOT EXISTS "idx_tasting_likes_user_id" ON "public"."tasting_likes" USING "btree" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_tasting_comments_tasting_id" ON "public"."tasting_comments" USING "btree" ("tasting_id");
CREATE INDEX IF NOT EXISTS "idx_tasting_comments_user_id" ON "public"."tasting_comments" USING "btree" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_tasting_shares_tasting_id" ON "public"."tasting_shares" USING "btree" ("tasting_id");
CREATE INDEX IF NOT EXISTS "idx_tasting_shares_user_id" ON "public"."tasting_shares" USING "btree" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_follows_follower_id" ON "public"."user_follows" USING "btree" ("follower_id");
CREATE INDEX IF NOT EXISTS "idx_user_follows_following_id" ON "public"."user_follows" USING "btree" ("following_id");

-- Row Level Security
ALTER TABLE "public"."tasting_likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tasting_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tasting_shares" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_follows" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasting_likes
CREATE POLICY "tasting_likes_select_policy" ON "public"."tasting_likes" FOR SELECT TO "authenticated" USING (true);
CREATE POLICY "tasting_likes_insert_policy" ON "public"."tasting_likes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "tasting_likes_delete_policy" ON "public"."tasting_likes" FOR DELETE USING (("auth"."uid"() = "user_id"));

-- RLS Policies for tasting_comments
CREATE POLICY "tasting_comments_select_policy" ON "public"."tasting_comments" FOR SELECT TO "authenticated" USING (true);
CREATE POLICY "tasting_comments_insert_policy" ON "public"."tasting_comments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "tasting_comments_update_policy" ON "public"."tasting_comments" FOR UPDATE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "tasting_comments_delete_policy" ON "public"."tasting_comments" FOR DELETE USING (("auth"."uid"() = "user_id"));

-- RLS Policies for tasting_shares
CREATE POLICY "tasting_shares_select_policy" ON "public"."tasting_shares" FOR SELECT TO "authenticated" USING (true);
CREATE POLICY "tasting_shares_insert_policy" ON "public"."tasting_shares" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "tasting_shares_delete_policy" ON "public"."tasting_shares" FOR DELETE USING (("auth"."uid"() = "user_id"));

-- RLS Policies for user_follows
CREATE POLICY "user_follows_select_policy" ON "public"."user_follows" FOR SELECT TO "authenticated" USING (true);
CREATE POLICY "user_follows_insert_policy" ON "public"."user_follows" FOR INSERT WITH CHECK (("auth"."uid"() = "follower_id"));
CREATE POLICY "user_follows_delete_policy" ON "public"."user_follows" FOR DELETE USING (("auth"."uid"() = "follower_id"));

-- Foreign key constraints
ALTER TABLE ONLY "public"."tasting_likes" ADD CONSTRAINT "tasting_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."tasting_likes" ADD CONSTRAINT "tasting_likes_tasting_id_fkey" FOREIGN KEY ("tasting_id") REFERENCES "public"."quick_tastings"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."tasting_comments" ADD CONSTRAINT "tasting_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."tasting_comments" ADD CONSTRAINT "tasting_comments_tasting_id_fkey" FOREIGN KEY ("tasting_id") REFERENCES "public"."quick_tastings"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."tasting_shares" ADD CONSTRAINT "tasting_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."tasting_shares" ADD CONSTRAINT "tasting_shares_tasting_id_fkey" FOREIGN KEY ("tasting_id") REFERENCES "public"."quick_tastings"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_follows" ADD CONSTRAINT "user_follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."user_follows" ADD CONSTRAINT "user_follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- Update triggers for updated_at columns
CREATE OR REPLACE TRIGGER "update_tasting_comments_updated_at" BEFORE UPDATE ON "public"."tasting_comments" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

-- Grant permissions
GRANT ALL ON TABLE "public"."tasting_likes" TO "anon";
GRANT ALL ON TABLE "public"."tasting_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."tasting_likes" TO "service_role";

GRANT ALL ON TABLE "public"."tasting_comments" TO "anon";
GRANT ALL ON TABLE "public"."tasting_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."tasting_comments" TO "service_role";

GRANT ALL ON TABLE "public"."tasting_shares" TO "anon";
GRANT ALL ON TABLE "public"."tasting_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."tasting_shares" TO "service_role";

GRANT ALL ON TABLE "public"."user_follows" TO "anon";
GRANT ALL ON TABLE "public"."user_follows" TO "authenticated";
GRANT ALL ON TABLE "public"."user_follows" TO "service_role";
