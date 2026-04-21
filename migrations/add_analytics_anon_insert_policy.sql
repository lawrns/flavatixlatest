-- Allow anon and authenticated roles to insert analytics events
-- Required after switching /api/analytics/event from service_role to anon key.
-- The INSERT-only scope with no SELECT means this is safe: unauthenticated
-- clients can write events but cannot read any data from this table.

CREATE POLICY "Allow anon analytics inserts"
  ON public.analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated analytics inserts"
  ON public.analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
