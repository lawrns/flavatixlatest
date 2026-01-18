-- Grant necessary permissions to authenticated users for competition tables
GRANT ALL ON TABLE public.competition_item_metadata TO authenticated;
GRANT ALL ON TABLE public.competition_answer_keys TO authenticated;
GRANT ALL ON TABLE public.competition_responses TO authenticated;

-- Also ensure service_role has access (usually does, but for completeness)
GRANT ALL ON TABLE public.competition_item_metadata TO service_role;
GRANT ALL ON TABLE public.competition_answer_keys TO service_role;
GRANT ALL ON TABLE public.competition_responses TO service_role;

-- Grant usage on sequences if any (though these tables use uuid primary keys with gen_random_uuid())
